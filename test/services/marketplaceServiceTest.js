const chai = require('chai');

const service = require('../../src/services/marketplaceService');

chai.use(require('chai-json-schema'));

module.exports = () => {
  describe('Marketplace Service Test', () => {
    it('Should return data of application', async () => {
      const req = {};
      const res = {
        json: (data) => JSON.stringify(data),
      };
      chai.expect(service.listApps(req, res));
    });
  });
};
