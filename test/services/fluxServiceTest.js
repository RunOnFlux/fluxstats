const chai = require('chai');

const service = require('../../src/services/fluxService');

chai.use(require('chai-json-schema'));

module.exports = () => {
  describe('Flux Service Test', () => {
    it('Should get flux node list and return response data', async () => {
      const response = await service.getFluxNodeList();
      chai.expect(response.data.result).to.not.be.null;
    });
  });
};