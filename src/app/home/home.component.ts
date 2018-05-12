import { RouterModule } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import {ServerService} from './home.service';
import * as d3 from 'd3';
declare var $: any;
import {any} from 'codelyzer/util/function';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  public val = 0;
  constructor(private serverService: ServerService, private router: Router, private toastr: ToastrService) {
    const that = this;
    setTimeout(function() {
      that.val = 1;
    }, 2000);
  }

  investment_limit = '';
  searchName = '';
  message: any;
  disable_button = false;
  checkValidity = false;

  ngOnInit() {
    this.serverService.currentMessage.subscribe(message => {this.message = message;
      console.log(message); });
  }
  getCompanySymbol() {
    this.serverService.searchCompanySymbol(this.searchName).subscribe(
      (response) => {
        if (response.json().validity === 'valid' && response.json().type === 'insert/update') {
          this.toastr.success('Database updated', 'Added to DB!!');
        } else if (response.json().validity === 'invalid') {
          $('#stockSymbolValidity').modal('show');
        } else if (response.json().validity === 'noData') {
          $('#stockSymbolValidity').modal('show');
        }
      },
      (error) => console.log(error)
    );
  }
  onSave() {
    this.serverService.searchCompanies(this.investment_limit).subscribe(
      (response) => {
        this.serverService.changeMessage(response.json());
      },
      (error) => console.log(error)
    );
  }
}
