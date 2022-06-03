const chai = require('chai');

const service = require('../../src/services/kadenaService');

chai.use(require('chai-json-schema'));

module.exports = () => {
  describe('Kadena Service Test', () => {
    it('Should return kadena app locations node', async () => {
      const response = await service.kadenaAppLocationsNode();
      chai.expect(response.data).to.not.be.null;
      chai.expect(response.status).to.equal('success');
    });

    it('Should return kadena app location', async () => {
      const response = await service.kadenaAppLocations();
      chai.expect(response.data).to.not.be.null;
      chai.expect(response.status).to.equal('success');
    });

    it('Should return nodes', async () => {
      const response = await service.getNodes();
      chai.expect(response.data).to.not.be.null;
      chai.expect(response.status).to.equal('success');
    });

    it('Should return kadena nodes', async () => {
      const req = {};
      const res = {
        json: (data) => JSON.stringify(data),
      };
      const response = await service.getKadenaNodes(req, res);
      chai.expect(response.data).to.not.be.null;
      chai.expect(response.status).to.equal('success');
    });

    it('Should run process KDA', async () => {
      chai.expect(service.processKDA(req, res));
    });
  });
};
