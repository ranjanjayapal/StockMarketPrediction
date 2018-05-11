import { Component, OnInit } from '@angular/core';
import {ServerService} from '../home/home.service';
import * as d31 from 'd3';
import * as d3 from 'd3-selection';
import * as d3Scale from 'd3-scale';
import * as d3Shape from 'd3-shape';
import * as d3Array from 'd3-array';
import * as d3Axis from 'd3-axis';
declare var $: any;
import { Chart } from 'angular-highcharts';
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
  predictedGraph = '';
  closingValue = '';
  graph = '';
  companyCode = '';
  highchart: any;
  constructor(private data: ServerService) {}
  ngOnInit() {
    const x_axis_ticks_fig1 = [];
    const y_axis_ticks_fig1 = [];
    const arr_data_fig1 = [];
    this.data.prediction_message.subscribe(predictionMessage => {
      if (predictionMessage['predictedValue'] !== undefined) {
        this.val = 1;
        let chartOptions = {};
        this.predictedValue = predictionMessage['predictedValue'];
        this.predictedYear = predictionMessage['yearPredicted'];
        const dataset = predictionMessage['dataset'];
        this.companyName = dataset.name;
        this.companyCode = dataset.dataset_code;
        this.closingValue = dataset.data[dataset.data.length - 1][4];
        this.predictedYear = predictionMessage['yearToPredict'];
        for (let j = 0; j < dataset.data.length; j++) {
          x_axis_ticks_fig1[j] = dataset.data[j][0];
          y_axis_ticks_fig1[j] = dataset.data[j][4];
        }
        x_axis_ticks_fig1.length = dataset.data.length + 1;
        y_axis_ticks_fig1.length = dataset.data.length + 1;
        arr_data_fig1.length = dataset.data.length + 1;
        const yearPredictingFor = this.predictedYear.toString() + '-01-01';
        x_axis_ticks_fig1[dataset.data.length] = yearPredictingFor;
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
      }
    });
  }
}
