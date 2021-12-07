const config = require('config');
const log = require('../lib/log');
const serviceHelper = require('./serviceHelper');

let db = null;
const databaseLink = config.database.marketplace.database;
const appsCollection = config.database.marketplace.collections.apps;

async function listApps(req, res) {
  try {
    const database = db.db(databaseLink);
    log.info('list apps');
    const query = {};
    const projection = {
      projection: {
        _id: 0, // all except id
      },
    };
    const results = await serviceHelper.findInDatabase(database, appsCollection, query, projection);
    const resMessage = serviceHelper.createDataMessage(results);
    res.json(resMessage);
  } catch (error) {
    const errMessage = serviceHelper.createErrorMessage(error.message, error.name, error.code);
    res.json(errMessage);
    log.error(error);
  }
}

async function start() {
  try {
    db = await serviceHelper.connectMongoDb().catch((error) => {
      log.error(error);
      throw error;
    });
    const database = db.db(config.database.local.database);
    database.collection(appsCollection).createIndex({ hash: 1 }, { name: 'query for getting specific app' });
    log.info('Initiating Marketplace services...');
  } catch (e) {
    // restart service after 5 mins
    log.error(e);
    setTimeout(() => {
      start();
    }, 5 * 30 * 1000);
  }
}
module.exports = {
  start,
  listApps,
};