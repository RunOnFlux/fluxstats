const request = require('supertest');

module.exports = (server) => {
    describe('Flux UI Endpoints Test', () => {
        it('9. should receive status 200 on /fluxinfo?projection=ip,tier,geolocation,benchmark,node,flux and return 0 when server is running', (done) => {
            request(server)
                .get('/fluxinfo?projection=ip,tier,geolocation,benchmark,node,flux')
                .expect(200)
                .end((err, res) => {
                    if (err) {
                        return done(-1);
                    }
                    return done(0);
                });
        });
        it('10. should receive status 200 on /fluxhistorystats and return 0 when server is running', (done) => {
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
        it('11. should receive status 200 on /fluxinfo?projection=node,flux,appsHashesTotal and return 0 when server is running', (done) => {
            request(server)
                .get('/fluxinfo?projection=node,flux,appsHashesTotal')
                .expect(200)
                .end((err, res) => {
                    if (err) {
                        return done(-1);
                    }
                    return done(0);
                });
        });
        it('12. should receive status 200 on /fluxinfo?projection=node,flux,geolocation,tier and return 0 when server is running', (done) => {
            request(server)
                .get('/fluxinfo?projection=node,flux,geolocation,tier')
                .expect(200)
                .end((err, res) => {
                    if (err) {
                        return done(-1);
                    }
                    return done(0);
                });
        });
        it('13. should receive status 200 on /fluxinfo?projection=ip,apps and return 0 when server is running', (done) => {
            request(server)
                .get('/fluxinfo?projection=ip,apps')
                .expect(200)
                .end((err, res) => {
                    if (err) {
                        return done(-1);
                    }
                    return done(0);
                });
        });
        it('14. should receive status 200 on /fluxinfo?projection=ip,collateralIndex,collateralHash,appsHashesTotal,hashesPresent,addedHeight,lastPaidHeight,confirmedHeight,lastConfirmedHeight,scannedHeight and return 0 when server is running', (done) => {
            request(server)
                .get('/fluxinfo?projection=ip,collateralIndex,collateralHash,appsHashesTotal,hashesPresent,addedHeight,lastPaidHeight,confirmedHeight,lastConfirmedHeight,scannedHeight')
                .expect(200)
                .end((err, res) => {
                    if (err) {
                        return done(-1);
                    }
                    return done(0);
                });
        });
        it('15. should receive status 200 on /fluxinfo?projection=ip,connectionsOut,connectionsIn and return 0 when server is running', (done) => {
            request(server)
                .get('/fluxinfo?projection=ip,connectionsOut,connectionsIn')
                .expect(200)
                .end((err, res) => {
                    if (err) {
                        return done(-1);
                    }
                    return done(0);
                });
        });
        it('16. should receive status 200 on /fluxinfo?projection=ip,geolocation and return 0 when server is running', (done) => {
            request(server)
                .get('/fluxinfo?projection=ip,geolocation')
                .expect(200)
                .end((err, res) => {
                    if (err) {
                        return done(-1);
                    }
                    return done(0);
                });
        });
        it('17. should receive status 200 on /fluxinfo?projection=ip,activeSince,dataCollectedAt and return 0 when server is running', (done) => {
            request(server)
                .get('/fluxinfo?projection=ip,activeSince,dataCollectedAt')
                .expect(200)
                .end((err, res) => {
                    if (err) {
                        return done(-1);
                    }
                    return done(0);
                });
        });
        it('18. should receive status 200 on /fluxinfo?projection=ip,daemon,benchmark,flux and return 0 when server is running', (done) => {
            request(server)
                .get('/fluxinfo?projection=ip,daemon,benchmark,flux')
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