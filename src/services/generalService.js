const config = require('config');
const bitgo = require('bitgo-utxo-lib');
const zelcorejs = require('zelcorejs');
const crypto = require('crypto');

const serviceHelper = require('./serviceHelper');
const log = require('../lib/log');

let db = null;
const databaseLink = config.database.general.database;
const proposalsCollection = config.database.general.collections.activeMessagePhrases;

// generate new message phrase for claiming purposes. 15 min expire time
async function getMessagePhrase(req, res) {
  try {
    const timestamp = new Date().getTime();
    const validTill = timestamp + (15 * 60 * 1000); // 15 minutes
    const phrase = timestamp + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

    /* const activeMessagePhrases = [
       {
         messagePhrase: 1565356121335e9obp7h17bykbbvub0ts488wnnmd12fe1pq88mq0v,
         createdAt: 2019-08-09T13:08:41.335Z,
         expireAt: 2019-08-09T13:23:41.335Z
       }
    ] */
    const database = db.db(databaseLink);
    const newMessagePhrase = {
      messagePhrase: phrase,
      createdAt: new Date(timestamp),
      expireAt: new Date(validTill),
    };
    const value = newMessagePhrase;
    await serviceHelper.insertOneToDatabase(database, proposalsCollection, value);
    // all is ok
    const phraseResponse = serviceHelper.createDataMessage(phrase);
    res.json(phraseResponse);
  } catch (error) {
    log.error(error);
    const errMessage = serviceHelper.createErrorMessage(error.message, error.name, error.code);
    res.json(errMessage);
  }
}

async function activeMessagePhrases(req, res) {
  try {
    const database = db.db(databaseLink);
    const query = {};
    const projection = {
      projection: {
        _id: 0, messagePhrase: 1, createdAt: 1, expireAt: 1,
      },
    };
    const results = await serviceHelper.findInDatabase(database, proposalsCollection, query, projection);
    const resultsResponse = serviceHelper.createDataMessage(results);
    res.json(resultsResponse);
  } catch (error) {
    log.error(error);
    const errMessage = serviceHelper.createErrorMessage(error.message, error.name, error.code);
    res.json(errMessage);
  }
}

async function messageExists(message) {
  // find the message in acttiveMessagePhrases database
  try {
    if (message.length < 20) {
      return false;
    }
    const database = db.db(databaseLink);
    const query = {
      messagePhrase: message,
    };
    const projection = {
      projection: {
        _id: 0, messagePhrase: 1, createdAt: 1, expireAt: 1,
      },
    };
    const result = await serviceHelper.findOneInDatabase(database, proposalsCollection, query, projection);
    if (!result) {
      return false;
    }
    return true;
  } catch (error) {
    log.error(error);
    return false;
  }
}

async function deleteMessagePhrase(phrase) {
  try {
    const database = db.db(databaseLink);
    const query = { messagePhrase: phrase };
    const projection = {};
    await serviceHelper.findOneAndDeleteInDatabase(database, proposalsCollection, query, projection);
  } catch (error) {
    log.error(error);
  }
}

// Verification functions
function verifyZelID(address) {
  try {
    if (!address) {
      throw new Error('Missing zelID for verification');
    }

    if (!address.startsWith('1')) {
      throw new Error('Invalid zelID');
    }

    if (address.length > 36) {
      const btcPubKeyHash = '00';
      zelcorejs.address.pubKeyToAddr(address, btcPubKeyHash);
    }
    bitgo.address.toOutputScript(address);
    return true;
  } catch (e) {
    log.error(e);
    return false;
  }
}

// Verification functions
function verifyPublicKey(pubKey) {
  try {
    if (!pubKey) {
      throw new Error('Missing public key verification');
    }
    const re = /[0-9A-Fa-f]{64}/g; // 64 chars, hex
    if (!re.test(pubKey)) {
      throw new Error('Invalid public key');
    }
    const btcPubKeyHash = '00';
    const address = zelcorejs.address.pubKeyToAddr(pubKey, btcPubKeyHash);
    bitgo.address.toOutputScript(address);
    return true;
  } catch (e) {
    log.error(e);
    return false;
  }
}

function verifyMessage(message, address, signature, strMessageMagic, checkSegwitAlways, pubKeyHash = '00') {
  let signingAddress = address;
  try {
    if (!address || !message || !signature) {
      throw new Error('Missing parameters for message verification');
    }

    if (address.length > 36) {
      const sigAddress = zelcorejs.address.pubKeyToAddr(address, pubKeyHash);
      // const publicKeyBuffer = Buffer.from(address, 'hex');
      // const publicKey = bitcoinjs.ECPair.fromPublicKeyBuffer(publicKeyBuffer);
      // const sigAddress = bitcoinjs.payments.p2pkh({ pubkey: publicKeyBuffer }).address);
      signingAddress = sigAddress;
    }
    const isValid = zelcorejs.message.verify(message, signingAddress, signature, strMessageMagic, checkSegwitAlways, pubKeyHash);
    console.log(isValid);
    return isValid;
  } catch (e) {
    log.error(e);
    return false;
  }
}

function messageHash(message) {
  if (typeof message !== 'string') {
    return new Error('Invalid message');
  }
  return crypto.createHash('sha256').update(message).digest('hex');
}

async function start() {
  try {
    db = await serviceHelper.connectMongoDb().catch((error) => {
      log.error(error);
      throw error;
    });
    const database = db.db(databaseLink);
    await database.collection(proposalsCollection).createIndex({ createdAt: 1 }, { expireAfterSeconds: 900 });
    console.log('active messages db indexes created.');
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
  verifyZelID,
  verifyPublicKey,
  verifyMessage,
  messageExists,
  activeMessagePhrases,
  getMessagePhrase,
  deleteMessagePhrase,
  messageHash,
};
