export function getTicker(keys) {
  let tickers: string = `${keys[0]}`;

  keys.slice(1).forEach(key => {
    tickers += ',' + key;
  })
  return tickers;
}
