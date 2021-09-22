/* eslint-disable no-loop-func */
/* eslint-disable no-await-in-loop */
const axios = require('axios');
const rateLimit = require('axios-rate-limit');
const https = require('https');
const config = require('config');
const LRU = require('lru-cache');
const log = require('../lib/log');
const serviceHelper = require('./serviceHelper');
const fluxService = require('./fluxService');

const http = rateLimit(axios.create(), { maxRequests: 10, perMilliseconds: 1000 });

let db = null;
const kadenaNodesCollection = config.database.kadena.collections.nodes;
const completedRoundsCollection = config.database.kadena.collections.completedRounds;

let outdatedKDANodes = [];
let currentNodes = [];
let allNodes = [];

// helpers
let allKDANodes = [];
let outKDA = [];
let syncedKDAnodes = [];
let kdaNodesWithErrors = [];

// let beginKadenExecuting = false;

// default cache
const LRUoptions = {
  max: 2000, // store 2000 values, we shall not have more values at any period
  maxAge: 1000 * 60 * 11, // 11 minutes
};
const myCache = new LRU(LRUoptions);

const axiosConfig = {
  timeout: 5000,
};

async function getKadenaLocation(ip) {
  try {
    const fluxnodeList = await http.get(`http://${ip}:16127/apps/location/KadenaChainWebNode`, axiosConfig);
    if (fluxnodeList.data.status === 'success') {
      return fluxnodeList.data.data || [];
    }
    return [];
  } catch (e) {
    log.error(`getKadenaLocation of IP ${ip} error`);
    return [];
  }
}

async function getKadenaAccount(ip) {
  try {
    const fluxnodeList = await http.get(`http://${ip}:16127/flux/kadena`, axiosConfig);
    if (fluxnodeList.data.status === 'success') {
      return fluxnodeList.data.data || null;
    }
    return null;
  } catch (e) {
    log.error(`getKadenaAccount of IP ${ip} error`);
    return null;
  }
}

async function getKadenaHeight(ip) {
  try {
    const agent = new https.Agent({
      rejectUnauthorized: false,
    });
    const kadenaData = await http.get(`https://${ip}:30004/chainweb/0.0/mainnet01/cut`, { httpsAgent: agent, timeout: 13456 });
    return kadenaData.data.height;
  } catch (e) {
    log.error(`getKadenaHeight of IP ${ip} error`);
    return -1;
  }
}

async function getFluxNodeTier(ip) {
  try {
    const fluxnodeList = await http.get(`http://${ip}:16127/daemon/getzelnodestatus`, axiosConfig);
    if (fluxnodeList.data.status === 'success') {
      return fluxnodeList.data.data.tier;
    }
    return null;
  } catch (e) {
    log.error(`getFluxNodeTier of IP ${ip} error`);
    return null;
  }
}

async function getFluxNodeZelID(ip) {
  try {
    const fluxnodeList = await http.get(`http://${ip}:16127/flux/zelid`, axiosConfig);
    if (fluxnodeList.data.status === 'success') {
      return fluxnodeList.data.data;
    }
    return null;
  } catch (e) {
    log.error(`getFluxNodeZelID of IP ${ip} error`);
    return null;
  }
}

async function getKadenaVersion(ip) {
  try {
    const appData = await http.get(`http://${ip}:16127/apps/installedapps/KadenaChainWebNode`, axiosConfig);
    if (appData.data.status === 'success') {
      return appData.data.data[0].hash;
    }
    return null;
  } catch (e) {
    log.error(`getKadenaVersion of IP ${ip} error`);
    return null;
  }
}

async function processKdaNode(kdaNode, currentRoundTime, synced, finishProcessing) {
  const database = db.db(config.database.kadena.database);
  const nodeData = {};
  nodeData.ip = kdaNode;
  nodeData.roundTime = currentRoundTime;
  nodeData.tier = await getFluxNodeTier(kdaNode);
  if (!nodeData.tier) {
    kdaNodesWithErrors.push(kdaNode);
    if (!finishProcessing) {
      return;
    }
  }
  nodeData.zelid = await getFluxNodeZelID(kdaNode);
  if (!nodeData.zelid) {
    kdaNodesWithErrors.push(kdaNode);
    if (!finishProcessing) {
      return;
    }
  }
  nodeData.account = await getKadenaAccount(kdaNode);
  if (!nodeData.account) {
    kdaNodesWithErrors.push(kdaNode);
    if (!finishProcessing) {
      return;
    }
  }
  nodeData.height = await getKadenaHeight(kdaNode);
  nodeData.hash = await getKadenaVersion(kdaNode);
  if (!nodeData.hash) {
    kdaNodesWithErrors.push(kdaNode);
    if (!finishProcessing) {
      return;
    }
  }
  if (synced) {
    syncedKDAnodes.push(nodeData);
  } else {
    outKDA.push(nodeData);
  }
  allKDANodes.push(nodeData);
  await serviceHelper.insertOneToDatabase(database, kadenaNodesCollection, nodeData).catch((error) => {
    log.error(error);
  });
}

async function beginKadena() {
  // beginKadenExecuting = true;
  const startRefresh = new Date();
  // -> every hour get list of kadena nodes from 10 random fluxes calling /location/kadenachainwebnode api
  // -> since lists may differ we merge the list together to get an accurate list
  // -> on every node get its tier, check if its running and get its kadena account (if all ok continue)
  // -> check if kadena is running properly there and check if its +- synced
  const database = db.db(config.database.kadena.database);
  const currentRoundTime = new Date().getTime();
  const fluxnodelist = await fluxService.getFluxNodeIPs();
  if (fluxnodelist.length < 10) {
    setTimeout(() => {
      beginKadena();
    }, 60 * 1000);
  }
  log.info(`beginKadena fluxnodelist length = ${fluxnodelist.length}`);
  // choose 10 random nodes and get chainwebnode locations from them
  const stringOfTenChars = 'qwertyuiop';
  const chainwebnodelocations = [];
  const outdatedchainweblocations = [];
  // eslint-disable-next-line no-restricted-syntax, no-unused-vars
  for (const index of stringOfTenChars) { // async inside
    const randomNumber = Math.floor((Math.random() * fluxnodelist.length));
    const kdaNodes = await getKadenaLocation(fluxnodelist[randomNumber]);
    const kdaNodesValid = kdaNodes.filter((node) => (node.hash === 'localSpecificationsVersion9' || node.hash === 'localSpecificationsVersion8'));
    const kdaNodesINValid = kdaNodes.filter((node) => (node.hash !== 'localSpecificationsVersion9' && node.hash !== 'localSpecificationsVersion8'));
    kdaNodesValid.forEach((node) => {
      chainwebnodelocations.push(node.ip);
    });
    kdaNodesINValid.forEach((node) => {
      outdatedchainweblocations.push(node.ip);
    });
  }
  log.info(`chainwebnodelocations: ${chainwebnodelocations.length}`);
  log.info(`outdatedchainweblocations: ${outdatedchainweblocations.length}`);
  // create a set of it so we dont have duplicates
  const kadenaOK = [...new Set(chainwebnodelocations)]; // continue running checks
  const kadenaOLD = [...new Set(outdatedchainweblocations)]; // good for saving as outdated

  // step 2 run
  log.info('beginKadena step 2');
  allKDANodes = [];
  outKDA = [];
  let promiseArray = [];
  log.info(`KadenaOld Nodes: ${Object.keys(kadenaOLD).length}`);
  // eslint-disable-next-line no-restricted-syntax
  for (let i = 0; i < kadenaOLD.length; i += 1) {
    const kdaNode = kadenaOLD[i];
    promiseArray.push(processKdaNode(kdaNode, currentRoundTime, false));
    if ((i + 1) % 30 === 0) {
      await Promise.allSettled(promiseArray);
      promiseArray = [];
      log.info(`KadenaOld Nodes Processed: ${i + 1}`);
    }
  }
  if (promiseArray.length > 0) {
    await Promise.allSettled(promiseArray);
    promiseArray = [];
  }
  let kdaNodesWithErrorsAux = [];
  let retry = 0;
  // lets process the nodes that we got a http error getting the information, max retrys 3
  while (kdaNodesWithErrors.length > 0 && retry < 5) {
    log.info(`Found KadenaOld ${kdaNodesWithErrors.length} with errors.`);
    kdaNodesWithErrorsAux = [...kdaNodesWithErrors];
    // eslint-disable-next-line no-restricted-syntax
    for (let i = 0; i < kdaNodesWithErrors.length; i += 1) {
      const kdaNode = kdaNodesWithErrors[i];
      const index = kdaNodesWithErrors.indexOf(kdaNode);
      kdaNodesWithErrors.splice(index, 1);
      const lastTry = retry === 4; // insertToDB if last try
      promiseArray.push(processKdaNode(kdaNode, currentRoundTime, false, lastTry));
      if ((i + 1) % 30 === 0) {
        await Promise.allSettled(promiseArray);
        promiseArray = [];
      }
    }
    if (promiseArray.length > 0) {
      await Promise.allSettled(promiseArray);
      promiseArray = [];
    }
    retry += 1;
  }
  log.info(`Finished with KadenaOld ${kdaNodesWithErrors.length} with errors.`);
  kdaNodesWithErrors = [];
  outdatedKDANodes = [...new Set(outKDA)];
  // clean data
  outKDA = [];
  // step 3
  log.info('beginKadena step 3');
  syncedKDAnodes = [];
  log.info(`KadenaOk Nodes: ${Object.keys(kadenaOK).length}`);
  // eslint-disable-next-line no-restricted-syntax
  for (let i = 0; i < kadenaOK.length; i += 1) {
    const kdaNode = kadenaOK[i];
    promiseArray.push(processKdaNode(kdaNode, currentRoundTime, true));
    if ((i + 1) % 30 === 0) {
      await Promise.allSettled(promiseArray);
      promiseArray = [];
      log.info(`KadenaOk Nodes Processed: ${i + 1}`);
    }
  }
  if (promiseArray.length > 0) {
    await Promise.allSettled(promiseArray);
    promiseArray = [];
  }
  kdaNodesWithErrorsAux = [];
  retry = 0;
  // lets process the nodes that we got a http error getting the information, max retrys 3
  while (kdaNodesWithErrors.length > 0 && retry < 3) {
    log.info(`Found KadenaOk ${kdaNodesWithErrors.length} with errors.`);
    kdaNodesWithErrorsAux = [...kdaNodesWithErrors];
    // eslint-disable-next-line no-restricted-syntax
    for (let i = 0; i < kdaNodesWithErrorsAux.length; i += 1) {
      const kdaNode = kdaNodesWithErrorsAux[i];
      const index = kdaNodesWithErrors.indexOf(kdaNode);
      kdaNodesWithErrors.splice(index, 1);
      const lastTry = retry === 2; // insertToDB if last try
      promiseArray.push(processKdaNode(kdaNode, currentRoundTime, true, lastTry));
      if ((i + 1) % 30 === 0) {
        await Promise.allSettled(promiseArray);
        promiseArray = [];
      }
    }
    if (promiseArray.length > 0) {
      await Promise.allSettled(promiseArray);
      promiseArray = [];
    }
    retry += 1;
  }
  log.info(`Finished with KadenaOk ${kdaNodesWithErrors.length} with errors.`);
  kdaNodesWithErrors = [];
  kdaNodesWithErrorsAux = [];
  currentNodes = [...new Set(syncedKDAnodes)];
  allNodes = [...new Set(allKDANodes)];
  // clean data
  syncedKDAnodes = [];
  allKDANodes = [];
  // step 4
  log.info('beginKadena step 4');
  const crt = {
    timestamp: currentRoundTime,
  };
  await serviceHelper.insertOneToDatabase(database, completedRoundsCollection, crt).catch((error) => {
    log.error(error);
  });
  const endRefresh = new Date() - startRefresh;
  log.info('Execution time of beginKadena: %dms', endRefresh);
  // beginKadenExecuting = false;
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

async function getKadenaEligibleStatsDays(req, res) {
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

  const baseTime = 1623484964000;
  const baseHeight = 34057200;
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
  const cacheAsk = `eligible${days}`;
  let results = myCache.get(cacheAsk);
  if (!results) {
    results = await serviceHelper.findInDatabase(database, kadenaNodesCollection, query, projection).catch((error) => {
      const errMessage = serviceHelper.createErrorMessage(error.message, error.name, error.code);
      res.json(errMessage);
      log.error(error);
    });
    myCache.set(cacheAsk, results);
  }
  // a node is eligible if
  // A) zelid is present
  // B) account of kadena is present
  // C) height is bigger than minimumAcceptedBlockHeight
  // -> this is going to filter;
  // const filteredResults = results.filter((result) => result.hash === 'localSpecificationsVersion6');
  const filteredResults = results;
  const numberOfChecksPerDay = days * 48;
  const minimumPresentions = Math.floor(numberOfChecksPerDay * 0.88) - 1; // add one extra less check (useful for 1 day eligibility)
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
      let lastData = myCache.get(ip);
      if (lastData) {
        eligibleIps.push(lastData);
      } else {
        lastData = await serviceHelper.findOneInDatabaseReverse(database, kadenaNodesCollection, q, projection).catch((error) => {
          log.error(error);
        });
        if (lastData) {
          myCache.set(ip, lastData);
          eligibleIps.push(lastData);
        }
      }
    }
  }
  const nimbusesS = eligibleIps.filter((result) => (result.tier === 'NIMBUS'));
  const stratusesS = eligibleIps.filter((result) => (result.tier === 'STRATUS'));
  const data = {
    total: nimbusesS.length + stratusesS.length,
    nimbus: nimbusesS.length,
    stratus: stratusesS.length,
  };
  const resMessage = serviceHelper.createDataMessage(data);
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

  const baseTime = 1623484964000;
  const baseHeight = 34057200;
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
  const cacheAsk = `eligible${days}`;
  let results = myCache.get(cacheAsk);
  if (!results) {
    results = await serviceHelper.findInDatabase(database, kadenaNodesCollection, query, projection).catch((error) => {
      const errMessage = serviceHelper.createErrorMessage(error.message, error.name, error.code);
      res.json(errMessage);
      log.error(error);
    });
    myCache.set(cacheAsk, results);
  }
  // a node is eligible if
  // A) zelid is present
  // B) account of kadena is present
  // C) height is bigger than minimumAcceptedBlockHeight
  // -> this is going to filter;
  // const filteredResults = results.filter((result) => result.hash === 'localSpecificationsVersion6');
  const filteredResults = results;
  const numberOfChecksPerDay = days * 48;
  const minimumPresentions = Math.floor(numberOfChecksPerDay * 0.88) - 1; // add one extra less check (useful for 1 day eligibility)
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
      let lastData = myCache.get(ip);
      if (lastData) {
        eligibleIps.push(lastData);
      } else {
        lastData = await serviceHelper.findOneInDatabaseReverse(database, kadenaNodesCollection, q, projection).catch((error) => {
          log.error(error);
        });
        if (lastData) {
          myCache.set(ip, lastData);
          eligibleIps.push(lastData);
        }
      }
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
      // if (!beginKadenExecuting) {
      beginKadena(); // TODO prevent some loop
      // } else {
      //   log.info('beginKadena() interval skipped, still running.');
      // }
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
  getKadenaEligibleStatsDays,
  getKadenaNodesForTimestamp,
};
