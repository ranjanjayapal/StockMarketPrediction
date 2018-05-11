import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { AppComponent } from './app.component';
import { HomeComponent } from './home/home.component';
import { ListComponent } from './list/list.component';
import {ServerService} from './home/home.service';
import {RouterModule, Routes} from '@angular/router';
import {HttpModule} from '@angular/http';
import {FormsModule} from '@angular/forms';
import { PredictionComponent } from './prediction/prediction.component';
import { LoadingModule } from 'ngx-loading';
import {DropdownModule} from 'ngx-dropdown';
import { ToastrModule } from 'ngx-toastr';
import { ChartModule } from 'angular-highcharts';

const appRoutes: Routes = [
  {path: '', component: HomeComponent},
  {path: 'list', component: ListComponent},
  {path: 'prediction', component: PredictionComponent}
];

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    ListComponent,
    PredictionComponent,
  ],
  imports: [
    BrowserModule,
    HttpModule,
    FormsModule,
    LoadingModule,
    DropdownModule,
    ChartModule,
    RouterModule.forRoot(appRoutes),
    BrowserAnimationsModule,
    ToastrModule.forRoot(),
  ],
  providers: [ServerService],
  bootstrap: [AppComponent]
})
export class AppModule { }
