const chai = require('chai');
const { address } = require('zelcorejs');

const service = require('../../src/services/generalService');
const serviceHelper = require('../../src/services/serviceHelper');
const config = require('../../config/default');

chai.use(require('chai-json-schema'));

module.exports = () => {
  describe('General Service Test', () => {
    it('Should start process', async () => {
      chai.expect(service.start());
    });

    it('Should process get message phrase', async () => {
      const req = {};
      const res = {
        json: (data) => JSON.stringify(data),
      };
      await service.getMessagePhrase(req, res);
      const db = await serviceHelper.connectMongoDb(`mongodb://${config.database.url}:${config.database.port}/`);
      const database = db.db(config.database.general.database);
      const collection = 'activemessagephrases';
      const response = await serviceHelper.countInDatabase(database, collection, null);
      chai.expect(response).to.be.at.least(0);
    });

    it('Should process active message phrases', async () => {
      const req = {};
      const res = {
        json: (data) => JSON.stringify(data),
      };
      chai.expect(await service.activeMessagePhrases(req, res));
    });

    // *** Special test case that needs proper test data in activeMessagePhrases db before running
    // const messages = [{message:'abc', response:false}, {message:'asdfghjklqwertyuiopzxcvbnm', response:true}, {message:'nonExistingDatabaseData', response:false}];
    // for (const value of messages) {
    //   it('Should process message exist', async () => {
    //     chai.expect(await service.messageExists(value.message)).to.equal(value.response);
    //   });
    // }

    // *** Special test case that needs proper test data in activeMessagePhrases db before running
    // it('Should process get message phrase', async () => {
    //   const phrase = 'asdfghjklqwertyuiopzxcvbnm';
    //   await service.deleteMessagePhrase(phrase);
    //   const db = await serviceHelper.connectMongoDb(`mongodb://${config.database.url}:${config.database.port}/`);
    //   const database = db.db(config.database.general.database);
    //   const collection = 'activemessagephrases';
    //   const response = await serviceHelper.countInDatabase(database, collection, null);
    //   chai.expect(response).to.be.at.least(0);
    // });

    const zelids = [{ id: '13vxCnQ8pQiZ12xzFdTezqspqgfPEsARPX', response: true }, { id: '23vxCnQ8pQiZ12xzFdTezqspqgfPEsARPX', response: false }, { id: '13vxCnQ8pQiZ12xzFdTezqspqgfPEsAXPX', response: false }];
    for (const value of zelids) {
      it('Should process active message phrases', async () => {
        const response = await service.verifyZelID(value.id);
        chai.expect(response).to.equal(value.response);
      });
    }

    const publicKeys = [{ key: 'ca978112ca1bbdcafac231b39a23dc4da786eff8147c4e72b9807785afee48bb', response: true }, { key: 'ca978112ca1bbdcafac231b39a23dc4da786eff8147c', response: false }];
    for (const value of publicKeys) {
      it('Should process verify public key', async () => {
        const response = await service.verifyPublicKey(value.key);
        chai.expect(response).to.equal(value.response);
      });
    }

    const messages = [
      // *** Valid test case that needs proper data for message and signature
      // {
      //   message: "sampleMessagewith65UnsignedInt8Characters",
      //   signingAddress: address.privKeyToPubKey('e9873d79c6d87dc0fb6a5778633389f4453213303da61f20bd67fc233aa33262)', true),
      //   signature: 'sampleSignaturewith65UnsignedInt8Characters',
      //   strMessageMagic: 'Sample strMessageMagic',
      //   checkSegwitAlways: true,
      //   response: true
      // },
      {
        message: 'Sample message',
        signingAddress: 'Sample invalid length',
        signature: 'Sample signature',
        strMessageMagic: 'Sample strMessageMagic',
        checkSegwitAlways: true,
        response: false,
      },
      {
        message: null,
        signingAddress: 'Sample signingAddress',
        signature: 'Sample signature',
        strMessageMagic: 'Sample strMessageMagic',
        checkSegwitAlways: true,
        response: false,
      },
      {
        message: 'Sample message',
        signingAddress: null,
        signature: 'Sample signature',
        strMessageMagic: 'Sample strMessageMagic',
        checkSegwitAlways: true,
        response: false,
      },
      {
        message: 'Sample message',
        signingAddress: null,
        signature: null,
        strMessageMagic: 'Sample strMessageMagic',
        checkSegwitAlways: true,
        response: false,
      },
    ];
    for (const value of messages) {
      it('Should process verify public key', async () => {
        const response = await service.verifyMessage(value.message, value.signingAddress, value.signature, value.strMessageMagic, value.checkSegwitAlways);
        chai.expect(response).to.equal(value.response);
      });
    }

    it('Should process message hash', async () => {
      const response = await service.messageHash('test message');
      chai.expect(response).to.equal('3f0a377ba0a4a460ecb616f6507ce0d8cfa3e704025d4fda3ed0c5ca05468728');
    });
  });
};
