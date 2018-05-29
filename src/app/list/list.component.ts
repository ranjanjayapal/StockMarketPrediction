import {Component, OnInit, Sanitizer, SecurityContext} from '@angular/core';
import {BrowserModule, DomSanitizer, SafeHtml, SafeResourceUrl, SafeScript} from '@angular/platform-browser';

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
  selector: 'app-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.css']
})
export class ListComponent implements OnInit {
  public loading = true;
  public val = 0;
  companyData = [];
  current_company_data = [];
  clicked_company_name = '';
  clickedCompanyNameIndex;
  messages: any;
  chart: any;
  company_names = [];
  show_current_stock_closing_price = '';
  show_current_stock_opening_price = '';
  show_current_stock_highest_price = '';
  show_current_stock_lowest_price = '';
  show_current_stock_volume = '';
  data_object_fig1: any;
  noYears = 0;
  noMonths = 0;
  prediction_for = 'Choose';
  date: any;
  private margin = {top: 20, right: 20, bottom: 30, left: 50};
  private width: number;
  private height: number;
  private x: any;
  private y: any;
  public svg: any;
  private line: d3Shape.Line<[number, number]>;
  constructor(private data: ServerService, private sanitizer: DomSanitizer) { }
  ngOnInit() {
    this.val = 0;
    this.data.currentMessage.subscribe(message => {this.messages = message;
      if (message['companies'] !== undefined) {
        setTimeout(() => {
          this.val = 1;
        }, 1500);

        for (let i = 0; i < message['companies'].length; i++) {
          this.company_names[i] = message['companies'][i].name;
          this.companyData[i] = {
            'name': message['companies'][i].name,
            'code': message['companies'][i].dataset_code,
            'data': message['companies'][i].data
          };
        }

        if (this.company_names.length > message['companies'].length) {
          let j = message['companies'].length;
          while (j < this.company_names.length) {
            this.company_names.splice(j, 1);
            this.companyData.splice(j, 1);
            j++;
          }
        }
      }
    });
    this.width = 900 - this.margin.left - this.margin.right;
    this.height = 500 - this.margin.top - this.margin.bottom;

    this.chart = new Chart({
      chart: {
        height: 600,
        type: 'line',
        zoomType: 'xy'
      },
      title: {
        text: 'Time Series Chart'
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
      colors: ['#f7a35c', '#2591D7', '#D72530', '#2CE762', '#CFE515']
    });
  }

  // Runs when one of the companies are clicked.
  show_stockprice(index) {
    const arr_data_fig1 = [];
    const x_axis_ticks_fig1 = [];
    const y_axis_ticks_fig1 = [];
    this.clicked_company_name = this.company_names[index];
    this.clickedCompanyNameIndex = index;
    this.date = new Date().toLocaleDateString();
    for (const i of this.companyData) {
      if (this.clicked_company_name === i['name']) {
        this.show_current_stock_opening_price = i['data'][i['data'].length - 1][1];
        this.show_current_stock_closing_price = i['data'][i['data'].length - 1][4];
        this.show_current_stock_highest_price = i['data'][i['data'].length - 1][2];
        this.show_current_stock_lowest_price = i['data'][i['data'].length - 1][3];
        this.show_current_stock_volume = i['data'][i['data'].length - 1][5];
        this.current_company_data = i['data'];
        for (let j = 0; j < i['data'].length; j++) {
          x_axis_ticks_fig1[j] = i['data'][j][0];
          y_axis_ticks_fig1[j] = i['data'][j][4];
        }
      }
    }

    for (let i = 0; i < x_axis_ticks_fig1.length; i++) {
      arr_data_fig1[i] = [new Date(x_axis_ticks_fig1[i]), y_axis_ticks_fig1[i]];
    }

    let exists = 0;
    for (let i = 0; i < this.chart.options.series.length; i++) {
      if (this.chart.options.series[i].id === this.clicked_company_name) {
        exists = 1;
      }
    }
    if (exists === 0) {
      this.chart.addSerie({
        id: this.clicked_company_name,
        name: this.clicked_company_name + 'Time series Chart',
        data: arr_data_fig1
      });
    }
  }

  pass_data_prediction() {
    const map = new Object();
    map['companyData'] = this.clicked_company_name;

    if (this.noYears !== 0) {
      map['years'] = this.noYears;
    } else {
      map['months'] = this.noMonths;
    }
    console.log(map);
    this.data.predictionServers(map).subscribe(
      (response) => {
        const jsonResult = response.json();
        this.data.changePredictionMessage(jsonResult);
      },
      (error) => console.log(error)
    );
  }

  showModal() {
    $('#future-enhancement').modal('show');
  }
}
