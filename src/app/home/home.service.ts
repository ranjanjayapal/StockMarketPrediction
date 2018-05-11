import {Injectable} from '@angular/core';
import {Http} from '@angular/http';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
@Injectable()
export class ServerService {
  constructor (private http: Http) {}

  private messageSource = new BehaviorSubject<any>({});
  private prediction_Server_Source = new BehaviorSubject<any>({});
  currentMessage = this.messageSource.asObservable();
  prediction_message = this.prediction_Server_Source.asObservable();
  changeMessage(message: any) {
    this.messageSource.next(message);
  }
  changePredictionMessage(prediction: any) {
    this.prediction_Server_Source.next(prediction);
  }
  searchCompanies(limit) {
    return this.http.get('/api/stocks/' + limit);
  }
  predictionServers(companyData: any) {
    return this.http.get('/api/prediction?companydata=' + companyData['companyData'] + '&years=' + companyData['years']);
  }
  searchCompanySymbol(companyname: any) {
    const url = '/data/searchcompany/' + companyname;
    console.log(url);
    return this.http.get(url);
  }
}
