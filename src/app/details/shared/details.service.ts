import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { DetailsModel } from './details.model';
import { NewsModel } from './news.model';
import { SummaryModel } from './summary.model';
import { ChartsModel } from './charts.model';

@Injectable({
  providedIn: 'root'
})
export class DetailsService {

  constructor(private http: HttpClient) { }

  getTopDetails(ticker: string): Observable<DetailsModel> {
    return this.http.get<DetailsModel>(`/api/details/${ticker}`);
  }

  getSummaryDetails(ticker: string): Observable<SummaryModel> {
    return this.http.get<SummaryModel>(`/api/summary/${ticker}`);
  }

  getNewsDetails(ticker: string): Observable<NewsModel[]> {
    return this.http.get<NewsModel[]>(`/api/news/${ticker}`);
  }

  getChartDetails(ticker: string): Observable<ChartsModel[]> {
    return this.http.get<ChartsModel[]>(`/api/charts/${ticker}`);
  }
}
