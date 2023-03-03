// const config = require('config');

const app = require('../src/lib/server');
const log = require('../src/lib/log');

// const uiFluxEndpointsTest = require('./ui/fluxUIEndpointsTest');
// const fluxEndpointsTest = require('./ui/fluxEndpointsTest');

const serviceHelperTest = require('./services/serviceHelperTest');
const marketplaceServiceTest = require('./services/marketplaceServiceTest');
const kadenaServiceTest = require('./services/kadenaServiceTest');
const fluxServiceTest = require('./services/fluxServiceTest');
const proposalServiceTest = require('./services/proposalServiceTest');
const generalServiceTest = require('./services/generalServiceTest');

// const fluxServices = require('../src/services/fluxService');

// *** Used to define server
// const server = app.listen(config.server.port, () => {
//   log.info(`Flux API listening on port ${config.server.port}!`);
// });

describe('Main Test', () => {
  describe('Executing Test Cases', () => {
    before(async () => {
      // *** Used to start server
      // await fluxServices.start();
    });
    after(() => {
      // *** Used to stop server
      // server.close(done);
      // *** Adjust timeout if ever some test cases needs time to finished
      setTimeout(() => {
        process.exit();
      }, 20000);
    });
    // *** Test cases for UI and flux endpoint testing
    // fluxEndpointsTest(server);
    // uiFluxEndpointsTest(server);
    // ***********************************************
    serviceHelperTest();
    marketplaceServiceTest();
    kadenaServiceTest();
    fluxServiceTest();
    proposalServiceTest();
    generalServiceTest();
  });
});
