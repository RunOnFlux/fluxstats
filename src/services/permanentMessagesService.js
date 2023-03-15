const config = require('config');
const axios = require('axios');
const log = require('../lib/log');
const serviceHelper = require('./serviceHelper');

let db = null;
const collection = config.database.flux.collections.messages;

async function getHashes() {
  try {
    const res = await axios.get('https://api.runonflux.io/apps/hashes');
    if (res.data.status === 'success') {
      return res.data.data;
    }
    throw new Error(res.data.data);
  } catch (e) {
    log.error(e);
    return [];
  }
}

async function getPermanentMessages(hash) {
  try {
    let url = 'https://api.runonflux.io/apps/permanentmessages';
    if (hash) {
      url += `/${hash}`;
    }
    const res = await axios.get(url);
    if (res.data.status === 'success') {
      return res.data.data;
    }
    throw new Error(res.data.data);
  } catch (e) {
    log.error(e);
    return [];
  }
}

async function processMessages() {
  try {
    const database = db.db(config.database.flux.database);
    const hashes = await getHashes();
    const messages = await getPermanentMessages();
    for (const hash of hashes) {
      const queryUpdate = { hash: hash.hash };
      const exists = serviceHelper.findOneInDatabase(database, collection, queryUpdate);
      if (!exists || exists.message) {
        const value = hash;
        const mesExists = messages.find((m) => m.hash === hash.hash);
        if (mesExists) {
          value.message = mesExists;
        }
        const update = { $set: value };
        const options = {
          upsert: true,
        };
        // eslint-disable-next-line no-await-in-loop
        await serviceHelper.updateOneInDatabase(database, collection, queryUpdate, update, options);
      }
    }
    setTimeout(() => {
      processMessages();
    }, 5 * 60 * 1000);
  } catch (error) {
    log.error(error);
    setTimeout(() => {
      processMessages();
    }, 5 * 60 * 1000);
  }
}

async function apiAllMessages(req, res) {
  try {
    const database = db.db(config.database.local.database);
    const query = {};
    const projection = {
      projection: {
        _id: 0,
      },
    };
      // return latest fluxnode round
    const response = await serviceHelper.findInDatabase(database, collection, query, projection);
    const resMessage = serviceHelper.createDataMessage(response);
    res.json(resMessage);
  } catch (error) {
    const errMessage = serviceHelper.createErrorMessage(error.message, error.name, error.code);
    res.json(errMessage);
    log.error(error);
  }
}

async function bootstrapFluxCollection() {
  const database = db.db(config.database.flux.database);

  await database.collection(collection).createIndex({ txid: 1 }, { name: 'txid' });
  await database.collection(collection).createIndex({ hash: 1 }, { name: 'hash' });
  await database.collection(collection).createIndex({ height: 1 }, { name: 'height' });
}

async function start() {
  try {
    db = await serviceHelper.connectMongoDb().catch((error) => {
      log.error(error);
      throw error;
    });
    await bootstrapFluxCollection();
    log.info('Initiating Flux Messages services...');
    processMessages();
  } catch (e) {
    // restart service after 5 mins
    log.error(e);
    setTimeout(() => {
      start();
    }, 5 * 60 * 1000);
  }
}

module.exports = {
  getHashes,
  getPermanentMessages,
  processMessages,
  start,
  apiAllMessages,
};
