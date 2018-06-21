import { Component, OnInit } from '@angular/core';
import {ServerService} from '../home/home.service';
import * as d31 from 'd3';
import * as d3 from 'd3-selection';
import * as d3Scale from 'd3-scale';
import * as d3Shape from 'd3-shape';
import * as d3Array from 'd3-array';
import * as d3Axis from 'd3-axis';
import * as moment from 'moment';
import { Router } from '@angular/router';
declare var $: any;
import { Chart } from 'angular-highcharts';
import {Globals} from '../globals';
@Component({
  selector: 'app-prediction',
  templateUrl: './prediction.component.html',
  styleUrls: ['./prediction.component.css']
})
export class PredictionComponent implements OnInit {
  public val = 0;
  companyName = '';
  predictedValue = '';
  predictedYear = '';
  predictedMonth = '';
  predictedMonthName = '';
  predictedGraph = '';
  closingValue = '';
  graph = '';
  companyCode = '';
  highchart: any;
  sentimentPositives = '';
  sentimentNegatives = '';
  recommendedCompanyName = '';
  recommendedCompanyValue = 0;
  constructor(private data: ServerService, private router: Router, private globals: Globals) {}
  ngOnInit() {
    const x_axis_ticks_fig1 = [];
    const y_axis_ticks_fig1 = [];
    const arr_data_fig1 = [];
    this.data.prediction_message.subscribe(predictionMessage => {
      if (predictionMessage['predictedValue'] !== undefined) {
        this.val = 1;
        let chartOptions = {};
        this.predictedValue = predictionMessage['predictedValue'];
        const dataset = predictionMessage['dataset'];
        this.sentimentPositives = predictionMessage['sentiment-result-positives'];
        this.sentimentNegatives = predictionMessage['sentiment-result-negatives'];
        this.companyName = dataset.name;
        this.companyCode = dataset.dataset_code;
        this.closingValue = dataset.data[dataset.data.length - 1][4];
        this.predictedYear = predictionMessage['yearToPredict'];
        this.predictedMonth = predictionMessage['monthToPredict'];
        const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
          'July', 'August', 'September', 'October', 'November', 'December'
        ];
        this.predictedMonthName = monthNames[parseInt(this.predictedMonth, 10) - 1];
        for (let j = 0; j < dataset.data.length; j++) {
          x_axis_ticks_fig1[j] = dataset.data[j][0];
          y_axis_ticks_fig1[j] = dataset.data[j][4];
        }
        x_axis_ticks_fig1.length = dataset.data.length + 1;
        y_axis_ticks_fig1.length = dataset.data.length + 1;
        arr_data_fig1.length = dataset.data.length + 1;
        let yearPredictingFor = '';
        let monthPredictingFor = '';
        if (this.predictedYear !== '') {
          yearPredictingFor = this.predictedYear.toString() + '-01-01';
          x_axis_ticks_fig1[dataset.data.length] = yearPredictingFor;
        } else {
          monthPredictingFor = moment().format('YYYY') + '-' + this.predictedMonth.toString() + '-01';
          x_axis_ticks_fig1[dataset.data.length] = monthPredictingFor;
        }
        y_axis_ticks_fig1[dataset.data.length] = this.predictedValue;

        for (let i = 0; i < x_axis_ticks_fig1.length; i++) {
          arr_data_fig1[i] = [new Date(x_axis_ticks_fig1[i]), y_axis_ticks_fig1[i]];
        }
        chartOptions = {
          chart: {
            height: 600,
            type: 'line',
            zoomType: 'xy'
          },
          title: {
            text: 'Time Series'
          },
          credits: {
            enabled: false
          },
          xAxis: {
            type: 'datetime',
            title: {
              text: 'Date'
            }
          },
          yAxis: {
            title: {
              text: 'Stock Price ($)'
            }
          },
          colors: ['#f7a35c', '#2591D7', '#D72530', '#2CE762', '#CFE515'],
          series: [{
            name: 'Stock Market Time Series',
            data: arr_data_fig1
          }]
        };
        this.highchart = new Chart(chartOptions);
        this.globals.predictedSoFar.push({
          'companyName': this.companyName,
          'closingValue': this.closingValue,
          'predictedValue': this.predictedValue
        });
        this.recommendedCompany(this.globals.predictedSoFar);
      }
    });
  }

  recommendedCompany(predictedSoFar) {
    let max = 0;
    let index = 0;
    let maxdiff = 0;
    for (let i=0; i<predictedSoFar.length; i++) {
      let diff = predictedSoFar[i].predictedValue - predictedSoFar[i].closingValue;
      if (diff > maxdiff) {
        console.log('inside if');
        max = predictedSoFar[i].predictedValue;
        maxdiff = diff;
        index = i;
      }
    }
    this.recommendedCompanyName = predictedSoFar[index].companyName;
    this.recommendedCompanyValue = maxdiff;
  }

  removeBehaviourSubject() {
    let dummyJson = new Object();
    dummyJson['predictedValue'] = undefined;
    this.data.changePredictionMessage(dummyJson);
    this.router.navigate(['/list']);
  }
}
