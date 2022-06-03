const request = require('supertest');
const chai = require('chai');

chai.use(require('chai-json-schema'));

const fluxHistoryStats = require('./schemas/fluxHistoryStats');
const fluxInfoProjection1 = require('./schemas/fluxInfoProjection1');
const fluxInfoProjection2 = require('./schemas/fluxInfoProjection2');
const fluxInfoProjection3 = require('./schemas/fluxInfoProjection3');
const fluxInfoProjection4 = require('./schemas/fluxInfoProjection4');
const fluxInfoProjection5 = require('./schemas/fluxInfoProjection5');
const fluxInfoProjection6 = require('./schemas/fluxInfoProjection6');
const fluxInfoProjection7 = require('./schemas/fluxInfoProjection7');
const fluxInfoProjection8 = require('./schemas/fluxInfoProjection8');
const fluxInfoProjection9 = require('./schemas/fluxInfoProjection9');

module.exports = (server) => {
  describe('Flux UI Endpoints Test', () => {
    it('9. should receive status 200 on /fluxinfo?projection=ip,tier,geolocation,benchmark,node,flux and return 0 when server is running', (done) => {
      request(server)
        .get('/fluxinfo?projection=ip,tier,geolocation,benchmark,node,flux')
        .expect(200)
        .end((err, res) => {
          if (err) {
            done(-1);
          }
          chai.expect(res.body).to.be.jsonSchema(
            fluxInfoProjection1,
          );
          done(0);
        });
    });
    it('10. should receive status 200 on /fluxhistorystats and return 0 when server is running', (done) => {
      request(server)
        .get('/fluxhistorystats')
        .expect(200)
        .end((err, res) => {
          if (err) {
            done(-1);
          }
          chai.expect(res.body).to.be.jsonSchema(
            fluxHistoryStats,
          );
          done(0);
        });
    });
    it('11. should receive status 200 on /fluxinfo?projection=node,flux,appsHashesTotal and return 0 when server is running', (done) => {
      request(server)
        .get('/fluxinfo?projection=node,flux,appsHashesTotal')
        .expect(200)
        .end((err, res) => {
          if (err) {
            done(-1);
          }
          chai.expect(res.body).to.be.jsonSchema(
            fluxInfoProjection2,
          );
          done(0);
        });
    });
    it('12. should receive status 200 on /fluxinfo?projection=node,flux,geolocation,tier and return 0 when server is running', (done) => {
      request(server)
        .get('/fluxinfo?projection=node,flux,geolocation,tier')
        .expect(200)
        .end((err, res) => {
          if (err) {
            done(-1);
          }
          chai.expect(res.body).to.be.jsonSchema(
            fluxInfoProjection3,
          );
          done(0);
        });
    });
    it('13. should receive status 200 on /fluxinfo?projection=ip,apps and return 0 when server is running', (done) => {
      request(server)
        .get('/fluxinfo?projection=ip,apps')
        .expect(200)
        .end((err, res) => {
          if (err) {
            done(-1);
          }
          chai.expect(res.body).to.be.jsonSchema(
            fluxInfoProjection4,
          );
          done(0);
        });
    });
    it('14. should receive status 200 on /fluxinfo?projection=ip,collateralIndex,collateralHash,appsHashesTotal,hashesPresent,addedHeight,lastPaidHeight,confirmedHeight,lastConfirmedHeight,scannedHeight and return 0 when server is running', (done) => {
      request(server)
        .get('/fluxinfo?projection=ip,collateralIndex,collateralHash,appsHashesTotal,hashesPresent,addedHeight,lastPaidHeight,confirmedHeight,lastConfirmedHeight,scannedHeight')
        .expect(200)
        .end((err, res) => {
          if (err) {
            done(-1);
          }
          chai.expect(res.body).to.be.jsonSchema(
            fluxInfoProjection5,
          );
          done(0);
        });
    });
    it('15. should receive status 200 on /fluxinfo?projection=ip,connectionsOut,connectionsIn and return 0 when server is running', (done) => {
      request(server)
        .get('/fluxinfo?projection=ip,connectionsOut,connectionsIn')
        .expect(200)
        .end((err, res) => {
          if (err) {
            done(-1);
          }
          chai.expect(res.body).to.be.jsonSchema(
            fluxInfoProjection6,
          );
          done(0);
        });
    });
    it('16. should receive status 200 on /fluxinfo?projection=ip,geolocation and return 0 when server is running', (done) => {
      request(server)
        .get('/fluxinfo?projection=ip,geolocation')
        .expect(200)
        .end((err, res) => {
          if (err) {
            done(-1);
          }
          chai.expect(res.body).to.be.jsonSchema(
            fluxInfoProjection7,
          );
          done(0);
        });
    });
    it('17. should receive status 200 on /fluxinfo?projection=ip,activeSince,dataCollectedAt and return 0 when server is running', (done) => {
      request(server)
        .get('/fluxinfo?projection=ip,activeSince,dataCollectedAt')
        .expect(200)
        .end((err, res) => {
          if (err) {
            done(-1);
          }
          chai.expect(res.body).to.be.jsonSchema(
            fluxInfoProjection8,
          );
          done(0);
        });
    });
    it('18. should receive status 200 on /fluxinfo?projection=ip,daemon,benchmark,flux and return 0 when server is running', (done) => {
      request(server)
        .get('/fluxinfo?projection=ip,daemon,benchmark,flux')
        .expect(200)
        .end((err, res) => {
          if (err) {
            done(-1);
          }
          chai.expect(res.body).to.be.jsonSchema(
            fluxInfoProjection9,
          );
          done(0);
        });
    });
  });
};
