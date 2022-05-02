const request = require('supertest');
const config = require('config');
const chai = require('chai');
const app = require('../src/lib/server');
const log = require('../src/lib/log');

const fluxServices = require('../src/services/fluxService');

const server = app.listen(config.server.port, () => {
    log.info(`Flux API listening on port ${config.server.port}!`);
});

describe('Server Test', () => {
    describe('Start Server', () => {
        before(async () => {
            await fluxServices.start();
        });
        after((done) => {
            server.close(done);
            setTimeout(() => {
                process.exit();
            }, 10000);
        });
        it('should receive status 200 and return 0 when server is running', (done) => {
            request(server)
                .get('/fluxversions')
                .expect(200)
                .end((err, res) => {
                    if (err) {
                        return done(-1);
                    }
                    return done(0);
                });
        });
    });
});