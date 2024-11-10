const chai = require('chai');

const service = require('../../src/services/proposalService');
const serviceHelper = require('../../src/services/serviceHelper');
const config = require('../../config/default');

chai.use(require('chai-json-schema'));

module.exports = () => {
  describe('Proposal Service Test', () => {
    it('Should start process', async () => {
      chai.expect(await service.start());
    });

    it('Should return last proposal txn', async () => {
      const transaction = [
        {
          fees: 1,
          vin: [
            {
              addr: 't1Mzja9iJcEYeW5B4m4s1tJG8M42odFZ16A',
              value: 0,
            },
          ],
          vout: [
            {
              value: 200,
              scriptPubKey: {
                addresses: ['t1Mzja9iJcEYeW5B4m4s1tJG8M42odFZ16A'],
                asm: 'OP_RETURN asdfghjklasdfghjklsdfghjkldfghjkasdasdasdasd',
              },
            },
          ],
        },
      ];
      const response = await service.getLastProposalTxs(transaction);
      chai.expect(response).to.not.be.null;
      chai.expect(Object.keys(response).length).to.be.at.least(0);
    });

    it('Should check for missing transaction', async () => {
      service.checkForMissingTransactions();
      const db = await serviceHelper.connectMongoDb(`mongodb://${config.database.url}:${config.database.port}/`);
      const database = db.db(config.database.local.database);
      const collection = 'proposals';
      const res = await serviceHelper.countInDatabase(database, collection, null);
      chai.expect(res).to.be.at.least(0);
    });

    it('Should check for open proposals', async () => {
      service.checkOpenProposals();
      const db = await serviceHelper.connectMongoDb(`mongodb://${config.database.url}:${config.database.port}/`);
      const database = db.db(config.database.local.database);
      const collection = 'proposals';
      const res = await serviceHelper.countInDatabase(database, collection, null);
      chai.expect(res).to.be.at.least(0);
    });

    it('Should process list proposals', async () => {
      const req = {};
      const res = {
        json: (data) => JSON.stringify(data),
      };
      chai.expect(await service.listProposals(req, res));
    });

    it('Should process get price', async () => {
      const req = {};
      const res = {
        json: (data) => JSON.stringify(data),
      };
      chai.expect(await service.getPrice(req, res));
    });

    it('Should process proposal detail', async () => {
      const req = {
        params: { hash: '8a86c4eecf12446ff273afc03e1b3a09a911d0b7981db1af58cb45c439161295' },
        query: { hash: '8a86c4eecf12446ff273afc03e1b3a09a911d0b7981db1af58cb45c439161295' },
      };
      const res = {
        json: (data) => JSON.stringify(data),
      };
      chai.expect(await service.proposalDetail(req, res));
    });

    it('Should process voting information', async () => {
      const req = {
        params: { hash: '3574' },
        query: { hash: '3574' },
      };
      const res = {
        json: (data) => JSON.stringify(data),
      };
      chai.expect(await service.voteInformation(req, res));
    });

    // *** Special test case that needs proper test data in proposal db before running
    // it('Should process voting power', async () => {
    //     const response = await service.votePower('14C7r8F2ra3SyMzhaK7hHTFadSk1ByuQHR', '3574')
    //     chai.expect(response.power).to.be.not.null;
    //     chai.expect(response.nodes).to.be.not.null;
    //     chai.expect(response.power).to.be.at.least(0);
    //     chai.expect(response.nodes.length).to.be.at.least(0);
    // });

    // *** Special test case that needs proper test data in proposal db before running
    // it('Should process get voting power', async () => {
    //   const req = {
    //     params: {zelid: '14C7r8F2ra3SyMzhaK7hHTFadSk1ByuQHQ', hash: '3574'},
    //     query:  {zelid: '14C7r8F2ra3SyMzhaK7hHTFadSk1ByuQHQ', hash: '3574'},
    //   };
    //   const res = {
    //     json: (data) => JSON.stringify(data),
    //   };
    //   chai.expect(await service.getVotePower(req, res));
    // });

    it('Should process submit proposal', async () => {
      const req = {
        on: () => ({
          data: {
            topic: 'test',
            description: 'Test description for submit proposal',
            grantValue: '1',
            grantAddress: '2',
            nickName: 'test user',
          },
        }),
        end: () => {},
      };
      const res = {
        json: (data) => JSON.stringify(data),
      };
      chai.expect(await service.submitProposal(req, res));
    });

    it('Should process vote proposal', async () => {
      const req = {
        on: () => ({
          data: {
            hash: '3574',
            zelid: '14C7r8F2ra3SyMzhaK7hHTFadSk1ByuQHAQ',
            message: 'Test message for submit proposal',
            signature: 'sample',
            vote: true,
          },
        }),
        end: () => {},
      };
      const res = {
        json: (data) => JSON.stringify(data),
      };
      chai.expect(await service.submitProposal(req, res));
    });
  });
};
