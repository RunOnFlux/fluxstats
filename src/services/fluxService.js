/* eslint-disable no-await-in-loop */
const axios = require('axios');
const rateLimit = require('axios-rate-limit');
const config = require('config');
const LRU = require('lru-cache');
const log = require('../lib/log');
const serviceHelper = require('./serviceHelper');

const axiosConfig = {
  timeout: 5000,
};

const axiosExplorerConfig = {
  timeout: 10000,
};

let round = 0;

const httpFluxInfo = rateLimit(axios.create(), { maxRequests: 10, perMilliseconds: 1000 });
const httpGeo = rateLimit(axios.create(), { maxRequests: 1, perMilliseconds: 2000 });

// default cache
const LRUoptions = {
  max: 500, // store 500 values, we shall not have more values at any period
  maxAge: 1000 * 60 * 60, // 1 hour
};
const myCache = new LRU(LRUoptions);

let db = null;
const geocollection = config.database.local.collections.geolocation;
const fluxcollection = config.database.local.collections.fluxes;
const completedRoundsCollection = config.database.local.collections.completedRounds;

let currentFluxNodeIps = [];
let fluxNodesWithError = [];

let fluxInformationRunning = false;
let fluxLocationsRunning = false;
let fluxNodeHistoryStatsRunning = false;

async function geFluxNodeList() {
  try {
    const fluxnodeList = await axios.get(`${config.explorer}/api/fluxnode/listfluxnodes`, axiosExplorerConfig);
    return fluxnodeList.data.result || [];
  } catch (e) {
    log.error(e);
    log.error('Error getting flux node list from explorer.');
    return [];
  }
}

async function getFluxNodeIPs(fluxnodeList) {
  try {
    const fluxnodes = fluxnodeList || await geFluxNodeList();
    const ips = fluxnodes.map((fluxnode) => fluxnode.ip);
    return ips;
  } catch (e) {
    log.error(e);
    return [];
  }
}

async function getFluxNodeGeolocation(ip) {
  try {
    const ipApiUrl = `http://ip-api.com/json/${ip}?fields=status,country,countryCode,lat,lon,query,org`;
    const ipRes = await httpGeo.get(ipApiUrl, axiosConfig);
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

async function getFluxInformation(ip, timeoutConfig) {
  try {
    const fluxInfoUrl = `http://${ip}:16127/flux/info`;
    const fluxRes = await httpFluxInfo.get(fluxInfoUrl, timeoutConfig);
    if (fluxRes.data.status === 'success') {
      return fluxRes.data.data;
    }
    log.warn(`Flux information of IP ${ip} is bad`);
    return false;
  } catch (e) {
    log.error(`Flux information of IP ${ip} error`);
    return false;
  }
}

async function getFluxAppsHashes(ip, timeoutConfig) {
  try {
    const fluxInfoUrl = `http://${ip}:16127/apps/hashes`;
    const fluxRes = await httpFluxInfo.get(fluxInfoUrl, timeoutConfig);
    if (fluxRes.data.status === 'success') {
      return fluxRes.data.data;
    }
    log.warn(`Flux apps/hashes of IP ${ip} is bad`);
    return false;
  } catch (e) {
    log.error(`Flux apps/hashes of IP ${ip} error`);
    return false;
  }
}

async function getFluxSyncedHeight(ip, timeoutConfig) {
  try {
    const fluxInfoUrl = `http://${ip}:16127/explorer/scannedheight`;
    const fluxRes = await httpFluxInfo.get(fluxInfoUrl, timeoutConfig);
    if (fluxRes.data.status === 'success') {
      return fluxRes.data.data;
    }
    log.warn(`Flux height of IP ${ip} is bad`);
    return false;
  } catch (e) {
    log.error(`Flux height of IP ${ip} error`);
    return false;
  }
}

async function getConnectionsOut(ip, timeoutConfig) {
  try {
    const fluxInfoUrl = `http://${ip}:16127/flux/connectedpeers`;
    const fluxRes = await httpFluxInfo.get(fluxInfoUrl, timeoutConfig);
    if (fluxRes.data.status === 'success') {
      return fluxRes.data.data;
    }
    log.warn(`Flux out peers of IP ${ip} is bad`);
    return false;
  } catch (e) {
    log.error(`Flux out peers of IP ${ip} error`);
    return false;
  }
}

async function getConnectionsIn(ip, timeoutConfig) {
  try {
    const fluxInfoUrl = `http://${ip}:16127/flux/incomingconnections`;
    const fluxRes = await httpFluxInfo.get(fluxInfoUrl, timeoutConfig);
    if (fluxRes.data.status === 'success') {
      return fluxRes.data.data;
    }
    log.warn(`Flux in peers of IP ${ip} is bad`);
    return false;
  } catch (e) {
    log.error(`Flux in peers of IP ${ip} error`);
    return false;
  }
}

function getCollateralInfo(collateralOutpoint) {
  const a = collateralOutpoint;
  const b = a.split(', ');
  const txhash = b[0].substr(10, b[0].length);
  const txindex = serviceHelper.ensureNumber(b[1].split(')')[0]);
  return { txhash, txindex };
}

async function createHistoryStats() {
  const database = db.db(config.database.local.database);
  // last month
  const lastMonthTime = new Date().getTime() - 2592000000; // 30 days in ms
  const q = {
    timestamp: { $gte: lastMonthTime },
  };
  const p = {
    _id: 0,
    timestamp: 1,
  };
  const completedRounds = await serviceHelper.findInDatabase(database, completedRoundsCollection, q, p);
  const bresults = completedRounds.map((x) => x.timestamp);
  // pick 12 times from each day
  // data are collected roughly every 15 minutes -> 96 collections per day. Take every 8th data
  let i = bresults.length;
  const okTimestamps = [];
  // eslint-disable-next-line no-plusplus
  while (i--) {
    if ((i + 1) % 8) {
      okTimestamps.push(bresults[i]);
    }
  }
  const queryForTimes = [];
  okTimestamps.forEach((time) => {
    const singlequery = {
      roundTime: time,
    };
    queryForTimes.push(singlequery);
  });
  const query = {};
  if (queryForTimes.length > 0) {
    query.$or = queryForTimes;
  }
  const projection = {
    projection: {
      _id: 0,
      roundTime: 1,
      tier: 1,
    },
  };
  // return latest fluxnode round
  const results = await serviceHelper.findInDatabase(database, fluxcollection, query, projection);
  // array of object containing tier and roundtime
  const data = {};
  // this array can be quite large
  results.forEach((result) => {
    if (data[result.roundTime]) {
      if (result.tier === 'CUMULUS') {
        if (data[result.roundTime].cumulus) {
          data[result.roundTime].cumulus += 1;
        } else {
          data[result.roundTime].cumulus = 1;
        }
      } else if (result.tier === 'NIMBUS') {
        if (data[result.roundTime].nimbus) {
          data[result.roundTime].nimbus += 1;
        } else {
          data[result.roundTime].nimbus = 1;
        }
      } else if (result.tier === 'STRATUS') {
        if (data[result.roundTime].stratus) {
          data[result.roundTime].stratus += 1;
        } else {
          data[result.roundTime].stratus = 1;
        }
      }
    } else {
      data[result.roundTime] = {};
      if (result.tier === 'CUMULUS') {
        if (data[result.roundTime].cumulus) {
          data[result.roundTime].cumulus += 1;
        } else {
          data[result.roundTime].cumulus = 1;
        }
      } else if (result.tier === 'NIMBUS') {
        if (data[result.roundTime].nimbus) {
          data[result.roundTime].nimbus += 1;
        } else {
          data[result.roundTime].nimbus = 1;
        }
      } else if (result.tier === 'STRATUS') {
        if (data[result.roundTime].stratus) {
          data[result.roundTime].stratus += 1;
        } else {
          data[result.roundTime].stratus = 1;
        }
      }
    }
  });
  myCache.set('historyStats', data);
}

async function processFluxNode(fluxnode, currentRoundTime, timeoutConfig) {
  try {
    const database = db.db(config.database.local.database);
    const fluxInfo = await getFluxInformation(fluxnode.ip, timeoutConfig);
    const appsHashes = await getFluxAppsHashes(fluxnode.ip, getFluxAppsHashes);
    const scannedHeightInfo = await getFluxSyncedHeight(fluxnode.ip, timeoutConfig);
    const conOut = await getConnectionsOut(fluxnode.ip, timeoutConfig);
    // const conIn = await getConnectionsIn(fluxnode.ip, timeoutConfig);
    if (!fluxInfo) {
      fluxNodesWithError.push(fluxnode);
      return;
    }
    const query = { ip: fluxnode.ip };
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
    // we shall always have geolocation
    const result = await serviceHelper.findOneInDatabase(database, geocollection, query, projection).catch((error) => {
      log.error(error);
    });
    if (result) {
      fluxInfo.geolocation = result;
    } else {
      // we do not have info about that ip yet. Get it and Store it.
      const geoRes = await getFluxNodeGeolocation(fluxnode.ip);
      if (geoRes) {
        // geo ok, store it and update fluxInfo.
        await serviceHelper.insertOneToDatabase(database, geocollection, geoRes).catch((error) => {
          log.error(error);
        });
        fluxInfo.geolocation = geoRes;
      }
    }
    fluxInfo.ip = fluxnode.ip;
    fluxInfo.addedHeight = fluxnode.added_height;
    fluxInfo.confirmedHeight = fluxnode.confirmed_height;
    fluxInfo.lastConfirmedHeight = fluxnode.last_confirmed_height;
    fluxInfo.lastPaidHeight = fluxnode.last_paid_height;
    fluxInfo.tier = fluxnode.tier;
    fluxInfo.paymentAddress = fluxnode.payment_address;
    fluxInfo.activeSince = fluxnode.activesince;
    fluxInfo.collateralHash = getCollateralInfo(fluxnode.collateral).txhash;
    fluxInfo.collateralIndex = getCollateralInfo(fluxnode.collateral).txindex;
    fluxInfo.roundTime = currentRoundTime;
    if (appsHashes) {
      const hashesOk = appsHashes.filter((data) => data.height >= 964000);
      fluxInfo.appsHashesTotal = hashesOk.length;
      const mesOK = hashesOk.filter((mes) => mes.message === true);
      fluxInfo.hashesPresent = mesOK.length;
    }

    if (scannedHeightInfo) {
      fluxInfo.scannedHeight = scannedHeightInfo.generalScannedHeight;
    }

    if (conOut) {
      fluxInfo.connectionsOut = conOut;
    }

    // if (conIn) {
    //   const conInOk = [];
    //   conIn.forEach((con) => {
    //     conInOk.push(con.replace('::ffff:', ''));
    //   });
    //   fluxInfo.connectionsIn = conInOk;
    // }

    const curTime = new Date().getTime();
    fluxInfo.dataCollectedAt = curTime;
    // additionally has daemon, benchmark, node, flux, apps
    await serviceHelper.insertOneToDatabase(database, fluxcollection, fluxInfo).catch((error) => {
      log.error(`Flux information of IP ${fluxnode.ip} error inserting in db: ${error}`);
    });
    log.info(fluxInfo);
  } catch (error) {
    log.error(error);
  }
}

async function processFluxNodes() {
  const startRefresh = new Date().getTime();
  try {
    round += 1;
    fluxNodesWithError = [];
    const database = db.db(config.database.local.database);
    const currentRoundTime = new Date().getTime();
    log.info(`Beginning processing of ${currentRoundTime}.`);
    const fluxnodes = await geFluxNodeList();
    log.info(`Found ${fluxnodes.length} Fluxes.`);
    if (fluxnodes && fluxnodes.length > 0) {
      currentFluxNodeIps = await getFluxNodeIPs(fluxnodes);
      let promiseArray = [];
      // eslint-disable-next-line no-restricted-syntax
      for (const [i, fluxnode] of fluxnodes.entries()) {
        promiseArray.push(processFluxNode(fluxnode, currentRoundTime, axiosConfig));
        if ((i + 1) % 10 === 0) {
          await Promise.allSettled(promiseArray);
          promiseArray = [];
          log.info(`Flux Nodes Processed: ${i + 1}`);
        }
      }
      if (promiseArray.length > 0) {
        await Promise.allSettled(promiseArray);
        promiseArray = [];
      }
      let fluxNodesWithErrorAux = [];
      let retry = 0;
      while (fluxNodesWithError.length > 0 && retry < 5) {
        log.info(`Found ${fluxNodesWithError.length} with errors.`);
        fluxNodesWithErrorAux = [...fluxNodesWithError];
        // eslint-disable-next-line no-restricted-syntax
        for (let i = 0; i < fluxNodesWithErrorAux.length; i += 1) {
          const fluxnode = fluxNodesWithErrorAux[i];
          const index = fluxNodesWithError.indexOf(fluxnode);
          fluxNodesWithError.splice(index, 1);
          let timeoutConfig = axiosConfig;
          if (retry === 4) {
            timeoutConfig = axiosExplorerConfig;
          }
          promiseArray.push(processFluxNode(fluxnode, currentRoundTime, timeoutConfig));
          if ((i + 1) % 10 === 0) {
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
      log.info(`Processing of ${currentRoundTime} finished.`);
      log.info(`Total Nodes with errors: ${fluxNodesWithError.length}`);
      fluxNodesWithErrorAux = [];
      const crt = {
        timestamp: currentRoundTime,
      };
      await serviceHelper.insertOneToDatabase(database, completedRoundsCollection, crt).catch((error) => {
        log.error(error);
      });
      // for every 2 runs start createHistoryStatys after 60 seconds
      if (round % 2 === 0) {
        await serviceHelper.timeout(60000);
        await createHistoryStats();
      }
    } else {
      log.error('No flux Nodes Found');
    }
  } catch (e) {
    log.error(e);
  } finally {
    const endRefresh = new Date().getTime() - startRefresh;
    log.info(`Execution time of processFluxNodes: ${endRefresh} ms`);
    processFluxNodes();
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

async function getAllFluxInformation(req, res, i = 0) {
  try {
    if (fluxInformationRunning) {
      await serviceHelper.timeout(100);
      if (i < 300) {
        getAllFluxInformation(req, res, i + 1);
      }
      return;
    }
    fluxInformationRunning = true;
    const database = db.db(config.database.local.database);
    const q = {};
    const p = {};
    const lastRound = await serviceHelper.findOneInDatabaseReverse(database, completedRoundsCollection, q, p).catch((error) => {
      const errMessage = serviceHelper.createErrorMessage(error.message, error.name, error.code);
      res.json(errMessage);
      log.error(error);
    });
    const lastCompletedRound = lastRound ? lastRound.timestamp : 0;
    const queryForIps = [];
    currentFluxNodeIps.forEach((ip) => {
      const singlequery = {
        ip,
      };
      queryForIps.push(singlequery);
    });
    const query = {
      roundTime: lastCompletedRound,
    };
    if (queryForIps.length > 0) {
      query.$or = queryForIps;
    }
    // projection is comma separated list;
    let { projection } = req.params;
    projection = projection || req.query.projection;
    if (projection) {
      const projArray = projection.split(',');
      projection = {
        projection: {
          _id: 0,
        },
      };
      projArray.forEach((pr) => {
        projection.projection[pr] = 1;
      });
    } else {
      projection = {
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
          daemon: 1,
          node: 1,
          benchmark: 1,
          flux: 1,
          apps: 1,
          appsHashesTotal: 1,
          hashesPresent: 1,
          scannedHeight: 1,
          connectionsOut: 1,
          connectionsIn: 1,
        },
      };
    }
    // return latest fluxnode round
    const results = await serviceHelper.findInDatabase(database, fluxcollection, query, projection).catch((error) => {
      const errMessage = serviceHelper.createErrorMessage(error.message, error.name, error.code);
      res.json(errMessage);
      log.error(error);
    });
    const resMessage = serviceHelper.createDataMessage(results);
    res.json(resMessage);
    fluxInformationRunning = false;
  } catch (error) {
    fluxInformationRunning = false;
    const errMessage = serviceHelper.createErrorMessage(error.message, error.name, error.code);
    res.json(errMessage);
    log.error(error);
  }
}

async function getAllFluxVersions(req, res) {
  try {
    const database = db.db(config.database.local.database);
    const q = {};
    const p = {};
    const lastRound = await serviceHelper.findOneInDatabaseReverse(database, completedRoundsCollection, q, p).catch((error) => {
      const errMessage = serviceHelper.createErrorMessage(error.message, error.name, error.code);
      res.json(errMessage);
      log.error(error);
    });
    const lastCompletedRound = lastRound ? lastRound.timestamp : 0;
    const queryForIps = [];
    currentFluxNodeIps.forEach((ip) => {
      const singlequery = {
        ip,
      };
      queryForIps.push(singlequery);
    });
    const query = {
      roundTime: lastCompletedRound,
    };
    if (queryForIps.length > 0) {
      query.$or = queryForIps;
    }
    const projection = {
      projection: {
        _id: 0,
        daemon: 1,
        benchmark: 1,
        flux: 1,
      },
    };
    // return latest fluxnode round
    const results = await serviceHelper.findInDatabase(database, fluxcollection, query, projection).catch((error) => {
      const errMessage = serviceHelper.createErrorMessage(error.message, error.name, error.code);
      res.json(errMessage);
      log.error(error);
    });
    const allData = [];
    results.forEach((flux) => {
      if (flux.daemon) {
        const fluxData = {
          ip: flux.flux.ip,
          daemon: flux.daemon.info.version,
          benchmark: flux.benchmark.info.version,
          flux: flux.flux.version,
        };
        allData.push(fluxData);
      } else {
        const fluxData = {
          ip: flux.ip,
          daemon: null,
          benchmark: null,
          flux: null,
        };
        allData.push(fluxData);
      }
    });
    const resMessage = serviceHelper.createDataMessage(allData);
    res.json(resMessage);
  } catch (error) {
    const errMessage = serviceHelper.createErrorMessage(error.message, error.name, error.code);
    res.json(errMessage);
    log.error(error);
  }
}

async function getAllFluxGeolocation(req, res, i = 0) {
  try {
    if (fluxLocationsRunning) {
      await serviceHelper.timeout(100);
      if (i < 300) {
        getAllFluxGeolocation(req, res, i + 1);
      }
      return;
    }
    fluxLocationsRunning = true;
    const database = db.db(config.database.local.database);
    const q = {};
    const p = {};
    const lastRound = await serviceHelper.findOneInDatabaseReverse(database, completedRoundsCollection, q, p).catch((error) => {
      const errMessage = serviceHelper.createErrorMessage(error.message, error.name, error.code);
      res.json(errMessage);
      log.error(error);
    });
    const lastCompletedRound = lastRound ? lastRound.timestamp : 0;
    const queryForIps = [];
    currentFluxNodeIps.forEach((ip) => {
      const singlequery = {
        ip,
      };
      queryForIps.push(singlequery);
    });
    const query = {
      roundTime: lastCompletedRound,
    };
    if (queryForIps.length > 0) {
      query.$or = queryForIps;
    }
    const projection = {
      projection: {
        _id: 0,
        geolocation: 1,
      },
    };
    // return latest fluxnode round
    let results = myCache.get('geolocation');
    if (!results) {
      results = await serviceHelper.findInDatabase(database, fluxcollection, query, projection).catch((error) => {
        const errMessage = serviceHelper.createErrorMessage(error.message, error.name, error.code);
        res.json(errMessage);
        log.error(error);
      });
      myCache.set('geolocation', results);
    }
    const bresults = results.map((x) => x.geolocation);
    const resMessage = serviceHelper.createDataMessage(bresults);
    fluxLocationsRunning = false;
    res.json(resMessage);
  } catch (error) {
    fluxLocationsRunning = false;
    const errMessage = serviceHelper.createErrorMessage(error.message, error.name, error.code);
    res.json(errMessage);
    log.error(error);
  }
}

async function getFluxIPHistory(req, res) {
  try {
    const database = db.db(config.database.local.database);
    let { ip } = req.params; // we accept both help/command and help?command=getinfo
    ip = ip || req.query.ip;
    if (!ip) {
      const errMessage = serviceHelper.createErrorMessage('No IP provided');
      res.json(errMessage);
      return;
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
        daemon: 1,
        node: 1,
        benchmark: 1,
        flux: 1,
        apps: 1,
      },
    };
    // return latest fluxnode round
    const results = await serviceHelper.findInDatabase(database, fluxcollection, query, projection).catch((error) => {
      const errMessage = serviceHelper.createErrorMessage(error.message, error.name, error.code);
      res.json(errMessage);
      log.error(error);
    });
    const resMessage = serviceHelper.createDataMessage(results);
    res.json(resMessage);
  } catch (error) {
    const errMessage = serviceHelper.createErrorMessage(error.message, error.name, error.code);
    res.json(errMessage);
    log.error(error);
  }
}

async function getCompletedRoundsTimestamps(req, res) {
  try {
    const database = db.db(config.database.local.database);
    const q = {};
    const p = {};
    const completedRounds = await serviceHelper.findInDatabase(database, completedRoundsCollection, q, p).catch((error) => {
      const errMessage = serviceHelper.createErrorMessage(error.message, error.name, error.code);
      res.json(errMessage);
      log.error(error);
    });
    const bresults = completedRounds.map((x) => x.timestamp);
    const resMessage = serviceHelper.createDataMessage(bresults);
    res.json(resMessage);
  } catch (error) {
    const errMessage = serviceHelper.createErrorMessage(error.message, error.name, error.code);
    res.json(errMessage);
    log.error(error);
  }
}

async function getAllFluxGeolocationNow(req, res) {
  try {
    const database = db.db(config.database.local.database);
    const queryForIps = [];
    const fluxnodeIpsNow = await getFluxNodeIPs();
    fluxnodeIpsNow.forEach((ip) => {
      const singlequery = {
        ip,
      };
      queryForIps.push(singlequery);
    });
    const query = {};
    if (queryForIps.length > 0) {
      query.$or = queryForIps;
    }
    const projection = {
      projection: {
        _id: 0,
        geolocation: 1,
      },
    };
    // return latest fluxnode round
    const results = await serviceHelper.findInDatabase(database, fluxcollection, query, projection).catch((error) => {
      const errMessage = serviceHelper.createErrorMessage(error.message, error.name, error.code);
      res.json(errMessage);
      log.error(error);
    });
    const bresults = results.map((x) => x.geolocation);
    const cresults = [...new Set(bresults)];
    const resMessage = serviceHelper.createDataMessage(cresults);
    res.json(resMessage);
  } catch (error) {
    const errMessage = serviceHelper.createErrorMessage(error.message, error.name, error.code);
    res.json(errMessage);
    log.error(error);
  }
}

async function fluxNodesHistoryStats(req, res, i = 0) {
  try {
    if (fluxNodeHistoryStatsRunning) {
      await serviceHelper.timeout(100);
      if (i < 300) {
        fluxNodesHistoryStats(req, res, i + 1);
      }
      return;
    }
    fluxNodeHistoryStatsRunning = true;
    let dataForSend = myCache.get('historyStats');
    if (!dataForSend) {
      await createHistoryStats();
    }
    dataForSend = myCache.get('historyStats');
    const resMessage = serviceHelper.createDataMessage(dataForSend);
    fluxNodeHistoryStatsRunning = false;
    res.json(resMessage);
  } catch (error) {
    fluxNodeHistoryStatsRunning = false;
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
    database.collection(fluxcollection).createIndex({ appsHashesTotal: 1 }, { name: 'query for getting app hashes' });
    database.collection(fluxcollection).createIndex({ hashesPresent: 1 }, { name: 'query for getting app hashes present' });
    database.collection(fluxcollection).createIndex({ scannedHeight: 1 }, { name: 'query for getting scanned height' });
    database.collection(fluxcollection).createIndex({ connectionsOut: 1 }, { name: 'query for getting connections out' });
    database.collection(fluxcollection).createIndex({ connectionsIn: 1 }, { name: 'query for getting connections in' });
    log.info('Initiating Flux API services...');
    // begin fluxnodes processing;
    await createHistoryStats();
    processFluxNodes();
  } catch (e) {
    // restart service after 5 mins
    log.error(e);
    setTimeout(() => {
      start();
    }, 5 * 60 * 1000);
  }
}
module.exports = {
  start,
  getFluxNodeIPs,
  getAllGeolocation,
  getAllFluxInformation,
  getFluxIPHistory,
  getAllFluxGeolocation,
  getAllFluxVersions,
  getCompletedRoundsTimestamps,
  getAllFluxGeolocationNow,
  fluxNodesHistoryStats,
};
