/* eslint-disable no-await-in-loop */
const axios = require('axios');
const config = require('config');
const log = require('../lib/log');
const serviceHelper = require('./serviceHelper');

const axiosConfig = {
  timeout: 3456,
};

let db = null;
const geocollection = config.database.local.collections.geolocation;
const fluxcollection = config.database.local.collections.fluxes;

async function getZelNodeList() {
  try {
    const zelnodeList = await axios.get(`${config.explorer}/api/zelnode/listzelnodes`, axiosConfig);
    return zelnodeList.data.result || [];
  } catch (e) {
    log.error(e);
    return [];
  }
}

async function getZelNodeIPs() {
  try {
    const zelnodes = await getZelNodeList();
    const ips = zelnodes.map((zelnode) => zelnode.ip);
    return ips;
  } catch (e) {
    log.error(e);
    return [];
  }
}

async function getZelNodeGeolocation(ip) {
  try {
    const ipApiUrl = `http://ip-api.com/json/${ip}}?fields=status,country,countryCode,lat,lon,query,org`;
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
    return false;
  } catch (e) {
    log.error(e);
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
    return false;
  } catch (e) {
    log.error(e);
    return false;
  }
}

async function processZelNodes() {
  try {
    const currentRoundTime = new Date().getTime();
    const currentRefreshRound = [];
    log.info(`Beginning processing of ${currentRoundTime}.`);
    const database = db.db(config.database.local.database);
    const zelnodeips = await getZelNodeIPs(); // always defined
    log.info(`Found ${zelnodeips.length} Fluxes.`);

    // eslint-disable-next-line no-restricted-syntax
    for (const [i, ip] of zelnodeips.entries()) {
      const fluxInfo = await getFluxInformation(ip);
      if (typeof fluxInfo === 'object') {
        const query = { ip };
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
          const geoRes = await getZelNodeGeolocation(ip);
          if (geoRes) {
            // geo ok, store it and update fluxInfo.
            await serviceHelper.insertOneToDatabase(database, geocollection, geoRes).catch((error) => {
              log.error(error);
            });
            fluxInfo.geolocation = geoRes;
          }
        }
      }
      fluxInfo.timestamp = currentRoundTime;
      currentRefreshRound.push(fluxInfo);
      if ((i + 1) % 25 === 0) {
        log.info(`Checked ${i + 1}/${zelnodeips.length}.`);
        log.info(fluxInfo);
      }
    }
    if (currentRefreshRound.length > 0) {
      await serviceHelper.insertOneToDatabase(database, fluxcollection, currentRefreshRound).catch((error) => {
        log.error(error);
      });
    }
    log.info(`Processing of ${currentRoundTime} finished.`);
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
  const query = {};
  const projection = {
    projection: {
      _id: 0,
      timestamp: 1,
      geolocation: 1,
      zelcash: 1,
      zelnode: 1,
      zelbench: 1,
      zelflux: 1,
      zelapps: 1,
    },
  };
  // return latest zelnode round
  const results = await serviceHelper.findOneInDatabase(database, fluxcollection, query, projection).catch((error) => {
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
  getAllGeolocation,
  getAllFluxInformation,
};
