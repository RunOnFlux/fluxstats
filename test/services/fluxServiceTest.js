const chai = require('chai');

const service = require('../../src/services/fluxService');

chai.use(require('chai-json-schema'));

module.exports = () => {
  describe('Flux Service Test', () => {
    it('Should return flux node list', async () => {
      const response = await service.getFluxNodeList();
      chai.expect(response.data.result).to.not.be.null;
    });
  });
};