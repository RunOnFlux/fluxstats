const chai = require('chai');

const service = require('../../src/services/kadenaService');

chai.use(require('chai-json-schema'));

module.exports = () => {
    describe('Kadena Service Test', () => {
        it('42. should return kadena nodes', async () => {
            const req = {};
            const res = {
                json: (data) => JSON.stringify(data),
            };
            const response = await service.getKadenaNodes(req, res);
            console.log(response);
            chai.expect(response).to.not.be.null;
            chai.expect(response.status).to.equal('success');
        });

        it('43. should run process KDA', async () => {
            chai.expect(service.processKDA(req, res));
        });
    });   
};