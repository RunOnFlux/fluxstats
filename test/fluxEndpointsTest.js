const request = require('supertest');

module.exports = (server) => {
    describe('Flux Endpoints Test', () => {
        it('1. should receive status 200 on /storedlocations and return 0 when server is running', (done) => {
            request(server)
                .get('/storedlocations')
                .expect(200)
                .end((err, res) => {
                    if (err) {
                        return done(-1);
                    }
                    return done(0);
                });
        });
        it('2. should receive status 200 on /fluxinfo and return 0 when server is running', (done) => {
            request(server)
                .get('/fluxinfo')
                .expect(200)
                .end((err, res) => {
                    if (err) {
                        return done(-1);
                    }
                    return done(0);
                });
        });
        it('3. should receive status 200 on /fluxhistory/ip and return 0 when server is running', (done) => {
            request(server)
                .get('/fluxhistory/ip/ip=192.160.1.1')
                .expect(200)
                .end((err, res) => {
                    if (err) {
                        return done(-1);
                    }
                    return done(0);
                });
        });
        it('4. should receive status 200 on /fluxversions and return 0 when server is running', (done) => {
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
        it('5. should receive status 200 on /fluxlocations and return 0 when server is running', (done) => {
            request(server)
                .get('/fluxlocations')
                .expect(200)
                .end((err, res) => {
                    if (err) {
                        return done(-1);
                    }
                    return done(0);
                });
        });
        it('6. should receive status 200 on /availabletimes and return 0 when server is running', (done) => {
            request(server)
                .get('/availabletimes')
                .expect(200)
                .end((err, res) => {
                    if (err) {
                        return done(-1);
                    }
                    return done(0);
                });
        });
        it('7. should receive status 200 on /fluxlocationsnow and return 0 when server is running', (done) => {
            request(server)
                .get('/fluxlocationsnow')
                .expect(200)
                .end((err, res) => {
                    if (err) {
                        return done(-1);
                    }
                    return done(0);
                });
        });
        it('8. should receive status 200 on /fluxhistorystats and return 0 when server is running', (done) => {
            request(server)
                .get('/fluxhistorystats')
                .expect(200)
                .end((err, res) => {
                    if (err) {
                        return done(-1);
                    }
                    return done(0);
                });
        });
    });
};