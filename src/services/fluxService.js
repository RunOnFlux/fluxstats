/* eslint-disable no-await-in-loop */
const axios = require('axios');
const config = require('config');
const log = require('../lib/log');
const serviceHelper = require('./serviceHelper');

const axiosConfig = {
  timeout: 13456,
};

let db = null;
const geocollection = config.database.local.collections.geolocation;
const fluxcollection = config.database.local.collections.fluxes;

let currentZelNodeIps = [];
let lastCompletedRound = 0;

async function getZelNodeList() {
  try {
    const zelnodeList = await axios.get(`${config.explorer}/api/zelnode/listzelnodes`, axiosConfig);
    return zelnodeList.data.result || [];
  } catch (e) {
    log.error(e);
    return [];
  }
}

async function getZelNodeIPs(zelnodeList) {
  try {
    const zelnodes = zelnodeList || await getZelNodeList();
    const ips = zelnodes.map((zelnode) => zelnode.ip);
    return ips;
  } catch (e) {
    log.error(e);
    return [];
  }
}

async function getZelNodeGeolocation(ip) {
  try {
    const ipApiUrl = `http://ip-api.com/json/${ip}?fields=status,country,countryCode,lat,lon,query,org`;
    const ipRes = await axios.get(ipApiUrl, axiosConfig);
    if (ipRes.data.status === 'success') {
      const information = {
        ip: ipRes.data.query,
        country: ipRes.data.country,
        countryCode: ipRes.data.countryCode,
        lat: ipRes.data.lat,
        lon: ipRes.data.lon,
        org: ipRes.data.org,
      };
      // push this to our database
      return information;
    }
    log.warn(`Geolocation of IP ${ip} is unavailable`);
    return false;
  } catch (e) {
    log.error(`Geolocation of IP ${ip} error`);
    return false;
  }
}

async function getFluxInformation(ip) {
  try {
    const fluxInfoUrl = `http://${ip}:16127/zelflux/info`;
    const fluxRes = await axios.get(fluxInfoUrl, axiosConfig);
    if (fluxRes.data.status === 'success') {
      return fluxRes.data.data;
    }
    log.warn(`Flux information of IP ${ip} is bad`);
    return {
      error: true,
    };
  } catch (e) {
    log.error(`Flux information of IP ${ip} error`);
    return {
      error: true,
    };
  }
}

function getCollateralInfo(collateralOutpoint) {
  const a = collateralOutpoint;
  const b = a.split(', ');
  const txhash = b[0].substr(10, b[0].length);
  const txindex = serviceHelper.ensureNumber(b[1].split(')')[0]);
  return { txhash, txindex };
}

async function processZelNodes() {
  try {
    const currentRoundTime = new Date().getTime();
    const currentRefreshRound = {};
    const zelnodes = await getZelNodeList();
    log.info(`Beginning processing of ${currentRoundTime}.`);
    const database = db.db(config.database.local.database);
    currentZelNodeIps = await getZelNodeIPs(zelnodes); // always defined
    log.info(`Found ${zelnodes.length} Fluxes.`);

    // eslint-disable-next-line no-restricted-syntax
    for (const [i, zelnode] of zelnodes.entries()) {
      const fluxInfo = await getFluxInformation(zelnode.ip);
      const query = { ip: zelnode.ip };
      const projection = {};
      // we shall always have geolocation
      const result = await serviceHelper.findOneInDatabase(database, geocollection, query, projection).catch((error) => {
        log.error(error);
      });
      if (result) {
        fluxInfo.geolocation = result;
      } else {
        // we do not have info about that ip yet. Get it and Store it.
        await serviceHelper.timeout(2000);
        const geoRes = await getZelNodeGeolocation(zelnode.ip);
        if (geoRes) {
          // geo ok, store it and update fluxInfo.
          await serviceHelper.insertOneToDatabase(database, geocollection, geoRes).catch((error) => {
            log.error(error);
          });
          fluxInfo.geolocation = geoRes;
        }
      }
      fluxInfo.ip = zelnode.ip;
      fluxInfo.addedHeight = zelnode.added_height;
      fluxInfo.confirmedHeight = zelnode.confirmed_height;
      fluxInfo.lastConfirmedHeight = zelnode.last_confirmed_height;
      fluxInfo.lastPaidHeight = zelnode.last_paid_height;
      fluxInfo.tier = zelnode.tier;
      fluxInfo.paymentAddress = zelnode.payment_address;
      fluxInfo.activeSince = zelnode.activesince;
      fluxInfo.collateralHash = getCollateralInfo(zelnode.collateral).txhash;
      fluxInfo.collateralIndex = getCollateralInfo(zelnode.collateral).txindex;
      fluxInfo.roundTime = currentRoundTime;
      const curTime = new Date().getTime();
      fluxInfo.dataCollectedAt = curTime;
      await serviceHelper.insertOneToDatabase(database, fluxcollection, currentRefreshRound).catch((error) => {
        log.error(error);
      });
      if ((i + 1) % 25 === 0) {
        log.info(`Checked ${i + 1}/${zelnodes.length}.`);
      }
    }
    log.info(`Processing of ${currentRoundTime} finished.`);
    lastCompletedRound = currentRoundTime;
    setTimeout(() => {
      processZelNodes();
    }, 5 * 60 * 1000);
  } catch (e) {
    log.error(e);
    setTimeout(() => {
      processZelNodes();
    }, 5 * 60 * 1000);
  }
}

async function getAllGeolocation(req, res) {
  const database = db.db(config.database.local.database);
  const query = {};
  const projection = {
    projection: {
      _id: 0,
      ip: 1,
      country: 1,
      countryCode: 1,
      lat: 1,
      lon: 1,
      org: 1,
    },
  };
  const results = await serviceHelper.findInDatabase(database, geocollection, query, projection).catch((error) => {
    const errMessage = serviceHelper.createErrorMessage(error.message, error.name, error.code);
    res.json(errMessage);
    log.error(error);
    throw error;
  });
  const resMessage = serviceHelper.createDataMessage(results);
  return res.json(resMessage);
}

async function getAllFluxInformation(req, res) {
  const database = db.db(config.database.local.database);
  const queryForIps = [];
  currentZelNodeIps.forEach((ip) => {
    const singlequery = {
      ip,
    };
    queryForIps.push(singlequery);
  });
  const query = {
    $or: queryForIps,
    roundTime: lastCompletedRound,
  };
  const projection = {
    projection: {
      _id: 0,
      ip: 1,
      addedHeight: 1,
      lastPaidHeight: 1,
      tier: 1,
      activeSince: 1,
      confirmedHeight: 1,
      lastConfirmedHeight: 1,
      collateralHash: 1,
      collateralIndex: 1,
      paymentAddress: 1,
      roundTime: 1,
      dataCollectedAt: 1,
      geolocation: 1,
      zelcash: 1,
      zelnode: 1,
      zelbench: 1,
      zelflux: 1,
      zelapps: 1,
    },
  };
  // return latest zelnode round
  const results = await serviceHelper.findInDatabase(database, fluxcollection, query, projection).catch((error) => {
    const errMessage = serviceHelper.createErrorMessage(error.message, error.name, error.code);
    res.json(errMessage);
    log.error(error);
  });
  const resMessage = serviceHelper.createDataMessage(results);
  return res.json(resMessage);
}

async function getFluxIPHistory(req, res) {
  const database = db.db(config.database.local.database);
  let { ip } = req.params; // we accept both help/command and help?command=getinfo
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
      addedHeight: 1,
      lastPaidHeight: 1,
      tier: 1,
      activeSince: 1,
      confirmedHeight: 1,
      lastConfirmedHeight: 1,
      collateralHash: 1,
      collateralIndex: 1,
      paymentAddress: 1,
      roundTime: 1,
      dataCollectedAt: 1,
      geolocation: 1,
      zelcash: 1,
      zelnode: 1,
      zelbench: 1,
      zelflux: 1,
      zelapps: 1,
    },
  };
  // return latest zelnode round
  const results = await serviceHelper.findInDatabase(database, fluxcollection, query, projection).catch((error) => {
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
    const database = db.db(config.database.local.database);
    database.collection(fluxcollection).createIndex({ ip: 1 }, { name: 'query for getting list of Flux data associated to IP address' });
    database.collection(fluxcollection).createIndex({ ip: 1, roundTime: 1 }, { name: 'query for getting list of Flux data associated to IP address since some roundTime' });
    database.collection(fluxcollection).createIndex({ addedHeight: 1 }, { name: 'query for getting list of Flux data tied to addedHeight' });
    database.collection(fluxcollection).createIndex({ lastPaidHeight: 1 }, { name: 'query for getting list of Flux data tied to lastPaidHeight' });
    database.collection(fluxcollection).createIndex({ tier: 1 }, { name: 'query for getting list of Flux data tied to tier' });
    database.collection(fluxcollection).createIndex({ paymentAddress: 1 }, { name: 'query for getting list of Flux data tied to paymentAddress' });
    database.collection(fluxcollection).createIndex({ activeSince: 1 }, { name: 'query for getting list of Flux data tied to activeSince' });
    database.collection(fluxcollection).createIndex({ confirmedHeight: 1 }, { name: 'query for getting list of Flux data that were confirmed on specific height' });
    database.collection(fluxcollection).createIndex({ lastConfirmedHeight: 1 }, { name: 'query for getting list of Flux data that were lastlyconfirmed on specific height' });
    database.collection(fluxcollection).createIndex({ collateralHash: 1, collateralIndex: 1 }, { name: 'query for getting list of list of Flux data associated to specific collateral' });
    database.collection(fluxcollection).createIndex({ roundTime: 1 }, { name: 'query for getting list of Flux data that were added in specific roundTime' });
    log.info('Initiating Flux API services...');
    // begin zelnodes processing;
    processZelNodes();
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
  getZelNodeIPs,
  getAllGeolocation,
  getAllFluxInformation,
  getFluxIPHistory,
};
