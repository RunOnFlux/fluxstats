const fluxService = require('./services/fluxService');

module.exports = (app) => {
  // GET methods
  app.get('/storedlocations', (req, res) => {
    fluxService.getAllGeolocation(req, res);
  });
  app.get('/fluxinfo', (req, res) => {
    fluxService.getAllFluxInformation(req, res);
  });
  app.get('/fluxhistory/ip/:ip?', (req, res) => {
    fluxService.getFluxIPHistory(req, res);
  });
};
