const apicache = require('apicache');
const path = require('path');
const fluxService = require('./services/fluxService');
const kadenaService = require('./services/kadenaService');

const cache = apicache.middleware;

module.exports = (app) => {
  // GET methods
  app.get('/storedlocations', cache('5 minutes'), (req, res) => {
    fluxService.getAllGeolocation(req, res);
  });
  // strings of projection wanted
  app.get('/fluxinfo/:projection?', cache('10 minutes'), (req, res) => {
    fluxService.getAllFluxInformation(req, res);
  });
  app.get('/fluxhistory/ip/:ip?', cache('5 minutes'), (req, res) => {
    fluxService.getFluxIPHistory(req, res);
  });
  app.get('/fluxversions', cache('5 minutes'), (req, res) => {
    fluxService.getAllFluxVersions(req, res);
  });
  app.get('/fluxlocations', cache('5 minutes'), (req, res) => {
    fluxService.getAllFluxGeolocation(req, res);
  });
  app.get('/availabletimes', cache('5 minutes'), (req, res) => {
    fluxService.getCompletedRoundsTimestamps(req, res);
  });
  app.get('/fluxlocationsnow', cache('5 minutes'), (req, res) => {
    fluxService.getAllFluxGeolocationNow(req, res);
  });
  // get last month of history stats
  app.get('/fluxhistorystats', cache('5 minutes'), (req, res) => {
    fluxService.fluxNodesHistoryStats(req, res);
  });

  app.get('/kadena/outdatednodes', cache('5 minutes'), (req, res) => {
    kadenaService.outdatedNodes(req, res);
  });
  app.get('/kadena/uptodatenodes', cache('5 minutes'), (req, res) => {
    kadenaService.uptodateNodes(req, res);
  });
  app.get('/kadena/allnodes', cache('5 minutes'), (req, res) => {
    kadenaService.allNodesAPI(req, res);
  });
  app.get('/kadena/availabletimes', cache('5 minutes'), (req, res) => {
    kadenaService.getCompletedRoundsTimestamps(req, res);
  });
  app.get('/kadena/history/ip/:ip?', cache('5 minutes'), (req, res) => {
    kadenaService.getKadenaIPHistory(req, res);
  });
  app.get('/kadena/history/account/:account?', cache('5 minutes'), (req, res) => {
    kadenaService.getKadenaAccountHistory(req, res);
  });
  app.get('/kadena/limitedhistory/ip/:ip?/:days?', cache('5 minutes'), (req, res) => {
    kadenaService.getKadenaIPHistoryDays(req, res);
  });
  app.get('/kadena/limitedhistory/account/:account?/:days?', cache('5 minutes'), (req, res) => {
    kadenaService.getKadenaAccountHistoryDays(req, res);
  });
  app.get('/kadena/nodes/:timestamp?', cache('5 minutes'), (req, res) => {
    kadenaService.getKadenaNodesForTimestamp(req, res);
  });
  app.get('/kadena/eligible/:days?', cache('5 minutes'), (req, res) => {
    kadenaService.getKadenaEligibleDays(req, res);
  });
  app.get('/kadena/eligiblestats/:days?', cache('30 minutes'), (req, res) => {
    kadenaService.getKadenaEligibleStatsDays(req, res);
  });
  app.get('/kadena/availabletimes', cache('5 minutes'), (req, res) => {
    kadenaService.getCompletedRoundsTimestamps(req, res);
  });

  app.get('/kadena', cache('5 minutes'), (req, res) => {
    res.sendFile(path.join(__dirname, './kdaUI/index.html'));
  });

  app.get('/hashes', cache('1 minute'), (req, res) => {
    res.sendFile(path.join(__dirname, './fluxHashes'));
  });
};
