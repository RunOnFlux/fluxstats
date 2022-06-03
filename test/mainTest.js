const config = require('config');
const app = require('../src/lib/server');
const log = require('../src/lib/log');

const uiFluxEndpointsTest = require('./ui/fluxUIEndpointsTest');
const fluxEndpointsTest = require('./ui/fluxEndpointsTest');

const serviceHelperTest = require('./services/serviceHelperTest');
const marketplaceServiceTest = require('./services/marketplaceServiceTest');
const kadenaServiceTest = require('./services/kadenaServiceTest');
const fluxServices = require('../src/services/fluxService');

const server = app.listen(config.server.port, () => {
  log.info(`Flux API listening on port ${config.server.port}!`);
});

describe('Main Test', () => {
  describe('Executing Test Cases', async () => {
    before(async () => {
      await fluxServices.start();
    });
    after((done) => {
      server.close(done);
      setTimeout(() => {
        process.exit();
      }, 10000);
    });
    await fluxEndpointsTest(server);
    await uiFluxEndpointsTest(server);
    await serviceHelperTest();
    await marketplaceServiceTest();
    await kadenaServiceTest();
  });
});
