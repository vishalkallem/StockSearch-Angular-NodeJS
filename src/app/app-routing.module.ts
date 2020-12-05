import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import {AutocompleteComponent} from './autocomplete/autocomplete.component';
import {DetailsComponent} from './details/details.component';
import {PortfolioComponent} from './portfolio/portfolio.component';
import {WatchlistComponent} from './watchlist/watchlist.component';

const routes: Routes = [
  {
    path: '',
    component: AutocompleteComponent
  },

  {
    path: 'details/:ticker',
    component: DetailsComponent
  },

  {
    path: 'portfolio',
    component: PortfolioComponent
  },

  {
    path: 'watchlist',
    component: WatchlistComponent
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
