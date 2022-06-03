const chai = require('chai');

const service = require('../../src/services/fluxService');

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

    const ipData = [{ip:'38.242.236.226', res:'true'},{ip:'192.168.0.1', res:false}];
    for (const value of ipData) {
      it('Should return flux information', async () => {
        const response = await service.getFluxInformation(value.ip, 1000000);
        chai.expect(response).to.not.be.null;
        if (value.res) {
          chai.expect(response.daemon).to.not.be.null;
        }
      });
    }
  });
};