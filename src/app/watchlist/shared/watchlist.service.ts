import { Injectable } from '@angular/core';
import { LastPriceModel, LocalStorageWatchlistModel, WatchlistModel } from './watchlist.model';
import { DetailsModel } from '../../details/shared/details.model';
import { HttpClient } from '@angular/common/http';
import { getTicker } from '../../util.module';

@Injectable({
  providedIn: 'root'
})
export class WatchlistService {
  private object: { [Key: string]: string } = {};
  loader: Promise<boolean>;

  constructor(private http: HttpClient) {}

  get(): LocalStorageWatchlistModel<WatchlistModel> {
    if (localStorage.hasOwnProperty('watchlist')){
      return JSON.parse(localStorage.watchlist);
    }
    localStorage.watchlist = JSON.stringify({});
    return JSON.parse(localStorage.watchlist);
  }

  add(details: DetailsModel): void {
    const { ticker, companyName, last, change, changePercent } = details;
    this.object[ticker] = JSON.stringify({
      ticker,
      companyName,
      lastPrice: last,
      change,
      changePercent
    });
    localStorage.watchlist = JSON.stringify(this.object);
  }

  remove(ticker: string): void {
    this.object = JSON.parse(localStorage.watchlist);
    delete this.object[ticker];
    localStorage.watchlist = JSON.stringify(this.object);
  }

  getModelData(): WatchlistModel[] {
    if (!localStorage.hasOwnProperty('watchlist')) {
      this.loader = Promise.resolve(true);
      return undefined;
    }

    const modelData: WatchlistModel[] = [];
    const sortedKeys: string[] = [];
    this.object = JSON.parse(localStorage.watchlist);

    for (const key in this.object) {
      if (this.object.hasOwnProperty(key)) {
        sortedKeys.push(key);
      }
    }

    if (!sortedKeys.length) {
      this.loader = Promise.resolve(true);
      return undefined;
    }

    this.updateLocalStorage(sortedKeys);

    sortedKeys.sort().forEach(key => {
      modelData.push(JSON.parse(this.object[key]));
    });

    return modelData;
  }

  updateLocalStorage(keys: string[]): void {
    this.http.get<LastPriceModel[]>(`/api/lastPrices/${getTicker(keys)}`).subscribe(resp => {
      this.object = JSON.parse(localStorage.watchlist);
      resp.forEach(d => {
        if (!this.object.hasOwnProperty(d.ticker)) {
          return;
        }
        let val: WatchlistModel = JSON.parse(this.object[d.ticker]);
        val = {
          ticker: d.ticker,
          companyName: val.companyName,
          lastPrice: d.last,
          change: d.change,
          changePercent: d.changePercent
        };
        this.object[d.ticker] = JSON.stringify(val);
      });
      this.loader = Promise.resolve(true);
      localStorage.watchlist = JSON.stringify(this.object);
    }, err => {
      console.log(err);
      this.loader = Promise.resolve(true);
    });
  }

}
