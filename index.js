'use strict';

const express = require('express');
const path = require('path');

const router = require('./routes/router');

const app = express();

app.use('/api', router);
app.use(express.static(path.join(__dirname, 'dist/StockSearch')));

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist/StockSearch/index.html'));
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`App listening on port ${PORT}`);
    console.log('Press Ctrl+C to quit.');
});

module.exports = app;
