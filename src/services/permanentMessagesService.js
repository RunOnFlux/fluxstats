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
    const trueMes = hashes.filter((m) => m.message === true);
    const totalHashes = hashes.length;
    log.info(`Obtained hashees: ${totalHashes}`);
    log.info(`Expected messages: ${trueMes.length}`);
    const messages = await getPermanentMessages();
    log.info(`Obtained message: ${messages.length}`);
    for (const hash of hashes) {
      const queryUpdate = { hash: hash.hash };
      const exists = serviceHelper.findOneInDatabase(database, collection, queryUpdate, {});
      if (!exists || !exists.message) { // not present in db or present in db but does not have message
        const value = hash;
        if (!exists) {
          log.info(`New hash: ${hash.hash}`);
        } else {
          log.info(`New message for hash: ${hash.hash}`);
        }
        const mesExists = messages.find((m) => m.hash === hash.hash);
        if (mesExists) {
          value.message = mesExists;
        }
        const update = { $set: value };
        const options = {
          upsert: true,
        };
        console.log(update);
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
    const database = db.db(config.database.flux.database);
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

async function apiMissingMessages(req, res) {
  try {
    const database = db.db(config.database.flux.database);
    const query = {
      message: false,
    };
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

async function apiStatsMessages(req, res) {
  try {
    const database = db.db(config.database.flux.database);
    const query = {};
    const projection = {
      projection: {
        _id: 0,
      },
    };
    // return latest fluxnode round
    const response = await serviceHelper.findInDatabase(database, collection, query, projection);
    const totalMessage = response.length;
    const missingMessages = response.filter((m) => m.message === false);
    const misMesTotal = missingMessages.length;
    const okMessages = totalMessage - misMesTotal;
    const resp = {
      total: totalMessage,
      missing: misMesTotal,
      ok: okMessages,
    };
    const resMessage = serviceHelper.createDataMessage(resp);
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
  apiMissingMessages,
  apiStatsMessages,
};
