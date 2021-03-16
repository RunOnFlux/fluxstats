/* eslint-disable no-await-in-loop */
const axios = require('axios');
const https = require('https');
const config = require('config');
const log = require('../lib/log');
const serviceHelper = require('./serviceHelper');
const fluxService = require('./fluxService');

let db = null;
const kadenaNodesCollection = config.database.kadena.collections.nodes;
const completedRoundsCollection = config.database.kadena.collections.completedRounds;

let outdatedKDANodes = [];
let currentNodes = [];
let allNodes = [];

const axiosConfig = {
  timeout: 13456,
};

async function getKadenaLocation(ip) {
  try {
    const zelnodeList = await axios.get(`http://${ip}:16127/zelapps/location/KadenaChainWebNode`, axiosConfig);
    if (zelnodeList.data.status === 'success') {
      return zelnodeList.data.data || [];
    }
    return [];
  } catch (e) {
    log.error(e);
    return [];
  }
}

async function getKadenaAccount(ip) {
  try {
    const zelnodeList = await axios.get(`http://${ip}:16127/zelflux/kadena`, axiosConfig);
    if (zelnodeList.data.status === 'success') {
      return zelnodeList.data.data || null;
    }
    return null;
  } catch (e) {
    // log.error(e);
    return null;
  }
}

async function getKadenaHeight(ip) {
  try {
    const agent = new https.Agent({
      rejectUnauthorized: false,
    });
    const kadenaData = await axios.get(`https://${ip}:30004/chainweb/0.0/mainnet01/cut`, { httpsAgent: agent, timeout: 13456 });
    return kadenaData.data.height;
  } catch (e) {
    // log.error(e);
    return -1;
  }
}

async function getZelNodeTier(ip) {
  try {
    const zelnodeList = await axios.get(`http://${ip}:16127/zelcash/getzelnodestatus`, axiosConfig);
    if (zelnodeList.data.status === 'success') {
      return zelnodeList.data.data.tier;
    }
    return null;
  } catch (e) {
    // log.error(e);
    return null;
  }
}

async function getZelNodeZelID(ip) {
  try {
    const zelnodeList = await axios.get(`http://${ip}:16127/zelflux/zelid`, axiosConfig);
    if (zelnodeList.data.status === 'success') {
      return zelnodeList.data.data;
    }
    return null;
  } catch (e) {
    // log.error(e);
    return null;
  }
}

async function getKadenaVerison(ip) {
  try {
    const appData = await axios.get(`http://${ip}:16127/zelapps/installedzelapps/KadenaChainWebNode`, axiosConfig);
    if (appData.data.status === 'success') {
      return appData.data.data[0].hash;
    }
    return null;
  } catch (e) {
    // log.error(e);
    return null;
  }
}

async function beginKadena() {
  // -> every hour get list of kadena nodes from 10 random fluxes calling /location/kadenachainwebnode api
  // -> since lists may differ we merge the list together to get an accurate list
  // -> on every node get its tier, check if its running and get its kadena account (if all ok continue)
  // -> check if kadena is running properly there and check if its +- synced
  const database = db.db(config.database.kadena.database);
  const currentRoundTime = new Date().getTime();
  const zelnodelist = await fluxService.getZelNodeIPs();
  if (zelnodelist.length < 10) {
    setTimeout(() => {
      beginKadena();
    }, 60 * 1000);
  }
  // choose 10 random nodes and get chainwebnode locations from them
  const stringOfTenChars = 'qwertyuiop';
  const chainwebnodelocations = [];
  const outdatedchainweblocations = [];
  // eslint-disable-next-line no-restricted-syntax, no-unused-vars
  for (const index of stringOfTenChars) { // async inside
    const randomNumber = Math.floor((Math.random() * zelnodelist.length));
    const kdaNodes = await getKadenaLocation(zelnodelist[randomNumber]);
    const kdaNodesValid = kdaNodes.filter((node) => (node.hash === 'localSpecificationsVersion6'));
    const kdaNodesINValid = kdaNodes.filter((node) => (node.hash !== 'localSpecificationsVersion6'));
    kdaNodesValid.forEach((node) => {
      chainwebnodelocations.push(node.ip);
    });
    kdaNodesINValid.forEach((node) => {
      outdatedchainweblocations.push(node.ip);
    });
  }
  // create a set of it so we dont have duplicates
  const kadenaOK = [...new Set(chainwebnodelocations)]; // continue running checks
  const kadenaOLD = [...new Set(outdatedchainweblocations)]; // good for saving as outdated
  // step 2 run
  const allKDANodes = [];
  const outKDA = [];
  // eslint-disable-next-line no-restricted-syntax
  for (const kdaNode of kadenaOLD) {
    const nodeData = {};
    nodeData.ip = kdaNode;
    nodeData.roundTime = currentRoundTime;
    nodeData.tier = await getZelNodeTier(kdaNode);
    nodeData.zelid = await getZelNodeZelID(kdaNode);
    nodeData.account = await getKadenaAccount(kdaNode);
    nodeData.height = await getKadenaHeight(kdaNode);
    nodeData.hash = await getKadenaVerison(kdaNode);
    outKDA.push(nodeData);
    allKDANodes.push(nodeData);
    console.log(nodeData);
    await serviceHelper.insertOneToDatabase(database, kadenaNodesCollection, nodeData).catch((error) => {
      log.error(error);
    });
  }
  outdatedKDANodes = kadenaOLD;
  const syncedKDAnodes = [];
  // eslint-disable-next-line no-restricted-syntax
  for (const kdaNode of kadenaOK) {
    const nodeData = {};
    nodeData.ip = kdaNode;
    nodeData.roundTime = currentRoundTime;
    nodeData.tier = await getZelNodeTier(kdaNode);
    nodeData.zelid = await getZelNodeZelID(kdaNode);
    nodeData.account = await getKadenaAccount(kdaNode);
    nodeData.height = await getKadenaHeight(kdaNode);
    nodeData.hash = await getKadenaVerison(kdaNode);
    syncedKDAnodes.push(nodeData);
    allKDANodes.push(nodeData);
    console.log(nodeData);
    await serviceHelper.insertOneToDatabase(database, kadenaNodesCollection, nodeData).catch((error) => {
      log.error(error);
    });
  }
  currentNodes = syncedKDAnodes;
  allNodes = allKDANodes;
  const crt = {
    timestamp: currentRoundTime,
  };
  await serviceHelper.insertOneToDatabase(database, completedRoundsCollection, crt).catch((error) => {
    log.error(error);
  });
}

async function outdatedNodes(req, res) {
  const results = outdatedKDANodes;
  const resMessage = serviceHelper.createDataMessage(results);
  res.json(resMessage);
}

async function uptodateNodes(req, res) {
  const results = currentNodes;
  const resMessage = serviceHelper.createDataMessage(results);
  res.json(resMessage);
}

async function allNodesAPI(req, res) {
  const results = allNodes;
  const resMessage = serviceHelper.createDataMessage(results);
  res.json(resMessage);
}

async function getCompletedRoundsTimestamps(req, res) {
  const database = db.db(config.database.kadena.database);
  const q = {};
  const p = {};
  const completedRounds = await serviceHelper.findInDatabase(database, completedRoundsCollection, q, p).catch((error) => {
    const errMessage = serviceHelper.createErrorMessage(error.message, error.name, error.code);
    res.json(errMessage);
    log.error(error);
  });
  const bresults = completedRounds.map((x) => x.timestamp);
  const resMessage = serviceHelper.createDataMessage(bresults);
  return res.json(resMessage);
}

async function getKadenaIPHistory(req, res) {
  const database = db.db(config.database.kadena.database);
  let { ip } = req.params;
  ip = ip || req.query.ip;
  if (!ip) {
    const errMessage = serviceHelper.createErrorMessage('No IP provided');
    return res.json(errMessage);
  }
  const query = {
    ip,
  };
  const projection = {
    projection: {
      _id: 0,
      ip: 1,
      tier: 1,
      roundTime: 1,
      account: 1,
      height: 1,
      hash: 1,
      zelid: 1,
    },
  };
  const results = await serviceHelper.findInDatabase(database, kadenaNodesCollection, query, projection).catch((error) => {
    const errMessage = serviceHelper.createErrorMessage(error.message, error.name, error.code);
    res.json(errMessage);
    log.error(error);
  });
  const resMessage = serviceHelper.createDataMessage(results);
  return res.json(resMessage);
}

async function getKadenaAccountHistory(req, res) {
  const database = db.db(config.database.kadena.database);
  let { account } = req.params;
  account = account || req.query.account;
  if (!account) {
    const errMessage = serviceHelper.createErrorMessage('No Account provided');
    return res.json(errMessage);
  }
  const query = {
    account,
  };
  const projection = {
    projection: {
      _id: 0,
      ip: 1,
      tier: 1,
      roundTime: 1,
      account: 1,
      height: 1,
      hash: 1,
      zelid: 1,
    },
  };
  const results = await serviceHelper.findInDatabase(database, kadenaNodesCollection, query, projection).catch((error) => {
    const errMessage = serviceHelper.createErrorMessage(error.message, error.name, error.code);
    res.json(errMessage);
    log.error(error);
  });
  const resMessage = serviceHelper.createDataMessage(results);
  return res.json(resMessage);
}

async function getKadenaIPHistoryDays(req, res) {
  const database = db.db(config.database.kadena.database);
  let { ip } = req.params;
  ip = ip || req.query.ip;
  if (!ip) {
    const errMessage = serviceHelper.createErrorMessage('No IP provided');
    return res.json(errMessage);
  }
  let { days } = req.params;
  days = days || req.query.days;
  days = serviceHelper.ensureNumber(days);
  if (!days || Number.isNaN(days)) {
    const errMessage = serviceHelper.createErrorMessage('No last number of Days provided');
    return res.json(errMessage);
  }
  const daysInMiliseconds = days * 24 * 60 * 60 * 1000;
  const currentTime = new Date().getTime();
  const minimumTime = currentTime - daysInMiliseconds;
  const query = {
    ip,
    roundTime: { $gte: minimumTime },
  };
  const projection = {
    projection: {
      _id: 0,
      ip: 1,
      tier: 1,
      roundTime: 1,
      account: 1,
      height: 1,
      hash: 1,
      zelid: 1,
    },
  };
  const results = await serviceHelper.findInDatabase(database, kadenaNodesCollection, query, projection).catch((error) => {
    const errMessage = serviceHelper.createErrorMessage(error.message, error.name, error.code);
    res.json(errMessage);
    log.error(error);
  });
  const resMessage = serviceHelper.createDataMessage(results);
  return res.json(resMessage);
}

async function getKadenaAccountHistoryDays(req, res) {
  const database = db.db(config.database.kadena.database);
  let { account } = req.params;
  account = account || req.query.account;
  if (!account) {
    const errMessage = serviceHelper.createErrorMessage('No Account provided');
    return res.json(errMessage);
  }
  let { days } = req.params;
  days = days || req.query.days;
  days = serviceHelper.ensureNumber(days);
  if (!days || Number.isNaN(days)) {
    const errMessage = serviceHelper.createErrorMessage('No last number of Days provided');
    return res.json(errMessage);
  }
  const daysInMiliseconds = days * 24 * 60 * 60 * 1000;
  const currentTime = new Date().getTime();
  const minimumTime = currentTime - daysInMiliseconds;
  const query = {
    account,
    roundTime: { $gte: minimumTime },
  };
  const projection = {
    projection: {
      _id: 0,
      ip: 1,
      tier: 1,
      roundTime: 1,
      account: 1,
      height: 1,
      hash: 1,
      zelid: 1,
    },
  };
  const results = await serviceHelper.findInDatabase(database, kadenaNodesCollection, query, projection).catch((error) => {
    const errMessage = serviceHelper.createErrorMessage(error.message, error.name, error.code);
    res.json(errMessage);
    log.error(error);
  });
  const resMessage = serviceHelper.createDataMessage(results);
  return res.json(resMessage);
}

async function getKadenaEligibleDays(req, res) {
  const database = db.db(config.database.kadena.database);
  let { days } = req.params;
  days = days || req.query.days;
  days = serviceHelper.ensureNumber(days);
  if (!days || Number.isNaN(days) || days > 35) {
    const errMessage = serviceHelper.createErrorMessage('Invalid Days provided');
    return res.json(errMessage);
  }
  const daysInMiliseconds = days * 24 * 60 * 60 * 1000;
  const currentTime = new Date().getTime();
  const minimumTime = currentTime - daysInMiliseconds;

  const baseTime = 1611710552000;
  const baseHeight = 26212040;
  const timeDifference = currentTime - baseTime;
  const blocksPassedInDifference = (timeDifference / 30000) * 20; // 20 chains with blocktime 30 seconds
  const blocksInTimeFrame = (daysInMiliseconds / 30000) * 20;
  const currentBlockEstimation = baseHeight + blocksPassedInDifference;
  const minimumAcceptedBlockHeight = currentBlockEstimation - blocksInTimeFrame - 200000; // allow being off sync for 200000 blocks;

  const query = {
    roundTime: { $gte: minimumTime },
    height: { $gte: minimumAcceptedBlockHeight },
    tier: { $exists: true, $type: 2 },
    hash: { $exists: true, $type: 2 },
    account: { $exists: true, $type: 2 },
    zelid: { $exists: true, $type: 2 },
  };
  const projection = {
    projection: {
      _id: 0,
      ip: 1,
      tier: 1,
      roundTime: 1,
      account: 1,
      height: 1,
      hash: 1,
      zelid: 1,
    },
  };
  const results = await serviceHelper.findInDatabase(database, kadenaNodesCollection, query, projection).catch((error) => {
    const errMessage = serviceHelper.createErrorMessage(error.message, error.name, error.code);
    res.json(errMessage);
    log.error(error);
  });
  // a node is eligible if
  // A) zelid is present
  // B) account of kadena is present
  // C) height is bigger than minimumAcceptedBlockHeight
  // -> this is going to filter;
  // const filteredResults = results.filter((result) => result.hash === 'localSpecificationsVersion6');
  const filteredResults = results;
  const numberOfChecksPerDay = days * 48;
  const minimumPresentions = Math.floor(numberOfChecksPerDay * 0.95) - 1; // add one extra less check (useful for 1 day eligibility)
  // construct eligibilityCheck
  // node is eligible if is present in at least 95% of checks
  const ips = [];
  filteredResults.forEach((result) => {
    ips.push(result.ip);
  });

  const ipsOK = [...new Set(ips)];

  const countOccurrences = (arr, val) => arr.reduce((a, v) => (v === val ? a + 1 : a), 0);
  const eligibleIps = [];
  // eslint-disable-next-line no-restricted-syntax
  for (const ip of ipsOK) {
    if (countOccurrences(ips, ip) >= minimumPresentions) {
      const q = {
        ip,
      };
      const lastData = await serviceHelper.findOneInDatabaseReverse(database, kadenaNodesCollection, q, projection).catch((error) => {
        log.error(error);
      });
      eligibleIps.push(lastData);
    }
  }
  const resMessage = serviceHelper.createDataMessage(eligibleIps);
  return res.json(resMessage);
}

async function getKadenaNodesForTimestamp(req, res) {
  const database = db.db(config.database.kadena.database);
  let { timestamp } = req.params;
  timestamp = timestamp || req.query.timestamp;
  if (!timestamp) {
    const errMessage = serviceHelper.createErrorMessage('No Timestamp provided');
    return res.json(errMessage);
  }
  timestamp = serviceHelper.ensureNumber(timestamp);
  const query = {
    roundTime: timestamp,
  };
  const projection = {
    projection: {
      _id: 0,
      ip: 1,
      tier: 1,
      roundTime: 1,
      account: 1,
      height: 1,
      hash: 1,
      zelid: 1,
    },
  };
  const results = await serviceHelper.findInDatabase(database, kadenaNodesCollection, query, projection).catch((error) => {
    const errMessage = serviceHelper.createErrorMessage(error.message, error.name, error.code);
    res.json(errMessage);
    log.error(error);
  });
  const resMessage = serviceHelper.createDataMessage(results);
  return res.json(resMessage);
}

async function start() {
  try {
    db = await serviceHelper.connectMongoDb().catch((error) => {
      log.error(error);
      throw error;
    });
    const database = db.db(config.database.kadena.database);
    database.collection(kadenaNodesCollection).createIndex({ ip: 1 }, { name: 'query for getting list of Kadena nodes data associated to IP address' });
    database.collection(kadenaNodesCollection).createIndex({ ip: 1, roundTime: 1 }, { name: 'query for getting list of Kadena nodes data associated to IP address since some roundTime' });
    database.collection(kadenaNodesCollection).createIndex({ zelid: 1 }, { name: 'query for getting list of Kadena nodes data associated to zelid' });
    database.collection(kadenaNodesCollection).createIndex({ zelid: 1, roundTime: 1 }, { name: 'query for getting list of Kadena nodes data associated to zelid since some roundTime' });
    database.collection(kadenaNodesCollection).createIndex({ account: 1 }, { name: 'query for getting list of Kadena nodes tied to account' });
    database.collection(kadenaNodesCollection).createIndex({ account: 1, roundTime: 1 }, { name: 'query for getting list of Kadena nodes tied to account for a roundTime' });
    database.collection(kadenaNodesCollection).createIndex({ tier: 1 }, { name: 'query for getting list of Kadena nodes tied to tier' });
    database.collection(kadenaNodesCollection).createIndex({ tier: 1, roundTime: 1 }, { name: 'query for getting list of Kadena nodes tied to tier for given roundTime' });
    database.collection(kadenaNodesCollection).createIndex({ roundTime: 1 }, { name: 'query for getting list of Kadena nodes that were added in specific roundTime' });
    database.collection(kadenaNodesCollection).createIndex({ hash: 1 }, { name: 'query for getting list of Kadena nodes that have a version X' });
    database.collection(kadenaNodesCollection).createIndex({ hash: 1, roundTime: 1 }, { name: 'query for getting list of Kadena nodes that have a version X for a given roundtime' });
    database.collection(kadenaNodesCollection).createIndex({ height: 1 }, { name: 'query for getting list of Kadena nodes that have a height X' });
    database.collection(kadenaNodesCollection).createIndex({ height: 1, roundTime: 1 }, { name: 'query for getting list of Kadena nodes that have a height X for a given roundtime' });
    database.collection(kadenaNodesCollection).createIndex({
      height: 1, roundTime: 1, zelid: 1, account: 1, hash: 1, tier: 1,
    }, { name: 'complex eligible check' });
    database.collection(kadenaNodesCollection).createIndex({
      height: 1, roundTime: 1, zelid: 1, account: 1,
    }, { name: 'complex eligible check B' });
    database.collection(kadenaNodesCollection).createIndex({
      height: 1, roundTime: 1, account: 1,
    }, { name: 'complex eligible check C' });
    database.collection(completedRoundsCollection).createIndex({ timestamp: 1 }, { name: 'teimstamp collection' });
    log.info('Initiating Kadena API services...');
    beginKadena();
    setInterval(() => {
      beginKadena();
    }, 30 * 60 * 1000); // run every 30 minutes
  } catch (e) {
    log.error(e);
  }
}
module.exports = {
  start,
  outdatedNodes,
  uptodateNodes,
  allNodesAPI,
  getCompletedRoundsTimestamps,
  getKadenaIPHistory,
  getKadenaAccountHistory,
  getKadenaIPHistoryDays,
  getKadenaAccountHistoryDays,
  getKadenaEligibleDays,
  getKadenaNodesForTimestamp,
};
