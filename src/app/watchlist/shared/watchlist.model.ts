export interface WatchlistModel {
  ticker: string,
  companyName: string,
  lastPrice: Number | string,
  change: Number | string,
  changePercent: string,
}

export interface LocalStorageWatchlistModel<WatchlistModel> {
  [Key: string]: WatchlistModel;
}

export interface LastPriceModel {
  ticker: string,
  last: string | Number,
  change: string | Number,
  changePercent: string
}
