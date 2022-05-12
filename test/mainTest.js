const config = require('config');
const app = require('../src/lib/server');
const log = require('../src/lib/log');

const fluxEndpointsTest = require('./fluxEndpointsTest');
const uiFluxEndpointsTest = require('./fluxUIEndpointsTest');

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
    });
});