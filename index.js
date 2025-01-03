const http = require('http');
const config = require('config');
const app = require('./src/lib/server');
const log = require('./src/lib/log');

const fluxServices = require('./src/services/fluxService');
const kadenaService = require('./src/services/kadenaService');
const proposalService = require('./src/services/proposalService');
const generalService = require('./src/services/generalService');
const thunderService = require('./src/services/thunderService');
const permanentMessages = require('./src/services/permanentMessagesService');
const richListService = require('./src/services/richListService');

const server = http.createServer(app);

server.listen(config.server.port, () => {
  log.info(`Flux API listening on port ${config.server.port}!`);
  kadenaService.processKDA();
  fluxServices.start();
  proposalService.start();
  generalService.start();
  thunderService.processThunderNodes();
  permanentMessages.start();
  richListService.start();
});
