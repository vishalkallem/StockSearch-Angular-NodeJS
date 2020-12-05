import { Component, OnInit } from '@angular/core';
import { WatchlistService } from './shared/watchlist.service';
import { WatchlistModel } from './shared/watchlist.model';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-watchlist',
  templateUrl: './watchlist.component.html',
  styleUrls: ['./watchlist.component.css']
})
export class WatchlistComponent implements OnInit {
  data: WatchlistModel[];

  constructor(public service: WatchlistService, private route: ActivatedRoute, private router: Router) {}

  ngOnInit(): void {
    this.data = [];
    this.get();
  }

  get(): void {
    this.data = this.service.getModelData();
  }

  remove(ticker: string): void {
    this.service.remove(ticker);
    this.get();
  }

  navigate(ticker: string): void {
    this.router.navigate(['../details', ticker], { relativeTo: this.route }).catch(err => console.log(err));
  }

}
