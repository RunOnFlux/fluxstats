const chai = require('chai');
const LRU = require('lru-cache');

const service = require('../../src/services/fluxService');
const serviceHelper = require('../../src/services/serviceHelper');
const config = require('../../config/default');

chai.use(require('chai-json-schema'));

// *** Used if test case with server on is running
// const LRUoptions = {
//   max: 50, // store 50 values, we shall not have more values at any period
//   ttl: 1000 * 60 * 60, // 1 hour
// };
// const myCache = new LRU(LRUoptions);

module.exports = () => {
  describe('Flux Service Test', () => {
    // *** Special test case to run server
    // it('Should start process', async () => {
    //   chai.expect(service.start());
    // });

    it('Should return flux node list', async () => {
      const response = await service.getFluxNodeList();
      chai.expect(response).to.not.be.null;
    });

    const nodes = [[{ ip: '192.168.0.1' }], []];
    for (const value of nodes) {
      it('Should return flux node ips', async () => {
        const response = await service.getFluxNodeIPs(value);
        chai.expect(response).to.not.be.null;
      });
    }

    const ips = [{ ip: '38.242.236.226', res: '38.242.236.226' }, { ip: '192.168.0.1', res: false }];
    for (const value of ips) {
      it('Should return flux node geolocation', async () => {
        const response = await service.getFluxNodeGeolocation(value.ip);
        chai.expect(response).to.not.be.null;
        if (value.res) {
          chai.expect(response.ip).to.equal(value.res);
        }
      });
    }

    const fluxInfoData = [{ ip: '38.242.236.226', res: 'true' }, { ip: '192.168.0.1', res: false }];
    for (const value of fluxInfoData) {
      it('Should return flux information', async () => {
        try {
          const response = await service.getFluxInformation(value.ip, 1000000);
          chai.expect(response).to.not.be.null;
          if (value.res) {
            chai.expect(response.daemon).to.not.be.null;
          }
        } catch (e) {
          // Expected timeout when IP is not avail
        }
      });
    }

    const appHashesData = [{ ip: '38.242.236.226', res: 'true' }, { ip: '192.168.0.1', res: false }];
    for (const value of appHashesData) {
      it('Should return app hashes', async () => {
        const response = await service.getFluxAppsHashes(value.ip, 1000000);
        chai.expect(response).to.not.be.null;
        if (!value.res) {
          chai.expect(response).to.equal(value.res);
        }
      });
    }

    const syncHeightData = [{ ip: '38.242.236.226', res: 'true' }, { ip: '192.168.0.1', res: false }];
    for (const value of syncHeightData) {
      it('Should return flux sync height', async () => {
        const response = await service.getFluxSyncedHeight(value.ip, 1000000);
        chai.expect(response).to.not.be.null;
        if (!value.res) {
          chai.expect(response).to.equal(value.res);
        }
      });
    }

    const getConnectionsOutData = [{ ip: '38.242.236.226', res: 'true' }, { ip: '192.168.0.1', res: false }];
    for (const value of getConnectionsOutData) {
      it('Should return connection out data', async () => {
        const response = await service.getConnectionsOut(value.ip, 1000000);
        chai.expect(response).to.not.be.null;
        if (!value.res) {
          chai.expect(response).to.equal(value.res);
        }
      });
    }

    const getConnectionsInData = [{ ip: '38.242.236.226', res: 'true' }, { ip: '192.168.0.1', res: false }];
    for (const value of getConnectionsInData) {
      it('Should return connection in data', async () => {
        const response = await service.getConnectionsIn(value.ip, 1000000);
        chai.expect(response).to.not.be.null;
        if (!value.res) {
          chai.expect(response).to.equal(value.res);
        }
      });
    }

    it('Should return collateral info', async () => {
      const response = await service.getCollateralInfo('12345678901, 2)');
      chai.expect(response).to.deep.equal({ txhash: '1', txindex: 2 });
    });

    // *** Special test case if server running is enabled
    // it('Should create and drop bootstrap flux collection', async () => {
    //   await service.bootstrapFluxCollection('1654316207606');
    //   const db = await serviceHelper.connectMongoDb(`mongodb://${config.database.url}:${config.database.port}/`);
    //   const database = db.db(config.database.local.database);
    //   const collection = 'fluxes1654316207606';
    //   const res = await serviceHelper.dropCollection(database, collection);
    //   chai.expect(res).to.not.be.null;
    // });

    // *** Special test case if server running is enabled
    // it('Should create history stats', async () => {
    //   await service.createHistoryStats();
    //   chai.expect(myCache.get('historyStats')).to.be.not.null;
    // });

    it('Should process flux nodes', async () => {
      chai.expect(await service.processFluxNode({ ip: '38.242.236.226:16127', collateral: '12345678901, 2)' }, '1654316207606', 1000000000));
    });

    it('Should process geolocation batch refresh database', async () => {
      service.getGeolocationInBatchAndRefreshDatabase();
      const db = await serviceHelper.connectMongoDb(`mongodb://${config.database.url}:${config.database.port}/`);
      const database = db.db(config.database.local.database);
      const collection = 'geolocation';
      const res = await serviceHelper.countInDatabase(database, collection, null);
      chai.expect(res).to.be.at.least(0);
    });

    // *** Special test case if server running is enabled
    // it('Should process flux nodes', async () => {
    //   service.processFluxNodes();
    //   const db = await serviceHelper.connectMongoDb(`mongodb://${config.database.url}:${config.database.port}/`);
    //   const database = db.db(config.database.local.database);
    //   const collection = 'fluxes';
    //   const res = await serviceHelper.countInDatabase(database, collection, null);
    //   chai.expect(res).to.be.at.least(0);
    // });

    it('Should process geolocation', async () => {
      const req = {};
      const res = {
        json: (data) => JSON.stringify(data),
      };
      chai.expect(service.getAllGeolocation(req, res));
    });

    it('Should process get last round', async () => {
      chai.expect(service.getLastRound()).to.be.not.null;
    });

    it('Should process get all flux information', async () => {
      const req = { params: 'ip,addedHeight', query: { projection: 'ip,addedHeight' } };
      const res = {
        json: (data) => JSON.stringify(data),
      };
      chai.expect(service.getAllFluxInformation(req, res));
    });

    it('Should process get all flux version', async () => {
      const req = {};
      const res = {
        json: (data) => JSON.stringify(data),
      };
      chai.expect(service.getAllFluxVersions(req, res));
    });

    it('Should process get all flux geolocation', async () => {
      const req = {};
      const res = {
        json: (data) => JSON.stringify(data),
      };
      chai.expect(service.getAllFluxGeolocation(req, res));
    });

    it('Should process get all flux ip history', async () => {
      const req = { params: { ip: '38.242.236.226' }, query: { ip: '38.242.236.226' } };
      const res = {
        json: (data) => JSON.stringify(data),
      };
      chai.expect(service.getFluxIPHistory(req, res));
    });

    it('Should process get completed rounds timestamp', async () => {
      const req = {};
      const res = {
        json: (data) => JSON.stringify(data),
      };
      chai.expect(service.getCompletedRoundsTimestamps(req, res));
    });

    it('Should process flux node history stats', async () => {
      const req = {};
      const res = {
        json: (data) => JSON.stringify(data),
      };
      chai.expect(service.fluxNodesHistoryStats(req, res));
    });
  });
};
