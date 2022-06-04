const chai = require('chai');

const service = require('../../src/services/serviceHelper');
const config = require('../../config/default');

chai.use(require('chai-json-schema'));
const ObjectId = require('mongodb').ObjectID;

module.exports = () => {
  describe('Service Helper Test', (db) => {
    it('Should set timeout', () => {
      chai.expect(service.timeout(200));
    });

    it('Should return message', () => {
      chai.expect(service.createDataMessage({ message: 'hello world!' })).to.be.jsonSchema({
        status: 'success',
        message: 'hello world!',
      });
    });

    it('Should return success message', () => {
      chai.expect(service.createSuccessMessage({ message: 'this is a sample success message' }, { name: 'test' }, { code: '000' })).to.be.jsonSchema({
        status: 'success',
        message: 'this is a sample success message',
        name: 'test',
        code: '000',
      });
    });

    it('Should return warning message', () => {
      chai.expect(service.createWarningMessage({ message: 'this is a sample warning message' }, { name: 'test' }, { code: '001' })).to.be.jsonSchema({
        status: 'warning',
        message: 'this is a sample warning message',
        name: 'test',
        code: '001',
      });
    });

    const createErrorMessage = ['this is a sample error message', undefined];
    for (const value of createErrorMessage) {
      it('Should return error message', () => {
        chai.expect(service.createErrorMessage({ message: value }, { name: 'test' }, { code: '002' })).to.be.jsonSchema({
          status: 'error',
          message: value === undefined ? 'Unknown error' : value,
          name: 'test',
          code: '002',
        });
      });
    }

    const ensureBooleanTrue = [true, 1];
    for (const value of ensureBooleanTrue) {
      it('Should return true boolean', () => {
        chai.expect(service.ensureBoolean(value)).to.equal(true);
      });
    }

    const ensureBooleanFalse = [false, 0];
    for (const value of ensureBooleanFalse) {
      it('Should return false boolean', () => {
        chai.expect(service.ensureBoolean(value)).to.equal(false);
      });
    }

    const ensureNumber = [1, '1'];
    for (const value of ensureNumber) {
      it('Should return number', () => {
        chai.expect(service.ensureNumber(value)).to.equal(1);
      });
    }

    const ensureObject = [{ message: 'test' }, '{"message":"test"}'];
    for (const value of ensureObject) {
      it('Should return object', () => {
        chai.expect(service.ensureObject(value)).to.deep.equal({ message: 'test' });
      });
    }

    it('Should return db not null', () => {
      chai.expect(service.connectMongoDb(`mongodb://${config.database.url}:${config.database.port}/`)).to.not.be.null;
    });

    it('Should create collection in database', async () => {
      const db = await service.connectMongoDb(`mongodb://${config.database.url}:${config.database.port}/`);
      const database = db.db(config.database.local.database);
      const collection = 'samplecollection';
      const res = await service.createCollection(database, collection);
      chai.expect(res).to.not.be.null;
    });

    const findOneInDatabaseData1 = {
      _id: ObjectId('5f99562a09aef91cd19fbb93'),
      name: 'App1',
      description: 'Sample data that will be inserted in database',
    };
    const findOneInDatabaseData2 = {
      _id: ObjectId('5f99562a09aef91cd19fbb94'),
      name: 'App2',
      description: 'Sample data that will be inserted in database',
    };
    const findOneInDatabaseProjection = {
      projection: {
        _id: 0,
      },
    };
    const findOneInDatabaseQuery = {
      name: 'App1',
    };
    it('Should insert one and find one data from database', async () => {
      const db = await service.connectMongoDb(`mongodb://${config.database.url}:${config.database.port}/`);
      const database = db.db(config.database.local.database);
      const collection = 'samplecollection';
      service.insertOneToDatabase(database, collection, findOneInDatabaseData1);
      service.insertOneToDatabase(database, collection, findOneInDatabaseData2);
      const res = await service.findOneInDatabase(database, collection, findOneInDatabaseQuery, findOneInDatabaseProjection);
      chai.expect(res).to.deep.equal(
        {
          name: 'App1',
          description: 'Sample data that will be inserted in database',
        },
      );
    });

    const findInProjection = {
      projection: {
        _id: 0,
      },
    };
    const findInQuery = {
      name: 'App1',
    };
    it('Should find data in from database', async () => {
      const db = await service.connectMongoDb(`mongodb://${config.database.url}:${config.database.port}/`);
      const database = db.db(config.database.local.database);
      const collection = 'samplecollection';
      const res = await service.findInDatabase(database, collection, findInQuery, findInProjection);
      chai.expect(res).to.deep.equal(
        [
          {
            name: 'App1',
            description: 'Sample data that will be inserted in database',

          },
        ],
      );
    });

    const findOneInDatabaseReverseProjection = {
      projection: {
        _id: 0,
      },
    };
    const findOneInDatabaseReverseQuery = {
      name: 'App1',
    };
    it('Should find one data in reverse from database', async () => {
      const db = await service.connectMongoDb(`mongodb://${config.database.url}:${config.database.port}/`);
      const database = db.db(config.database.local.database);
      const collection = 'samplecollection';
      const res = await service.findOneInDatabaseReverse(database, collection, findOneInDatabaseReverseQuery, findOneInDatabaseReverseProjection);
      chai.expect(res).to.deep.equal(
        {
          name: 'App1',
          description: 'Sample data that will be inserted in database',
        },
      );
    });

    const findOneAndUpdateInDatabaseQuery = {
      name: 'App2',
    };
    const findOneAndUpdateInDatabaseUpdate = {
      $set: {
        name: 'App2',
        description: 'Sample updated data that will be inserted in database',
      },
    };
    const findOneAndUpdateInDatabaseProjection = {
      projection: {
        _id: 0,
      },
    };
    it('Should find one data and update in database', async () => {
      const db = await service.connectMongoDb(`mongodb://${config.database.url}:${config.database.port}/`);
      const database = db.db(config.database.local.database);
      const collection = 'samplecollection';
      service.findOneAndUpdateInDatabase(database, collection, findOneAndUpdateInDatabaseQuery, findOneAndUpdateInDatabaseUpdate, findOneAndUpdateInDatabaseProjection);
      const res = await service.findOneInDatabase(database, collection, findOneAndUpdateInDatabaseQuery, findOneAndUpdateInDatabaseProjection);
      chai.expect(res).to.deep.equal(
        {
          name: 'App2',
          description: 'Sample updated data that will be inserted in database',
        },
      );
    });

    const updateInDatabaseQuery = {
      $set: {
        name: 'App2',
        description: 'Sample in new updated data that will be inserted in database',
      },
    };
    const updateInDatabaseProjection = {
      projection: {
        _id: 0,
      },
    };
    it('Should update one data in database', async () => {
      const db = await service.connectMongoDb(`mongodb://${config.database.url}:${config.database.port}/`);
      const database = db.db(config.database.local.database);
      const collection = 'samplecollection';
      service.updateInDatabase(database, collection, updateOneInDatabaseQuery, updateInDatabaseQuery, updateOneInDatabaseProjection);
      const res = await service.findOneInDatabase(database, collection, updateOneInDatabaseQuery, updateOneInDatabaseProjection);
      chai.expect(res).to.deep.equal(
        {
          name: 'App2',
          description: 'Sample in new updated data that will be inserted in database',
        },
      );
    });

    const updateOneInDatabaseQuery = {
      name: 'App2',
    };
    const updateOneInDatabaseUpdate = {
      $set: {
        name: 'App2',
        description: 'Sample new updated data that will be inserted in database',
      },
    };
    const updateOneInDatabaseProjection = {
      projection: {
        _id: 0,
      },
    };
    it('Should update one data in database', async () => {
      const db = await service.connectMongoDb(`mongodb://${config.database.url}:${config.database.port}/`);
      const database = db.db(config.database.local.database);
      const collection = 'samplecollection';
      service.updateOneInDatabase(database, collection, updateOneInDatabaseQuery, updateOneInDatabaseUpdate, updateOneInDatabaseProjection);
      const res = await service.findOneInDatabase(database, collection, updateOneInDatabaseQuery, updateOneInDatabaseProjection);
      chai.expect(res).to.deep.equal(
        {
          name: 'App2',
          description: 'Sample new updated data that will be inserted in database',
        },
      );
    });

    const removeDocumentsFromCollectionQuery1 = {
      name: 'App1',
    };
    const removeDocumentsFromCollectionQuery2 = {
      name: 'App2',
    };
    const removeDocumentsFromCollectionProjection = {
      projection: {
        _id: 0,
      },
    };
    it('Should remove document from collection in database', async () => {
      const db = await service.connectMongoDb(`mongodb://${config.database.url}:${config.database.port}/`);
      const database = db.db(config.database.local.database);
      const collection = 'samplecollection';
      await service.removeDocumentsFromCollection(database, collection, removeDocumentsFromCollectionQuery1);
      const res = await service.findOneInDatabase(database, collection, removeDocumentsFromCollectionQuery2, removeDocumentsFromCollectionProjection);
      chai.expect(res).to.deep.equal(
        {
          name: 'App2',
          description: 'Sample new updated data that will be inserted in database',
        },
      );
    });

    const findOneAndDeleteInDatabaseQuery = {
      name: 'App2',
    };
    const findOneAndDeleteInDatabaseProjection = {
      projection: {
        _id: 0,
      },
    };
    it('Should find one and remove document from collection in database', async () => {
      const db = await service.connectMongoDb(`mongodb://${config.database.url}:${config.database.port}/`);
      const database = db.db(config.database.local.database);
      const collection = 'samplecollection';
      await service.findOneAndDeleteInDatabase(database, collection, findOneAndDeleteInDatabaseQuery, findOneAndDeleteInDatabaseProjection);
      const res = await service.findOneInDatabase(database, collection, findOneAndDeleteInDatabaseQuery, findOneAndDeleteInDatabaseProjection);
      chai.expect(res).to.be.null;
    });

    const insertManyToDatabaseData = [
      {
        _id: ObjectId('5f99562a09aef91cd19fbb93'),
        name: 'App1',
        description: 'Sample data that will be inserted in database',
      },
      {
        _id: ObjectId('5f99562a09aef91cd19fbb94'),
        name: 'App2',
        description: 'Sample data that will be inserted in database',
      },
    ];
    const insertManyToDatabaseProjection = {
      projection: {
        _id: 0,
      },
    };
    const insertManyToDatabaseQuery = {
      name: 'App1',
    };
    it('Should insert one and find one data from database', async () => {
      const db = await service.connectMongoDb(`mongodb://${config.database.url}:${config.database.port}/`);
      const database = db.db(config.database.local.database);
      const collection = 'samplecollection';
      service.insertManyToDatabase(database, collection, insertManyToDatabaseData);
      const res = await service.findOneInDatabase(database, collection, insertManyToDatabaseQuery, insertManyToDatabaseProjection);
      chai.expect(res).to.deep.equal(
        {
          name: 'App1',
          description: 'Sample data that will be inserted in database',
        },
      );
    });

    it('Should return collection stats in database', async () => {
      const db = await service.connectMongoDb(`mongodb://${config.database.url}:${config.database.port}/`);
      const database = db.db(config.database.local.database);
      const collection = 'samplecollection';
      const res = await service.collectionStats(database, collection);
      chai.expect(res).to.not.be.null;
    });

    it('Should drop collection in database', async () => {
      const db = await service.connectMongoDb(`mongodb://${config.database.url}:${config.database.port}/`);
      const database = db.db(config.database.local.database);
      const collection = 'samplecollection';
      const res = await service.dropCollection(database, collection);
      chai.expect(res).to.not.be.null;
    });
  });
};
