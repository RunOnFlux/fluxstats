const request = require('supertest');
const chai = require('chai');

chai.use(require('chai-json-schema'));

const storedLocations = require('./schemas/storedLocations');
const fluxInfo = require('./schemas/fluxInfo');
const fluxHistory = require('./schemas/fluxHistory');
const fluxVersions = require('./schemas/fluxVersions');
const fluxLocations = require('./schemas/fluxLocations');
const availableTimes = require('./schemas/availableTimes');
const fluxLocationsNow = require('./schemas/fluxLocationsNow');
const fluxHistoryStats = require('./schemas/fluxHistoryStats');

module.exports = (server) => {
  describe('Flux Endpoints Test', () => {
    it('Should receive status 200 on /storedlocations and return 0 when server is running', (done) => {
      request(server)
        .get('/storedlocations')
        .expect(200)
        .end((err, res) => {
          if (err) {
            done(-1);
          }
          chai.expect(res.body).to.be.jsonSchema(
            storedLocations,
          );
          done(0);
        });
    });
    it('Should receive status 200 on /fluxinfo and return 0 when server is running', (done) => {
      request(server)
        .get('/fluxinfo')
        .expect(200)
        .end((err, res) => {
          if (err) {
            done(-1);
          }
          chai.expect(res.body).to.be.jsonSchema(
            fluxInfo,
          );
          done(0);
        });
    });
    it('Should receive status 200 on /fluxhistory/ip and return 0 when server is running', (done) => {
      request(server)
        .get('/fluxhistory/ip/ip=192.160.1.1')
        .expect(200)
        .end((err, res) => {
          if (err) {
            done(-1);
          }
          chai.expect(res.body).to.be.jsonSchema(
            fluxHistory,
          );
          done(0);
        });
    });
    it('Should receive status 200 on /fluxversions and return 0 when server is running', (done) => {
      request(server)
        .get('/fluxversions')
        .expect(200)
        .end((err, res) => {
          if (err) {
            done(-1);
          }
          chai.expect(res.body).to.be.jsonSchema(
            fluxVersions,
          );
          done(0);
        });
    });
    it('Should receive status 200 on /fluxlocations and return 0 when server is running', (done) => {
      request(server)
        .get('/fluxlocations')
        .expect(200)
        .end((err, res) => {
          if (err) {
            done(-1);
          }
          chai.expect(res.body).to.be.jsonSchema(
            fluxLocations,
          );
          done(0);
        });
    });
    it('Should receive status 200 on /availabletimes and return 0 when server is running', (done) => {
      request(server)
        .get('/availabletimes')
        .expect(200)
        .end((err, res) => {
          if (err) {
            done(-1);
          }
          chai.expect(res.body).to.be.jsonSchema(
            availableTimes,
          );
          done(0);
        });
    });
    it('Should receive status 200 on /fluxlocationsnow and return 0 when server is running', (done) => {
      request(server)
        .get('/fluxlocationsnow')
        .expect(200)
        .end((err, res) => {
          if (err) {
            done(-1);
          }
          chai.expect(res.body).to.be.jsonSchema(
            fluxLocationsNow,
          );
          done(0);
        });
    });
    it('Should receive status 200 on /fluxhistorystats and return 0 when server is running', (done) => {
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
  });
};
