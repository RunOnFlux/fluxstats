const apicache = require('apicache');
const fluxService = require('./services/fluxService');

const cache = apicache.middleware;

module.exports = (app) => {
  // GET methods
  app.get('/storedlocations', cache('5 minutes'), (req, res) => {
    fluxService.getAllGeolocation(req, res);
  });
  app.get('/fluxinfo', cache('10 minutes'), (req, res) => {
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
};
