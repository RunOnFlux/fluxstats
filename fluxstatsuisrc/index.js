const http = require('http');
const config = require('config');
const app = require('./src/lib/server');
const log = require('./src/lib/log');

const fluxServices = require('./src/services/fluxService');
const kadenaService = require('./src/services/kadenaService');
const proposalService = require('./src/services/proposalService');
const generalService = require('./src/services/generalService');

const server = http.createServer(app);

server.listen(config.server.port, () => {
  log.info(`Flux API listening on port ${config.server.port}!`);
  // kadenaService.start();
  fluxServices.start();
  // proposalService.start();
  generalService.start();
});
