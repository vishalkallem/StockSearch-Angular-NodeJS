import { Component, OnInit } from '@angular/core';
import { PortfolioModel } from './shared/portfolio.model';
import { ActivatedRoute, Router } from '@angular/router';
import { PortfolioService } from './shared/portfolio.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-portfolio',
  templateUrl: './portfolio.component.html',
  styleUrls: ['./portfolio.component.css']
})
export class PortfolioComponent implements OnInit {
  pm: PortfolioModel;
  data: PortfolioModel[];
  btnValue: string;
  quantity = 0;

  constructor(
    public service: PortfolioService,
    private modalService: NgbModal,
    private route: ActivatedRoute,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.data = [];
    this.get();
  }

  get(): void {
    this.data = this.service.get();
  }

  navigate(ticker: string): void {
    this.router.navigate(['../details', ticker], { relativeTo: this.route }).catch(err => console.log(err));
  }

  openModal(modal, btnValue: string, pm: PortfolioModel): void {
    this.modalService.open(modal);
    this.btnValue = btnValue;
    this.pm = pm;
  }

  closeModal(modal, buyOperation: boolean): void {
    if (this.quantity > 0 || this.quantity < this.pm.quantity) {
      const data: PortfolioModel = {
        ticker: this.pm.ticker,
        companyName: this.pm.companyName,
        quantity: +this.quantity,
        totalCost: buyOperation ? +(+this.quantity * +this.pm.currentPrice).toFixed(2) : +(+this.quantity * +(+this.pm.totalCost / +this.pm.quantity)).toFixed(2),
        currentPrice: this.pm.currentPrice,
        change: 0.00
      };
      this.service.updateStocks(data, buyOperation);
      this.get();
    }
    this.modalService.dismissAll(modal);
    this.quantity = 0;
  }

}
