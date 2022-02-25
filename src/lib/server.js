const express = require('express');
const morgan = require('morgan');
const path = require('path');
const cors = require('cors');

const nodeEnv = process.env.NODE_ENV;

const app = express();

if (nodeEnv !== 'test') {
  app.use(morgan('combined'));
}

app.use(cors({ origin: '*' }));
const fluxStatsUI = path.join(__dirname, '../fluxStatsUI');
app.use(express.static(fluxStatsUI));
require('../routes')(app);

module.exports = app;
