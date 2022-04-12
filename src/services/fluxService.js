/* eslint-disable no-await-in-loop */
const axios = require('axios');
const rateLimit = require('axios-rate-limit');
const config = require('config');
const LRU = require('lru-cache');
const log = require('../lib/log');
const serviceHelper = require('./serviceHelper');

const defaultTimeout = 5000;

const explorerTimeout = 10000;

let round = 0;

const httpFluxInfo = rateLimit(axios.create(), { maxRequests: 20, perMilliseconds: 1000 });
const httpGeo = rateLimit(axios.create(), { maxRequests: 1, perMilliseconds: 1500 });
const httpGeoBatch = rateLimit(axios.create(), { maxRequests: 1, perMilliseconds: 3950 });

// default cache
const LRUoptions = {
  max: 500, // store 500 values, we shall not have more values at any period
  ttl: 1000 * 60 * 60, // 1 hour
};
const myCache = new LRU(LRUoptions);

const LRUoptionsMid = {
  max: 500, // store 500 values, we shall not have more values at any period
  ttl: 1000 * 60 * 20, // 20 mins
};
const myCacheMid = new LRU(LRUoptionsMid);

const LRUoptionsShort = {
  max: 500, // store 500 values, we shall not have more values at any period
  ttl: 1000 * 60 * 5, // 5 mins
};

const myCacheShort = new LRU(LRUoptionsShort);

let db = null;
const geocollection = config.database.local.collections.geolocation;
const fluxcollection = config.database.local.collections.fluxes;
const completedRoundsCollection = config.database.local.collections.completedRounds;

let currentFluxNodeIps = [];
let fluxNodesWithError = [];

let firstExecution = true;
let processedFluxNodes = [];

let runninggetFluxNodeList = false;
async function getFluxNodeList(i = 0) {
  try {
    const list = myCacheShort.get('fluxnodelist');
    if (list) {
      return list;
    }
    if (runninggetFluxNodeList) {
      await serviceHelper.timeout(100);
      if (i < 300) {
        return getFluxNodeList(i + 1);
      }
      throw new Error('Internal error. Try again later');
    }
    runninggetFluxNodeList = true;
    const fluxnodeList = await axios.get(`${config.explorer}/api/fluxnode/listfluxnodes`, { timeout: explorerTimeout });
    if (fluxnodeList.data.result.length) {
      myCacheShort.set('fluxnodelist', fluxnodeList.data.result);
    }
    runninggetFluxNodeList = false;
    return fluxnodeList.data.result || [];
  } catch (e) {
    runninggetFluxNodeList = false;
    log.error(e);
    log.error('Error getting flux node list from explorer.');
    return [];
  }
}

async function getFluxNodeIPs(fluxnodeList) {
  try {
    const fluxnodes = fluxnodeList || await getFluxNodeList();
    const ips = fluxnodes.map((fluxnode) => fluxnode.ip);
    return ips;
  } catch (e) {
    log.error(e);
    return [];
  }
}

async function getFluxNodeGeolocation(ip) {
  try {
    const { CancelToken } = axios;
    const source = CancelToken.source();
    let isResolved = false;
    setTimeout(() => {
      if (!isResolved) {
        source.cancel('Operation canceled by the user.');
      }
    }, defaultTimeout * 2);
    const ipApiUrl = `http://ip-api.com/json/${ip.split(':')[0]}?fields=status,continent,continentCode,country,countryCode,region,regionName,lat,lon,query,org`;
    const ipRes = await httpGeo.get(ipApiUrl);
    isResolved = true;
    if (ipRes.data.status === 'success') {
      const information = {
        ip: ipRes.data.query,
        continent: ipRes.data.continent,
        continentCode: ipRes.data.continentCode,
        country: ipRes.data.country,
        countryCode: ipRes.data.countryCode,
        region: ipRes.data.region,
        regionName: ipRes.data.regionName,
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
    log.error(`Geolocation of IP ${ip} error ${e}`);
    return false;
  }
}

async function getFluxInformation(ip, timeout) {
  try {
    const { CancelToken } = axios;
    const source = CancelToken.source();
    let isResolved = false;
    setTimeout(() => {
      if (!isResolved) {
        source.cancel('Operation canceled by the user.');
      }
    }, timeout * 2);
    const port = ip.split(':')[1] || 16127;
    const fluxInfoUrl = `http://${ip.split(':')[0]}:${port}/flux/info`;
    const fluxRes = await httpFluxInfo.get(fluxInfoUrl, {
      cancelToken: source.token,
      timeout,
    });
    isResolved = true;
    if (fluxRes.data.status === 'success') {
      return fluxRes.data.data;
    }
    log.warn(`Flux information of IP ${ip} is bad`);
    return false;
  } catch (e) {
    log.error(`Flux information of IP ${ip} error: ${e}`);
    return false;
  }
}

async function getFluxAppsHashes(ip, timeout) {
  try {
    const { CancelToken } = axios;
    const source = CancelToken.source();
    let isResolved = false;
    setTimeout(() => {
      if (!isResolved) {
        source.cancel('Operation canceled by the user.');
      }
    }, timeout * 2);
    const port = ip.split(':')[1] || 16127;
    const fluxInfoUrl = `http://${ip.split(':')[0]}:${port}/apps/hashes`;
    const fluxRes = await httpFluxInfo.get(fluxInfoUrl, {
      cancelToken: source.token,
      timeout,
    });
    isResolved = true;
    if (fluxRes.data.status === 'success') {
      return fluxRes.data.data;
    }
    log.warn(`Flux apps/hashes of IP ${ip} is bad`);
    return false;
  } catch (e) {
    log.error(`Flux apps/hashes of IP ${ip} error: ${e}`);
    return false;
  }
}

async function getFluxSyncedHeight(ip, timeout) {
  try {
    const { CancelToken } = axios;
    const source = CancelToken.source();
    let isResolved = false;
    setTimeout(() => {
      if (!isResolved) {
        source.cancel('Operation canceled by the user.');
      }
    }, timeout * 2);
    const port = ip.split(':')[1] || 16127;
    const fluxInfoUrl = `http://${ip.split(':')[0]}:${port}/explorer/scannedheight`;
    const fluxRes = await httpFluxInfo.get(fluxInfoUrl, {
      cancelToken: source.token,
      timeout,
    });
    isResolved = true;
    if (fluxRes.data.status === 'success') {
      return fluxRes.data.data;
    }
    log.warn(`Flux height of IP ${ip} is bad`);
    return false;
  } catch (e) {
    log.error(`Flux height of IP ${ip} error: ${e}`);
    return false;
  }
}

async function getConnectionsOut(ip, timeout) {
  try {
    const { CancelToken } = axios;
    const source = CancelToken.source();
    let isResolved = false;
    setTimeout(() => {
      if (!isResolved) {
        source.cancel('Operation canceled by the user.');
      }
    }, timeout * 2);
    const port = ip.split(':')[1] || 16127;
    const fluxInfoUrl = `http://${ip.split(':')[0]}:${port}/flux/connectedpeers`;
    const fluxRes = await httpFluxInfo.get(fluxInfoUrl, {
      cancelToken: source.token,
      timeout,
    });
    isResolved = true;
    if (fluxRes.data.status === 'success') {
      return fluxRes.data.data;
    }
    log.warn(`Flux out peers of IP ${ip} is bad`);
    return false;
  } catch (e) {
    log.error(`Flux out peers of IP ${ip} error: ${e}`);
    return false;
  }
}

async function getConnectionsIn(ip, timeout) {
  try {
    const { CancelToken } = axios;
    const source = CancelToken.source();
    let isResolved = false;
    setTimeout(() => {
      if (!isResolved) {
        source.cancel('Operation canceled by the user.');
      }
    }, timeout * 2);
    const port = ip.split(':')[1] || 16127;
    const fluxInfoUrl = `http://${ip.split(':')[0]}:${port}/flux/incomingconnections`;
    const fluxRes = await httpFluxInfo.get(fluxInfoUrl, {
      cancelToken: source.token,
      timeout,
    });
    isResolved = true;
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
  const txhash = b[0].slice(10);
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

async function processFluxNode(fluxnode, currentRoundTime, timeout, retry = false) {
  try {
    const database = db.db(config.database.local.database);
    const fluxInfo = await getFluxInformation(fluxnode.ip, timeout);
    if (!fluxInfo) {
      if (retry) {
        throw new Error(`Retry processFluxNode for the FluxNode ip: ${fluxnode.ip}`);
      } else {
        fluxNodesWithError.push(fluxnode);
        return;
      }
    }
    const appsHashes = await getFluxAppsHashes(fluxnode.ip, timeout * 3);
    const scannedHeightInfo = await getFluxSyncedHeight(fluxnode.ip, timeout);
    const conOut = await getConnectionsOut(fluxnode.ip, timeout);
    const conIn = await getConnectionsIn(fluxnode.ip, timeout);
    const auxIp = fluxnode.ip.includes(':') ? fluxnode.ip.split(':')[0] : fluxnode.ip;
    const query = { ip: auxIp };
    const projection = {
      projection: {
        _id: 0,
        ip: 1,
        continent: 1,
        continentCode: 1,
        country: 1,
        countryCode: 1,
        region: 1,
        regionName: 1,
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
      log.info(`Geolocation not found in db for the ip ${auxIp} let's call api.`);
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
      const hashesOk = appsHashes.filter((data) => data.height >= 694000);
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

    if (conIn) {
      const conInOk = [];
      conIn.forEach((con) => {
        conInOk.push(con.replace('::ffff:', ''));
      });
      fluxInfo.connectionsIn = conInOk;
    }

    const curTime = new Date().getTime();
    fluxInfo.dataCollectedAt = curTime;
    processedFluxNodes.push(fluxInfo);
  } catch (error) {
    if (retry) {
      await serviceHelper.timeout(5000);
      await processFluxNode(fluxnode, currentRoundTime, timeout * 2);
    } else {
      log.error(error);
    }
  }
}

async function getGeolocationInBatchAndRefreshDatabase() {
  const startRefresh = new Date().getTime();
  try {
    log.info('getGeolocationInBatchAndRefreshDatabase started');
    const fluxNodesGeolocations = [];
    let filterGeolocation = [];
    const { CancelToken } = axios;
    const source = CancelToken.source();
    const ipApiUrl = 'http://ip-api.com/batch';
    let isResolved = false;
    let geoExecuted = false;
    // eslint-disable-next-line no-restricted-syntax
    for (let i = 0; i < currentFluxNodeIps.length; i += 1) {
      const ip = currentFluxNodeIps[i];
      geoExecuted = false;
      const auxIp = ip.includes(':') ? ip.split(':')[0] : ip;
      filterGeolocation.push(auxIp);
      isResolved = false;
      if ((i + 1) % 100 === 0) {
        // eslint-disable-next-line no-loop-func
        setTimeout(() => {
          if (!isResolved) {
            source.cancel('Operation canceled by the user.');
          }
        }, defaultTimeout * 2);
        try {
          const ipRes = await httpGeoBatch.post(ipApiUrl, filterGeolocation);
          filterGeolocation = [];
          isResolved = true;
          // eslint-disable-next-line no-restricted-syntax
          for (const geo of ipRes.data) {
            if (geo.status === 'success') {
              const geoInformation = {
                ip: geo.query,
                continent: geo.continent,
                continentCode: geo.continentCode,
                country: geo.country,
                countryCode: geo.countryCode,
                region: geo.region,
                regionName: geo.regionName,
                lat: geo.lat,
                lon: geo.lon,
                org: geo.org,
              };
              fluxNodesGeolocations.push(geoInformation);
            }
          }
          geoExecuted = true;
          log.info(`Flux Geolocation Batch Processed: ${i + 1}`);
        } catch (e) {
          log.error(`Flux Geolocation failed with error: ${e}`);
        }
      }

      if (!geoExecuted && i + 1 === currentFluxNodeIps.length) {
        // eslint-disable-next-line no-loop-func
        setTimeout(() => {
          if (!isResolved) {
            source.cancel('Operation canceled by the user.');
          }
        }, defaultTimeout * 2);
        try {
          const ipRes = await httpGeoBatch.post(ipApiUrl, filterGeolocation);
          filterGeolocation = [];
          isResolved = true;
          // eslint-disable-next-line no-restricted-syntax
          for (const geo of ipRes.data) {
            if (geo.status === 'success') {
              const geoInformation = {
                ip: geo.query,
                continent: geo.continent,
                continentCode: geo.continentCode,
                country: geo.country,
                countryCode: geo.countryCode,
                region: geo.region,
                regionName: geo.regionName,
                lat: geo.lat,
                lon: geo.lon,
                org: geo.org,
              };
              fluxNodesGeolocations.push(geoInformation);
            }
          }
          geoExecuted = true;
          log.info(`Flux Geolocation Batch Processed: ${i}`);
        } catch (e) {
          log.error(`Flux Geolocation failed with error: ${e}`);
        }
      }
    }
    const uniqueGeolocations = [...new Set(fluxNodesGeolocations)];
    const database = db.db(config.database.local.database);
    log.info('Dropping MongoDB Geolocation Collection');
    await serviceHelper.dropCollection(database, geocollection).catch((error) => {
      log.error(error);
    });
    log.info('Creating MongoDB Geolocation Collection');
    await serviceHelper.createCollection(database, geocollection).catch((error) => {
      log.error(error);
    });
    const options = {
      ordered: false, // If false, continue with remaining inserts when one fails.
    };
    log.info('Inserting MongoDB Geolocation FluxNodesGeolocations');
    await serviceHelper.insertManyToDatabase(database, geocollection, uniqueGeolocations, options).catch((error) => {
      log.error(`Error inserting in geocollection db: ${error}`);
    });
  } finally {
    log.info('getGeolocationInBatchAndRefreshDatabase finished');
    const endRefresh = new Date().getTime() - startRefresh;
    log.info(`Execution time of getGeolocationInBatchAndRefreshDatabase: ${endRefresh} ms`);
  }
}

async function processFluxNodes() {
  const startRefresh = new Date().getTime();
  try {
    round += 1;
    fluxNodesWithError = [];
    processedFluxNodes = [];
    const database = db.db(config.database.local.database);
    const currentRoundTime = new Date().getTime();
    log.info(`Beginning processing processFluxNodes of ${currentRoundTime}.`);
    const fluxnodes = await getFluxNodeList();
    // const fluxnodes = [{ ip: '78.216.167.78' }]; // fluxnode that was causing the hang.
    log.info(`Found ${fluxnodes.length} Fluxes.`);
    if (fluxnodes && fluxnodes.length > 0) {
      currentFluxNodeIps = await getFluxNodeIPs(fluxnodes);
      if (firstExecution) {
        // first execution we will clean get all nodes geolocation in batch and clean db with the new data
        firstExecution = false;
        await getGeolocationInBatchAndRefreshDatabase();
      }
      let promiseArray = [];
      // eslint-disable-next-line no-restricted-syntax
      for (const [i, fluxnode] of fluxnodes.entries()) {
        promiseArray.push(processFluxNode(fluxnode, currentRoundTime, defaultTimeout));
        if ((i + 1) % 30 === 0) {
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

      log.info(`Found ${fluxNodesWithError.length} FluxNodes with errors.`);
      fluxNodesWithErrorAux = [...fluxNodesWithError];
      // eslint-disable-next-line no-restricted-syntax
      for (let i = 0; i < fluxNodesWithErrorAux.length; i += 1) {
        const fluxnode = fluxNodesWithErrorAux[i];
        const index = fluxNodesWithError.indexOf(fluxnode);
        fluxNodesWithError.splice(index, 1);
        promiseArray.push(processFluxNode(fluxnode, currentRoundTime, explorerTimeout, true));
        if ((i + 1) % 20 === 0) {
          await Promise.allSettled(promiseArray);
          promiseArray = [];
          log.info(`Flux Nodes With Error Processed: ${i + 1}`);
          log.info(`Found ${fluxNodesWithError.length} FluxNodes with errors.`);
        }
      }
      if (promiseArray.length > 0) {
        await Promise.allSettled(promiseArray);
        promiseArray = [];
      }
      log.info(`Finalized with ${fluxNodesWithError.length} FluxNodes with errors.`);

      await serviceHelper.insertManyToDatabase(database, fluxcollection, processedFluxNodes).catch((error) => {
        log.error(`Error inserting in fluxcollection db: ${error}`);
      });
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

let runninggetAllGeolocation = false;
async function getAllGeolocation(req, res, i = 0) {
  try {
    let list = myCacheShort.get('allgeolocation');
    if (!list) {
      if (runninggetAllGeolocation) {
        await serviceHelper.timeout(100);
        if (i < 300) {
          getAllGeolocation(req, res, i + 1);
        }
        throw new Error('Internal error. Try again later');
      }
      runninggetAllGeolocation = true;
      const database = db.db(config.database.local.database);
      const query = {};
      const projection = {
        projection: {
          _id: 0,
          ip: 1,
          continent: 1,
          continentCode: 1,
          country: 1,
          countryCode: 1,
          region: 1,
          regionName: 1,
          lat: 1,
          lon: 1,
          org: 1,
        },
      };
      list = await serviceHelper.findInDatabase(database, geocollection, query, projection);
      myCacheShort.set('allgeolocation', list);
      runninggetAllGeolocation = false;
    }
    const resMessage = serviceHelper.createDataMessage(list);
    res.json(resMessage);
  } catch (error) {
    runninggetAllGeolocation = false;
    const errMessage = serviceHelper.createErrorMessage(error.message, error.name, error.code);
    res.json(errMessage);
    log.error(error);
  }
}

let runninggetLastRound = false;
async function getLastRound(i = 0) {
  let lastRound = myCacheShort.get('lastround');
  if (!lastRound) {
    if (runninggetLastRound) {
      await serviceHelper.timeout(100);
      if (i < 300) {
        return getLastRound(i + 1);
      }
    }
    runninggetLastRound = true;
    const database = db.db(config.database.local.database);
    const q = {};
    const p = {};
    lastRound = await serviceHelper.findOneInDatabaseReverse(database, completedRoundsCollection, q, p);
    myCacheShort.set('lastround', lastRound);
    runninggetLastRound = false;
  }
  return lastRound;
}

let fluxInformationRunning = false;
async function getAllFluxInformation(req, res, i = 0) {
  try {
    const database = db.db(config.database.local.database);
    const lastRound = await getLastRound();
    const lastCompletedRound = lastRound ? lastRound.timestamp : 0;
    const query = {
      roundTime: lastCompletedRound,
    };
    // const queryForIps = []; // disable
    // currentFluxNodeIps.forEach((ip) => {
    //   const singlequery = {
    //     ip,
    //   };
    //   queryForIps.push(singlequery);
    // });
    // if (queryForIps.length > 0) {
    //   query.$or = queryForIps;
    // }
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
    const cacheKey = `fluxinfo${JSON.stringify(query)}${JSON.stringify(projection)}`;
    let results = myCacheMid.get(cacheKey);
    if (!results) {
      if (fluxInformationRunning) {
        await serviceHelper.timeout(500);
        if (i < 60) {
          getAllFluxInformation(req, res, i + 1);
        }
        throw new Error('Internal error. Try again later');
      }
      fluxInformationRunning = true;
      // return latest fluxnode round
      results = await serviceHelper.findInDatabase(database, fluxcollection, query, projection);
      myCacheMid.set(cacheKey, results);
      fluxInformationRunning = false;
    }
    const resMessage = serviceHelper.createDataMessage(results);
    res.json(resMessage);
  } catch (error) {
    fluxInformationRunning = false;
    const errMessage = serviceHelper.createErrorMessage(error.message, error.name, error.code);
    res.json(errMessage);
    log.error(error);
  }
}

let runninggetAllFluxVersions = false;
async function getAllFluxVersions(req, res, i = 0) {
  try {
    const cacheKey = 'getallfluxversions';
    let results = myCacheMid.get(cacheKey);
    if (!results) {
      if (runninggetAllFluxVersions) {
        await serviceHelper.timeout(250);
        if (i < 120) {
          getAllFluxVersions(req, res, i + 1);
        }
        throw new Error('Internal error. Try again later');
      }
      runninggetAllFluxVersions = true;
      const database = db.db(config.database.local.database);
      const lastRound = await getLastRound();
      const lastCompletedRound = lastRound ? lastRound.timestamp : 0;

      const query = {
        roundTime: lastCompletedRound,
      };
      // const queryForIps = [];
      // currentFluxNodeIps.forEach((ip) => {
      //   const singlequery = {
      //     ip,
      //   };
      //   queryForIps.push(singlequery);
      // });
      // if (queryForIps.length > 0) {
      //   query.$or = queryForIps;
      // }
      const projection = {
        projection: {
          _id: 0,
          daemon: 1,
          benchmark: 1,
          flux: 1,
        },
      };
      // return latest fluxnode round
      const response = await serviceHelper.findInDatabase(database, fluxcollection, query, projection);
      const allData = [];
      response.forEach((flux) => {
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
      results = allData;
      myCacheMid.set(cacheKey, allData);
      runninggetAllFluxVersions = false;
    }
    const resMessage = serviceHelper.createDataMessage(results);
    res.json(resMessage);
  } catch (error) {
    runninggetAllFluxVersions = false;
    const errMessage = serviceHelper.createErrorMessage(error.message, error.name, error.code);
    res.json(errMessage);
    log.error(error);
  }
}

let fluxLocationsRunning = false;
async function getAllFluxGeolocation(req, res, i = 0) {
  try {
    let results = myCache.get('geolocation');
    if (!results) {
      if (fluxLocationsRunning) {
        await serviceHelper.timeout(100);
        if (i < 300) {
          getAllFluxGeolocation(req, res, i + 1);
        }
        throw new Error('Internal error. Try again later');
      }
      fluxLocationsRunning = true;
      const database = db.db(config.database.local.database);
      const lastRound = await getLastRound();
      const lastCompletedRound = lastRound ? lastRound.timestamp : 0;
      const query = {
        roundTime: lastCompletedRound,
      };
      // const queryForIps = [];
      // currentFluxNodeIps.forEach((ip) => {
      //   const singlequery = {
      //     ip,
      //   };
      //   queryForIps.push(singlequery);
      // });
      // if (queryForIps.length > 0) {
      //   query.$or = queryForIps;
      // }
      const projection = {
        projection: {
          _id: 0,
          geolocation: 1,
        },
      };
      // return latest fluxnode round
      results = await serviceHelper.findInDatabase(database, fluxcollection, query, projection);
      results = results.filter((node) => node.geolocation);
      const bresults = results.map((x) => x.geolocation);
      myCache.set('geolocation', bresults);
      fluxLocationsRunning = false;
    }
    const resMessage = serviceHelper.createDataMessage(results);
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
      throw new Error('No IP provided');
    }
    let ipHistory = myCacheShort.get(`ipHistory${ip}`);
    if (!ipHistory) {
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
      ipHistory = await serviceHelper.findInDatabase(database, fluxcollection, query, projection);
      myCacheShort.set(`ipHistory${ip}`, ipHistory);
    }
    const resMessage = serviceHelper.createDataMessage(ipHistory);
    res.json(resMessage);
  } catch (error) {
    const errMessage = serviceHelper.createErrorMessage(error.message, error.name, error.code);
    res.json(errMessage);
    log.error(error);
  }
}

async function getCompletedRoundsTimestamps(req, res) {
  try {
    let timestamps = myCacheShort.get('getCompletedRoundsTimestamps');
    if (!timestamps) {
      const database = db.db(config.database.local.database);
      const q = {};
      const p = {};
      const completedRounds = await serviceHelper.findInDatabase(database, completedRoundsCollection, q, p);
      timestamps = completedRounds.map((x) => x.timestamp);
      myCacheShort.set('getCompletedRoundsTimestamps', timestamps);
    }
    const resMessage = serviceHelper.createDataMessage(timestamps);
    res.json(resMessage);
  } catch (error) {
    const errMessage = serviceHelper.createErrorMessage(error.message, error.name, error.code);
    res.json(errMessage);
    log.error(error);
  }
}

let runninggetAllFluxGeolocationNow = false;
async function getAllFluxGeolocationNow(req, res, i = 0) {
  try {
    let results = myCacheShort.get('getAllFluxGeolocationNow');
    if (!results) {
      if (runninggetAllFluxGeolocationNow) {
        await serviceHelper.timeout(100);
        if (i < 300) {
          getAllFluxGeolocationNow(req, res, i + 1);
        }
        throw new Error('Internal error. Try again later');
      }
      runninggetAllFluxGeolocationNow = true;
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
      let resultsA = await serviceHelper.findInDatabase(database, fluxcollection, query, projection);
      resultsA = resultsA.filter((node) => node.geolocation);
      const bresults = resultsA.map((x) => x.geolocation);
      results = [...new Set(bresults)];
      myCacheShort.set('getAllFluxGeolocationNow', results);
      runninggetAllFluxGeolocationNow = false;
    }
    const resMessage = serviceHelper.createDataMessage(results);
    res.json(resMessage);
  } catch (error) {
    runninggetAllFluxGeolocationNow = false;
    const errMessage = serviceHelper.createErrorMessage(error.message, error.name, error.code);
    res.json(errMessage);
    log.error(error);
  }
}

let fluxNodeHistoryStatsRunning = false;
async function fluxNodesHistoryStats(req, res, i = 0) {
  try {
    let historystats = myCache.get('historyStats');
    if (!historystats) {
      if (fluxNodeHistoryStatsRunning) {
        await serviceHelper.timeout(100);
        if (i < 300) {
          fluxNodesHistoryStats(req, res, i + 1);
        }
        throw new Error('Internal error. Try again later');
      }
      fluxNodeHistoryStatsRunning = true;
      await createHistoryStats();
      fluxNodeHistoryStatsRunning = false;
      historystats = myCache.get('historyStats');
    }
    const resMessage = serviceHelper.createDataMessage(historystats);
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
