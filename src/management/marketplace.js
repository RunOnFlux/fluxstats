const { ObjectId } = require('bson');
const config = require('config');
const serviceHelper = require('../services/serviceHelper');

async function listApps() {
  let db = null;
  const appsCollection = config.database.marketplace.collections.apps;

  db = await serviceHelper.connectMongoDb();

  const database = db.db(config.database.marketplace.database);
  const query = {};

  const result = await serviceHelper.findInDatabase(database, appsCollection, query);
  return result;
}

async function addApp(appSpec) {
  let db = null;
  const appsCollection = config.database.marketplace.collections.apps;

  db = await serviceHelper.connectMongoDb();

  const database = db.db(config.database.marketplace.database);

  const result = await serviceHelper.insertOneToDatabase(database, appsCollection, appSpec);
  console.log(result);
}

async function deleteApp(appSpec) {
  let db = null;
  const appsCollection = config.database.marketplace.collections.apps;

  db = await serviceHelper.connectMongoDb();

  const database = db.db(config.database.marketplace.database);
  const query = {
    // eslint-disable-next-line no-underscore-dangle
    _id: new ObjectId(appSpec._id),
  };

  const result = await serviceHelper.removeDocumentsFromCollection(database, appsCollection, query);
  console.log(result);
}

async function modifyApp(appSpec) {
  let db = null;
  const appsCollection = config.database.marketplace.collections.apps;

  db = await serviceHelper.connectMongoDb();

  const database = db.db(config.database.marketplace.database);
  const query = {
    // eslint-disable-next-line no-underscore-dangle
    _id: new ObjectId(appSpec._id),
  };
  const update = {
    $set: appSpec,
  };
  const options = { upsert: true };
  const result = await serviceHelper.updateOneInDatabase(database, appsCollection, query, update, options);
  console.log(result);
}

function listCategories() {
  return ['Games', 'Productivity', 'Crypto', 'Hosting'];
}

module.exports = {
  listApps,
  addApp,
  deleteApp,
  modifyApp,
  listCategories,
};
