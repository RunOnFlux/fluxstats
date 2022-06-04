const chai = require('chai');

const service = require('../../src/services/fluxService');
const serviceHelper = require('../../src/services/serviceHelper');
const config = require('../../config/default');

chai.use(require('chai-json-schema'));

module.exports = () => {
  describe('Flux Service Test', () => {
    it('Should return flux node list', async () => {
      const response = await service.getFluxNodeList();
      chai.expect(response).to.not.be.null;
    });

    const nodes = [[{ip: '192.168.0.1'}], []];
    for (const value of nodes) {
      it('Should return flux node ips', async () => {
        const response = await service.getFluxNodeIPs(value);
        chai.expect(response).to.not.be.null;
      });
    }

    const ips = [{ip:'38.242.236.226', res:'38.242.236.226'},{ip:'192.168.0.1', res:false}];
    for (const value of ips) {
      it('Should return flux node geolocation', async () => {
        const response = await service.getFluxNodeGeolocation(value.ip);
        chai.expect(response).to.not.be.null;
        if (value.res) {
          chai.expect(response.ip).to.equal(value.res);
        }
      });
    }

    const fluxInfoData = [{ip:'38.242.236.226', res:'true'},{ip:'192.168.0.1', res:false}];
    for (const value of fluxInfoData) {
      it('Should return flux information', async () => {
        const response = await service.getFluxInformation(value.ip, 1000000);
        chai.expect(response).to.not.be.null;
        if (value.res) {
          chai.expect(response.daemon).to.not.be.null;
        }
      });
    }

    const appHashesData = [{ip:'38.242.236.226', res:'true'},{ip:'192.168.0.1', res:false}];
    for (const value of appHashesData) {
      it('Should return app hashes', async () => {
        const response = await service.getFluxAppsHashes(value.ip, 1000000);
        chai.expect(response).to.not.be.null;
        if (!value.res) {
          chai.expect(response).to.equal(value.res);
        }
      });
    }

    const syncHeightData = [{ip:'38.242.236.226', res:'true'},{ip:'192.168.0.1', res:false}];
    for (const value of syncHeightData) {
      it('Should return flux sync height', async () => {
        const response = await service.getFluxSyncedHeight(value.ip, 1000000);
        chai.expect(response).to.not.be.null;
        if (!value.res) {
          chai.expect(response).to.equal(value.res);
        }
      });
    }

    const getConnectionsOutData = [{ip:'38.242.236.226', res:'true'},{ip:'192.168.0.1', res:false}];
    for (const value of getConnectionsOutData) {
      it('Should return connection out data', async () => {
        const response = await service.getConnectionsOut(value.ip, 1000000);
        chai.expect(response).to.not.be.null;
        if (!value.res) {
          chai.expect(response).to.equal(value.res);
        }
      });
    }

    const getConnectionsInData = [{ip:'38.242.236.226', res:'true'},{ip:'192.168.0.1', res:false}];
    for (const value of getConnectionsInData) {
      it('Should return connection in data', async () => {
        const response = await service.getConnectionsIn(value.ip, 1000000);
        chai.expect(response).to.not.be.null;
        if (!value.res) {
          chai.expect(response).to.equal(value.res);
        }
      });
    }

    it('Should return connection in data', async () => {
      const response = await service.getCollateralInfo('12345678901, 2)');
      chai.expect(response).to.deep.equal({ txhash: '1', txindex: 2 });
    });

    it('Should create and drop bootstrap flux collection', async () => {
      await service.bootstrapFluxCollection('1654316207606');
      const db = await serviceHelper.connectMongoDb(`mongodb://${config.database.url}:${config.database.port}/`);
      const database = db.db(config.database.local.database);
      const collection = 'fluxes1654316207606';
      const res = await serviceHelper.dropCollection(database, collection);
      chai.expect(res).to.not.be.null;
    });
  });
};