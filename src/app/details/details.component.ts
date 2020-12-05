import {Component, OnDestroy, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {DetailsService} from './shared/details.service';
import {DetailsModel} from './shared/details.model';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {WatchlistService} from '../watchlist/shared/watchlist.service';
import {PortfolioService} from '../portfolio/shared/portfolio.service';
import {PortfolioModel} from '../portfolio/shared/portfolio.model';
import {SummaryModel} from './shared/summary.model';
import * as HighCharts from 'highcharts/highstock';
import {Options} from 'highcharts/highcharts.src';

@Component({
  selector: 'app-details',
  templateUrl: './details.component.html',
  styleUrls: ['./details.component.css'],
  providers: [DetailsService]
})
export class DetailsComponent implements OnInit, OnDestroy {
  private interval: number;
  private refreshDetails: Function;

  ticker: string;
  marketStatus: boolean;
  topDetails: DetailsModel;
  summaryData: SummaryModel;
  pageLoaded: Promise<boolean>;

  quantity: Number = 0;
  isFavorite = false;
  dataLoaded = false;
  watchlistMessage = '';
  portfolioMessage = '';

  historicalChartData: [string, Number, Number, Number, Number][] = [];
  historicalChartVolume: [string, Number][] = [];

  highCharts: typeof HighCharts = HighCharts;
  chartOptions: Options;

  constructor(
    private route: ActivatedRoute,
    private service: DetailsService,
    private modalService: NgbModal,
    private watchlistService: WatchlistService,
    private portfolioService: PortfolioService
  ) {
  }

  ngOnInit(): void {
    this.ticker = this.route.snapshot.params.ticker.toUpperCase();
    if (this.watchlistService.get().hasOwnProperty(this.ticker)) {
      this.isFavorite = true;
    }

    this.refreshDetails = () => {
      this.service.getTopDetails(this.ticker).subscribe(data => {
        this.topDetails = data;
        this.marketStatus = this.topDetails.marketOpenStatus;
        if (!this.marketStatus) {
          clearInterval(this.interval);
        }
        this.service.getSummaryDetails(this.ticker).subscribe(summaryData => {
          this.summaryData = summaryData;
          this.chartOptions = {
            time: {
              useUTC: false,
            },
            rangeSelector: {
              enabled: false
            },
            series: [
              {
                data: summaryData.dailyData,
                name: this.ticker,
                color: +this.topDetails.change > 0 ? 'green' : +this.topDetails.change < 0 ? 'red' : 'black',
                type: 'line',
                tooltip: {
                  valueDecimals: 2
                }
              }
            ]
          };
          this.dataLoaded = true;
        }, err => {
          console.log(err);
          this.dataLoaded = true;
          clearInterval(this.interval);
        });
      }, err => {
        console.log(err);
        this.topDetails = null;
        this.dataLoaded = true;
        clearInterval(this.interval);
      });
    };

    (() => {
      this.refreshDetails();
      this.pageLoaded = Promise.resolve(true);
    })();

    this.interval = setInterval(() => {
      this.refreshDetails();
    }, 15000);

    this.service.getChartDetails(this.ticker).subscribe(data => {
      data.forEach(d => {
        this.historicalChartData.push([d[0], d[1], d[2], d[3], d[4]]);
        this.historicalChartVolume.push([d[0], d[5]]);
      });
    }, err => console.log(err));
  }

  buyStocks(modal) {
    this.portfolioMessage = this.ticker.toUpperCase() + ' bought successfully!';
    setTimeout(() => this.portfolioMessage = '', 5000);
    const portfolioData: PortfolioModel = {
      ticker: this.topDetails.ticker,
      companyName: this.topDetails.companyName,
      quantity: this.quantity,
      totalCost: +(+this.quantity * +this.topDetails.last).toFixed(2),
      currentPrice: +this.topDetails.last,
      change: 0.00
    };
    this.portfolioService.updateStocks(portfolioData);
    this.closeModal(modal);
  }

  updateWatchlist() {
    this.isFavorite = !this.isFavorite;
    if (this.isFavorite) {
      this.watchlistService.add(this.topDetails);
      this.watchlistMessage = this.ticker.toUpperCase() + ' added to Watchlist.';
      setTimeout(() => this.watchlistMessage = '', 5000);
    }
    if (!this.isFavorite) {
      this.watchlistService.remove(this.ticker);
      this.watchlistMessage = this.ticker.toUpperCase() + ' removed from Watchlist.';
      setTimeout(() => this.watchlistMessage = '', 5000);
    }
  }

  openModal(modal) {
    this.modalService.open(modal);
  }

  closeModal(modal) {
    this.modalService.dismissAll(modal);
    this.quantity = 0;
  }

  ngOnDestroy(): void {
    clearInterval(this.interval);
  }

}
