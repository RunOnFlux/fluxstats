const chai = require('chai');

const service = require('../../src/services/kadenaService');

chai.use(require('chai-json-schema'));

module.exports = () => {
    describe('Kadena Service Test', () => {
        it('41. should run process kadena app locations node and return data', async () => {
            const response = await service.kadenaAppLocationsNode();
            chai.expect(response.data).to.not.be.null;
            chai.expect(response.status).to.equal('success');
        });

        it('42. should run process kadena app location and return data', async () => {
            const response = await service.kadenaAppLocations();
            chai.expect(response.data).to.not.be.null;
            chai.expect(response.status).to.equal('success');
        });

        it('43. should run process nodes and return data', async () => {
            const response = await service.getNodes();
            chai.expect(response.data).to.not.be.null;
            chai.expect(response.status).to.equal('success');
        });

        it('44. should return kadena nodes', async () => {
            const req = {};
            const res = {
                json: (data) => JSON.stringify(data),
            };
            const response = await service.getKadenaNodes(req, res);
            chai.expect(response.data).to.not.be.null;
            chai.expect(response.status).to.equal('success');
        });

        it('45. should run process KDA', async () => {
            chai.expect(service.processKDA(req, res));
        });
    });   
};