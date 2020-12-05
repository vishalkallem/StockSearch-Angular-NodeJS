export interface SummaryModel {
  description: string,
  startDate: string,
  high: Number | string,
  low: Number | string,
  open: Number | string,
  close: Number | string,
  volume: string,
  mid: string,
  askPrice: Number | string,
  askSize: Number | string,
  bidSize: Number | string,
  bidPrice: Number | string,
  dailyData: [
    string, Number
  ][]
}
