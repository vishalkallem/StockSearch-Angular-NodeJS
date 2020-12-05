'use strict';
const express = require('express');
const axios = require('axios');
const keys = require('./keys');

const router = express.Router();

function getAutoCompleteResponse(data) {
    let response = [];

    if (data.hasOwnProperty('response')) {
        return {
            'code': 404,
            'response': response
        };
    }

    data.forEach(d => {
        if (d.name && d.ticker) {
            response.push({
                'ticker': d.ticker,
                'name': d.name
            });
        }
    });

    return {
        'code': 200,
        'response': response
    };
}

router.get('/autocomplete/:query', async (req, res) => {
    const query = req.params.query;
    let url = `https://api.tiingo.com/tiingo/utilities/search/${query}?token=${keys.TiingoAPIToken}`;

    let data = await axios({
        method: 'GET',
        url
    }).then(response => response.data).catch(error => error);

    let { code, response } = getAutoCompleteResponse(data);

    res.status(code).send(response).end();
});

function getDetailsResponse(companyData, priceData) {
    let response = {};

    if (companyData.hasOwnProperty('response') || priceData.hasOwnProperty('response')) {
        return {
            'code': 404,
            'response': response
        };
    }

    let currentTime = new Date();

    response = {
        'ticker': companyData.ticker,
        'companyName': companyData.name,
        'exchangeCode': companyData.exchangeCode,
        'last': priceData.last,
        'change': (priceData.last - priceData.prevClose).toFixed(2),
        'changePercent': `${(100 * (priceData.last - priceData.prevClose) / priceData.prevClose).toFixed(2)}%`,
        'timestamp': currentTime,
        'marketOpenStatus': (currentTime.getTime()-new Date(priceData.timestamp).getTime())/1000 < 60,
        'prevOpenTimestamp': priceData.timestamp,
    };

    return {
        code: 200,
        response: response
    };
}

async function getCombinedData(ticker) {
    let companyUrl = `https://api.tiingo.com/tiingo/daily/${ticker}?token=${keys.TiingoAPIToken}`;
    let priceUrl = `https://api.tiingo.com/iex/?tickers=${ticker}&token=${keys.TiingoAPIToken}`;

    let companyData = await axios({
        method: 'GET',
        url: companyUrl,
    }).then(response => response.data).catch(error => error);

    let priceData = await axios({
        method: 'GET',
        url: priceUrl,
    }).then(response => response.data[0]).catch(error => error);

    return {
        companyData,
        priceData
    };
}

router.get('/details/:ticker', async (req, res) => {
    const ticker = req.params.ticker;
    let { companyData, priceData } = await getCombinedData(ticker);

    let { code, response } = getDetailsResponse(companyData, priceData);

    res.status(code).send(response).end();
});

async function getSummaryResponse(companyData, priceData) {
    let response = {}
    let dailyChartsData = []

    if (companyData.hasOwnProperty('response') || priceData.hasOwnProperty('response')) {
        return {
            'code': 404,
            'response': response
        };
    }

    let url = `https://api.tiingo.com/iex/${companyData.ticker}/prices?startDate=${priceData.timestamp.substr(0, 10)}&resampleFreq=4min&token=${keys.TiingoAPIToken}`;

    let highchartsData = await axios({
        method: 'GET',
        url
    }).then(resp => resp.data).catch(err => err);

    highchartsData.forEach(d => {
        dailyChartsData.push([
            new Date(d.date).getTime(),
            Number(d.close)
        ]);
    });

    response = {
        'description': companyData.description,
        'startDate': companyData.startDate,
        'high': priceData.high,
        'low': priceData.low,
        'open': priceData.open,
        'close': priceData.prevClose,
        'volume': priceData.volume,
        'mid': priceData.mid ? priceData.mid: '-',
        'askPrice': priceData.askPrice,
        'askSize': priceData.askSize,
        'bidSize': priceData.bidSize,
        'bidPrice': priceData.bidPrice,
        'dailyData': dailyChartsData
    };

    return {
        code: 200,
        response: response,
    };

}

router.get('/summary/:ticker', async (req, res) => {
    const ticker = req.params.ticker;

    let { companyData, priceData } = await getCombinedData(ticker);

    let { code, response } = await getSummaryResponse(companyData, priceData);

    res.status(code).send(response).end();
});

function getNewsResponse(data) {
    let response = [];

    if (data.hasOwnProperty('response')) {
        return {
            code: 404,
            response: response
        };
    }

    data.articles.forEach(d => {
        if (d.url && d.title && d.description && d.source && d.urlToImage && d.publishedAt) {
            response.push({
                'url': d.url,
                'title': d.title,
                'description': d.description,
                'source': d.source.name,
                'image': d.urlToImage,
                'publishedAt': d.publishedAt,
            });
        }
    });

    return {
        code: 200,
        response: response
    };
}

router.get('/news/:ticker', async (req, res) => {
    const ticker = req.params.ticker;

    let url = `https://newsapi.org/v2/everything?apiKey=${keys.NewsAPIToken}&q=${ticker}`;

    let data = await axios({
        method: 'GET',
        url,
    }).then(response => response.data).catch(error => error);

    let { code, response } = getNewsResponse(data);

    res.status(code).send(response).end();
});

function getHighchartsResponse(data) {
    let response = [];

    if (data.hasOwnProperty('response')) {
        return {
            code: 404,
            response: response
        };
    }

    data.forEach(d => {
        response.push([
            new Date(d.date).getTime(),
            Number(d.open),
            Number(d.high),
            Number(d.low),
            Number(d.close),
            Number(d.volume)
        ]);
    });

    return {
        code: 200,
        response: response
    };
}

router.get('/charts/:ticker', async (req, res) => {
    const ticker = req.params.ticker;
    let prevDate = new Date();
    prevDate = `${prevDate.getFullYear()-2}-${prevDate.getMonth()+1}-${prevDate.getDate()}`;

    let url = `https://api.tiingo.com/tiingo/daily/${ticker}/prices?startDate=${prevDate}&resampleFreq=daily&token=${keys.TiingoAPIToken}`;

    let data = await axios({
        method: 'GET',
        url,
    }).then(response => response.data).catch(error => error);

    let { code, response } = getHighchartsResponse(data);

    res.status(code).send(response).end();
});

function getLastPriceResponse(data) {
    let response = [];

    if (data.hasOwnProperty('response')) {
        return {
            code: 404,
            response: response
        };
    }

    data.forEach(d => {
        response.push(
            {
                ticker: d.ticker,
                last: d.last,
                change: (d.last - d.prevClose).toFixed(2),
                changePercent: `${(100 * (d.last - d.prevClose) / d.prevClose).toFixed(2)}%`
            }
        );
    });

    return {
        code: 200,
        response: response
    };
}

router.get('/lastPrices/:tickers', async (req, res) => {
    let tickers = req.params.tickers;
    let url = `https://api.tiingo.com/iex/?tickers=${tickers}&token=${keys.TiingoAPIToken}`;

    let data = await axios ({
        method: 'GET',
        url
    }).then(response => response.data).catch(error => error);

    let { code, response } = getLastPriceResponse(data);

    res.status(code).send(response).end();
});


module.exports = router;
