const chai = require('chai');

const service = require('../../src/services/kadenaService');

chai.use(require('chai-json-schema'));

module.exports = () => {
  describe('Kadena Service Test', () => {
    it('Should return kadena app locations node', async () => {
      const response = await service.kadenaAppLocationsNode();
      chai.expect(response).to.not.be.null;
    });

    it('Should return kadena app location', async () => {
      const response = await service.kadenaAppLocations();
      chai.expect(response).to.not.be.null;
    });

    it('Should return nodes', async () => {
      const response = await service.getNodes();
      chai.expect(response).to.not.be.null;
    });

    it('Should run process KDA', () => {
      chai.expect(service.processKDA());
    });

    // *** Special test case if test data is already available in memory
    // it('Should return kadena nodes', async () => {
    //   const req = {};
    //   const res = {
    //     json: (data) => JSON.stringify(data),
    //   };
    //   chai.expect(service.getKadenaNodes(req, res));
    // });
  });
};
