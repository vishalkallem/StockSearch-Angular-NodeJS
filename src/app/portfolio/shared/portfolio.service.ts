import { Injectable } from '@angular/core';
import { PortfolioModel } from './portfolio.model';
import { HttpClient } from '@angular/common/http';
import { getTicker } from '../../util.module';
import { LastPriceModel } from '../../watchlist/shared/watchlist.model';

@Injectable({
  providedIn: 'root'
})
export class PortfolioService {
  loader: Promise<boolean>;

  constructor(private http: HttpClient) { }

  get(): PortfolioModel[] {
    const keys: string[] = [];
    const data: PortfolioModel[] = [];

    for (const key in localStorage) {
      if (key !== 'watchlist' && localStorage.hasOwnProperty(key)) {
        keys.push(key);
      }
    }

    if (!keys.length) {
      this.loader = Promise.resolve(true);
      return undefined;
    }

    this.fetchLastPrices(keys);

    keys.sort().forEach(key => {
      data.push(JSON.parse(localStorage[key]));
    });

    return data;
  }

  updateStocks(data: PortfolioModel, buyOperation: boolean = true): void {
    if (localStorage.hasOwnProperty(data.ticker)) {
      const pm: PortfolioModel = JSON.parse(localStorage[data.ticker]);
      pm.quantity = buyOperation ? +pm.quantity + +data.quantity : +pm.quantity - +data.quantity;
      pm.totalCost = buyOperation ? +pm.totalCost + +data.totalCost : +pm.totalCost - +data.totalCost;
      if (!pm.quantity) {
        localStorage.removeItem(pm.ticker);
        return;
      }
      localStorage[data.ticker] = JSON.stringify(pm);
      return;
    }
    localStorage[data.ticker] = JSON.stringify(data);
  }

  fetchLastPrices(keys): void {
    this.http.get<LastPriceModel[]>(`/api/lastPrices/${getTicker(keys)}`).subscribe(resp => {
      resp.forEach(d => {
        const pm: PortfolioModel = JSON.parse(localStorage[d.ticker]);
        pm.currentPrice = d.last;
        pm.change = +(+d.last - +(+pm.totalCost / +pm.quantity).toFixed(2)).toFixed(2);
        localStorage[d.ticker] = JSON.stringify(pm);
      });
      this.loader = Promise.resolve(true);
    }, err => {
      console.log(err);
      this.loader = Promise.resolve(true);
    });
  }

}
