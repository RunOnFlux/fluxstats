/* eslint-disable no-await-in-loop */
const axios = require('axios');
const rateLimit = require('axios-rate-limit');
const config = require('config');
const LRU = require('lru-cache');
const log = require('../lib/log');
const serviceHelper = require('./serviceHelper');

const defaultTimeout = 5000;

const explorerTimeout = 20000;

const httpFluxInfo = rateLimit(axios.create(), { maxRequests: 20, perMilliseconds: 1000 });
const httpGeo = rateLimit(axios.create(), { maxRequests: 1, perMilliseconds: 1500 });
const httpGeoBatch = rateLimit(axios.create(), { maxRequests: 1, perMilliseconds: 3950 });

// default cache
const LRUoptions = {
  max: 50, // store 50 values, we shall not have more values at any period
  ttl: 1000 * 60 * 60, // 1 hour
};
const myCache = new LRU(LRUoptions);

const LRUoptionsMid = {
  max: 20, // store 50 values, we shall not have more values at any period
  ttl: 1000 * 60 * 20, // 20 mins
};
const myCacheMid = new LRU(LRUoptionsMid);

const LRUoptionsShort = {
  max: 20, // store 50 values, we shall not have more values at any period
  ttl: 1000 * 60 * 5, // 5 mins
};

const myCacheShort = new LRU(LRUoptionsShort);

// default cache
const LRUGeoOptions = {
  max: 20000, // 20000 unique ips
  ttl: 1000 * 60 * 60 * 24 * 7, // 1 week
};
const myGeolocationCache = new LRU(LRUGeoOptions);

let db = null;
const geocollection = config.database.local.collections.geolocation;
const completedRoundsCollection = config.database.local.collections.completedRounds;

let currentFluxNodeIps = [];
let fluxNodesWithError = [];
let fluxNodesWithErrorB = [];

let firstExecution = true;
let processedFluxNodes = [];

const myCacheProcessingIp = new Map();

let runninggetFluxNodeList = false;

const dummyData = {
  daemon: {
    info: {
      version: 0,
      protocolversion: 0,
      walletversion: 0,
      blocks: 0,
      timeoffset: 0,
      connections: 0,
      proxy: '',
      difficulty: 0,
      testnet: false,
      keypoololdest: 0,
      keypoolsize: 0,
      paytxfee: 0,
      relayfee: 0,
      errors: '',
    },
  },
  node: {
    status: {
      status: '',
      collateral: '',
      txhash: '',
      outidx: '0',
      ip: '',
      network: '',
      added_height: 0,
      confirmed_height: 0,
      last_confirmed_height: 0,
      last_paid_height: 0,
      tier: '',
      payment_address: '',
      pubkey: '',
      activesince: '',
      lastpaid: '',
      amount: '',
    },
  },
  benchmark: {
    info: {
      version: '0',
      rpcport: 0,
    },
    status: {
      status: '',
      benchmarking: '',
      flux: '',
    },
    bench: {
      ipaddress: '',
      architecture: '',
      armboard: '',
      status: '0',
      time: 0,
      real_cores: 0,
      cores: 0,
      ram: 0,
      ssd: 0,
      hdd: 0,
      ddwrite: 0,
      totalstorage: 0,
      disksinfo: [
        {
          disk: 'sda',
          size: 0,
          writespeed: 0,
        },
      ],
      eps: 0,
      ping: 0,
      download_speed: 0,
      upload_speed: 0,
      bench_version: '',
      speed_version: '',
      error: '',
    },
  },
  flux: {
    version: '',
    ip: '',
    zelid: '',
    cruxid: null,
    timezone: '',
    dos: {
      dosState: 0,
      dosMessage: null,
    },
    numberOfConnectionsIn: 0,
  },
  apps: {
    fluxusage: '0',
    runningapps: [],
    resources: {
      appsCpusLocked: 0,
      appsRamLocked: 0,
      appsHddLocked: 0,
    },
  },
  geolocation: {
    ip: '',
    continent: '',
    continentCode: '',
    country: '',
    countryCode: '',
    region: '',
    regionName: '',
    lat: 0,
    lon: 0,
    org: '',
  },
  appsHashesTotal: 0,
  hashesPresent: 0,
  scannedHeight: 0,
  ip: '',
  addedHeight: 0,
  confirmedHeight: 0,
  lastConfirmedHeight: 0,
  lastPaidHeight: 0,
  tier: '',
  paymentAddress: '',
  activeSince: '',
  collateralHash: '',
  collateralIndex: 0,
  roundTime: 0,
  connectionsOut: 0,
  dataCollectedAt: 0,
};
async function getFluxNodeList(i = 0) {
  try {
    const list = myCacheShort.get('fluxnodelist');
    if (list) {
      return list;
    }
    if (runninggetFluxNodeList) {
      await serviceHelper.timeout(1000);
      if (i < 300) {
        return getFluxNodeList(i + 1);
      }
      throw new Error('Internal error. Try again later');
    }
    runninggetFluxNodeList = true;
    const fluxnodeList = await axios.get(`${config.explorer}/api/fluxnode/listfluxnodes`, { timeout: 40000 });
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
    log.info(`Getting Geolocation of IP ${ip.split(':')[0]}`);
    const source = CancelToken.source();
    let isResolved = false;
    setTimeout(() => {
      if (!isResolved) {
        source.cancel('Operation canceled by the user.');
      }
    }, defaultTimeout * 2);
    const ipApiUrl = `http://ip-api.com/json/${ip.split(':')[0]}?fields=status,continent,continentCode,country,countryCode,region,regionName,lat,lon,query,org,isp`;
    const ipRes = await httpGeo.get(ipApiUrl);
    isResolved = true;
    if (ipRes.data.status === 'success' && ipRes.data.ip !== '') {
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
        org: ipRes.data.org || ipRes.data.isp,
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
    myCacheProcessingIp.set(ip, source);
    setTimeout(() => {
      const sourceCached = myCacheProcessingIp.get(ip);
      if (sourceCached) {
        sourceCached.cancel('Operation canceled by the user.');
        myCacheProcessingIp.delete(ip);
      }
    }, timeout * 2);
    const port = ip.split(':')[1] || 16127;
    const fluxInfoUrl = `http://${ip.split(':')[0]}:${port}/flux/info`;
    const fluxRes = await httpFluxInfo.get(fluxInfoUrl, {
      cancelToken: source.token,
      timeout,
    });
    if (fluxRes.data.status === 'success') {
      myCacheProcessingIp.delete(ip);
      return fluxRes.data.data;
    }
    throw new Error(fluxRes.data.data || fluxRes.data.message);
  } catch (e) {
    myCacheProcessingIp.delete(ip);
    log.error(`Flux information of IP ${ip} error: ${e}`);
    throw new Error(e.message || e);
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

async function bootstrapFluxCollection(timestamp) {
  const database = db.db(config.database.local.database);
  const collectionName = `fluxes${timestamp}`;

  await database.collection(collectionName).createIndex({ ip: 1 }, { name: 'query for getting list of Flux data associated to IP address' });
  await database.collection(collectionName).createIndex({ ip: 1, roundTime: 1 }, { name: 'query for getting list of Flux data associated to IP address since some roundTime' });
  await database.collection(collectionName).createIndex({ addedHeight: 1 }, { name: 'query for getting list of Flux data tied to addedHeight' });
  await database.collection(collectionName).createIndex({ lastPaidHeight: 1 }, { name: 'query for getting list of Flux data tied to lastPaidHeight' });
  await database.collection(collectionName).createIndex({ tier: 1 }, { name: 'query for getting list of Flux data tied to tier' });
  await database.collection(collectionName).createIndex({ paymentAddress: 1 }, { name: 'query for getting list of Flux data tied to paymentAddress' });
  await database.collection(collectionName).createIndex({ activeSince: 1 }, { name: 'query for getting list of Flux data tied to activeSince' });
  await database.collection(collectionName).createIndex({ confirmedHeight: 1 }, { name: 'query for getting list of Flux data that were confirmed on specific height' });
  await database.collection(collectionName).createIndex({ lastConfirmedHeight: 1 }, { name: 'query for getting list of Flux data that were lastlyconfirmed on specific height' });
  await database.collection(collectionName).createIndex({ collateralHash: 1, collateralIndex: 1 }, { name: 'query for getting list of list of Flux data associated to specific collateral' });
  await database.collection(collectionName).createIndex({ roundTime: 1 }, { name: 'query for getting list of Flux data that were added in specific roundTime' });
  await database.collection(collectionName).createIndex({ appsHashesTotal: 1 }, { name: 'query for getting app hashes' });
  await database.collection(collectionName).createIndex({ hashesPresent: 1 }, { name: 'query for getting app hashes present' });
  await database.collection(collectionName).createIndex({ scannedHeight: 1 }, { name: 'query for getting scanned height' });
  await database.collection(collectionName).createIndex({ connectionsOut: 1 }, { name: 'query for getting connections out' });
  await database.collection(collectionName).createIndex({ connectionsIn: 1 }, { name: 'query for getting connections in' });
  await database.collection(collectionName).createIndex({ error: 1 }, { name: 'query for getting errored nodes' });
}

async function createHistoryStats() {
  log.info('Started createHistoryStats');
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
  const data = {};
  for (let y = 0; y < okTimestamps.length; y += 1) {
    const time = okTimestamps[y];
    log.info(`Getting historystaty for time/round ->${time}`);
    const currentCollectionName = `fluxes${time}`;
    let query = {
      tier: 'CUMULUS',
    };
    const cumulusCount = await serviceHelper.countInDatabase(database, currentCollectionName, query);
    query = {
      tier: 'NIMBUS',
    };
    const nimbusCount = await serviceHelper.countInDatabase(database, currentCollectionName, query);
    query = {
      tier: 'STRATUS',
    };
    const stratusCount = await serviceHelper.countInDatabase(database, currentCollectionName, query);
    data[time] = {};
    data[time].cumulus = cumulusCount;
    data[time].nimbus = nimbusCount;
    data[time].stratus = stratusCount;
    log.info(`Finished historystats for time/round ->${time}`);
  }
  myCache.set('historyStats', data);
  log.info('Finished createHistoryStats');
}

async function processFluxNode(fluxnode, currentRoundTime, timeout, retry = false) {
  let fluxInfo = JSON.parse(JSON.stringify(dummyData));
  try {
    const database = db.db(config.database.local.database);
    fluxInfo = await getFluxInformation(fluxnode.ip, timeout); // either correct fluxInfo or this has thrown error
    if (!fluxInfo.apps.hashes && !fluxInfo.appsHashesTotal && !fluxInfo.hashesPresent) {
      const appsHashes = await getFluxAppsHashes(fluxnode.ip, timeout * 3);
      const hashesOk = appsHashes.filter((data) => data.height >= 694000);
      fluxInfo.appsHashesTotal = hashesOk.length;
      const mesOK = hashesOk.filter((mes) => mes.message === true);
      fluxInfo.hashesPresent = mesOK.length;
    }
    if (fluxInfo.apps.hashes) {
      const hashesOk = fluxInfo.apps.hashes.filter((data) => data.height >= 694000);
      fluxInfo.appsHashesTotal = hashesOk.length;
      const mesOK = hashesOk.filter((mes) => mes.message === true);
      fluxInfo.hashesPresent = mesOK.length;
      delete fluxInfo.apps.hashes;
    }
    let scannedHeightInfo = fluxInfo.flux.explorerScannedHeigth;
    if (!scannedHeightInfo) {
      scannedHeightInfo = await getFluxSyncedHeight(fluxnode.ip, timeout);
      fluxInfo.scannedHeight = scannedHeightInfo.generalScannedHeight;
    } else {
      fluxInfo.scannedHeight = scannedHeightInfo.generalScannedHeight;
      delete fluxInfo.flux.explorerScannedHeigth;
    }
    let conOut = fluxInfo.flux.connectionsOut;
    if (conOut) {
      conOut = conOut.length;
    } else if (fluxInfo.flux.numberOfConnectionsOut) {
      conOut = fluxInfo.flux.numberOfConnectionsOut;
      delete fluxInfo.flux.numberOfConnectionsOut;
    } else {
      const connectionsOut = await getConnectionsOut(fluxnode.ip, timeout);
      conOut = connectionsOut.length;
    }
    let conIn = fluxInfo.flux.connectionsIn;
    if (conIn) {
      conIn = conIn.length;
    } else if (fluxInfo.flux.numberOfConnectionsIn) {
      conIn = fluxInfo.flux.numberOfConnectionsOut;
      delete fluxInfo.flux.numberOfConnectionsOut;
    } else {
      const connectionsIn = await getConnectionsIn(fluxnode.ip, timeout);
      conIn = connectionsIn.length;
    }
    const auxIp = fluxnode.ip.split(':')[0];

    if (!myGeolocationCache.has(auxIp)) {
      myGeolocationCache.set(auxIp, auxIp);
      if (!fluxInfo.geolocation || fluxInfo.geolocation.ip === '') {
        const geoRes = await getFluxNodeGeolocation(fluxnode.ip);
        if (geoRes) {
          fluxInfo.geolocation = geoRes;
        }
      }
      if (fluxInfo.geolocation && fluxInfo.geolocation.ip !== '') {
        const query = { ip: auxIp };
        const update = { $set: fluxInfo.geolocation };
        const options = {
          upsert: true,
        };
        // eslint-disable-next-line no-await-in-loop
        await serviceHelper.updateOneInDatabase(database, geocollection, query, update, options).catch((error) => {
          log.error(error);
        });
      }
    }
    if (!fluxInfo.geolocation || fluxInfo.geolocation.ip === '') {
      const geoRes = await getFluxNodeGeolocation(fluxnode.ip);
      if (geoRes) {
        fluxInfo.geolocation = geoRes;
      } else {
        fluxInfo.geolocation = null;
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

    if (conOut) {
      fluxInfo.connectionsOut = conOut;
    }

    if (conIn) {
      fluxInfo.connectionsIn = conIn;
    }

    const curTime = new Date().getTime();
    fluxInfo.dataCollectedAt = curTime;
    delete fluxInfo.apps.hashes;
    delete fluxInfo.flux.connectionsIn;
    delete fluxInfo.flux.connectionsOut;
    delete fluxInfo.flux.explorerScannedHeigth;
    processedFluxNodes.push(fluxInfo);
  } catch (error) {
    log.error(error);
    log.error(fluxnode.ip);
    if (!retry) {
      fluxNodesWithError.push(fluxnode);
      return;
    }
    fluxNodesWithErrorB.push(fluxnode);
    const curTime = new Date().getTime();
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
    fluxInfo.dataCollectedAt = curTime;
    fluxInfo.error = error;
    processedFluxNodes.push(fluxInfo);
  }
}

async function getGeolocationInBatchAndRefreshDatabase() {
  const startRefresh = new Date().getTime();
  try {
    log.info('getGeolocationInBatchAndRefreshDatabase started');
    const database = db.db(config.database.local.database);
    log.info('Dropping MongoDB Geolocation Collection');
    await serviceHelper.dropCollection(database, geocollection).catch((error) => {
      log.error(error);
    });
    log.info('Creating MongoDB Geolocation Collection');
    await serviceHelper.createCollection(database, geocollection).catch((error) => {
      log.error(error);
    });
    const fluxNodesGeolocations = [];
    let filterGeolocation = [];
    const { CancelToken } = axios;
    const source = CancelToken.source();
    const ipApiUrl = 'http://ip-api.com/batch';
    let isResolved = false;
    let geoExecuted = false;
    let uniqueGeolocations = [];
    const options = {
      ordered: false, // If false, continue with remaining inserts when one fails.
    };
    // eslint-disable-next-line no-restricted-syntax
    const uniqueFluxNodeIps = [...new Set(currentFluxNodeIps.map((ip) => ip.split(':')[0]))];
    for (let i = 0; i < uniqueFluxNodeIps.length; i += 1) {
      const auxIp = uniqueFluxNodeIps[i];
      geoExecuted = false;
      const ipApi = {
        query: auxIp,
        fields: 'status,continent,continentCode,country,countryCode,region,regionName,lat,lon,query,org,isp',
      };
      filterGeolocation.push(ipApi);
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
                org: geo.org || geo.isp,
              };
              fluxNodesGeolocations.push(geoInformation);
            }
          }
          geoExecuted = true;
          uniqueGeolocations = [...new Set(fluxNodesGeolocations)];
          if (uniqueGeolocations.length > 0) {
            log.info('Inserting MongoDB Geolocation FluxNodesGeolocations');
            await serviceHelper.insertManyToDatabase(database, geocollection, uniqueGeolocations, options).catch((error) => {
              log.error(`Error inserting in geocollection db: ${error}`);
            });
          }
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
            if (geo.status === 'success' && geo.ip !== '') {
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
                org: geo.org || geo.isp,
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
    uniqueGeolocations = [...new Set(fluxNodesGeolocations)];
    if (uniqueGeolocations.length > 0) {
      log.info('Inserting MongoDB Geolocation FluxNodesGeolocations');
      await serviceHelper.insertManyToDatabase(database, geocollection, uniqueGeolocations, options).catch((error) => {
        log.error(`Error inserting in geocollection db: ${error}`);
      });
    }
    uniqueGeolocations = [];
  } finally {
    log.info('getGeolocationInBatchAndRefreshDatabase finished');
    const endRefresh = new Date().getTime() - startRefresh;
    log.info(`Execution time of getGeolocationInBatchAndRefreshDatabase: ${endRefresh} ms`);
  }
}

async function processFluxNodes() {
  const startRefresh = new Date().getTime();
  try {
    fluxNodesWithErrorB = [];
    fluxNodesWithError = [];
    processedFluxNodes = [];
    let totalProcessedNodes = 0;
    const database = db.db(config.database.local.database);
    const currentRoundTime = new Date().getTime();
    const currentCollectionName = `fluxes${currentRoundTime}`;
    await bootstrapFluxCollection(currentRoundTime);
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
        if ((i + 1) % 75 === 0) {
          await Promise.allSettled(promiseArray);
          promiseArray = [];
          myCacheProcessingIp.clear();
          await serviceHelper.insertManyToDatabase(database, currentCollectionName, processedFluxNodes).catch((error) => {
            log.error(`Error inserting in ${currentCollectionName} db: ${error}`);
          });
          totalProcessedNodes += processedFluxNodes.length;
          log.info(`total processed: ${totalProcessedNodes}`);
          processedFluxNodes = [];
          const result = await serviceHelper.collectionStats(database, currentCollectionName);
          log.info(`Flux Nodes Processed: ${i + 1}; Stats: ${result.size}, ${result.count}, ${result.avgObjSize}`);
        }
      }
      if (promiseArray.length > 0) {
        await Promise.allSettled(promiseArray);
        promiseArray = [];
        myCacheProcessingIp.clear();
        await serviceHelper.insertManyToDatabase(database, currentCollectionName, processedFluxNodes).catch((error) => {
          log.error(`Error inserting in ${currentCollectionName} db: ${error}`);
        });
        totalProcessedNodes += processedFluxNodes.length;
        log.info(`total processed: ${totalProcessedNodes}`);
        const result = await serviceHelper.collectionStats(database, currentCollectionName);
        log.info(`Stats: ${result.size}, ${result.count}, ${result.avgObjSize}`);
        processedFluxNodes = [];
      }
      myCacheProcessingIp.clear();
      log.info(`Found ${fluxNodesWithError.length} FluxNodes with errors.`);
      // eslint-disable-next-line no-restricted-syntax
      for (const [i, fluxnode] of fluxNodesWithError.entries()) {
        promiseArray.push(processFluxNode(fluxnode, currentRoundTime, explorerTimeout, true));
        if ((i + 1) % 20 === 0) {
          await Promise.allSettled(promiseArray);
          promiseArray = [];
          myCacheProcessingIp.clear();
          log.info('Inserting failed nodes');
          totalProcessedNodes += processedFluxNodes.length;
          log.info(`total processed: ${totalProcessedNodes}`);
          await serviceHelper.insertManyToDatabase(database, currentCollectionName, processedFluxNodes).catch((error) => {
            log.error(`Error inserting in ${currentCollectionName} db: ${error}`);
          });
          const result = await serviceHelper.collectionStats(database, currentCollectionName);
          log.info(`Stats: ${result.size}, ${result.count}, ${result.avgObjSize}`);
          processedFluxNodes = [];
        }
      }
      if (promiseArray.length > 0) {
        await Promise.allSettled(promiseArray);
        promiseArray = [];
        myCacheProcessingIp.clear();
        totalProcessedNodes += processedFluxNodes.length;
        log.info(`total processed: ${totalProcessedNodes}`);
        await serviceHelper.insertManyToDatabase(database, currentCollectionName, processedFluxNodes).catch((error) => {
          log.error(`Error inserting in ${currentCollectionName} db: ${error}`);
        });
        const result = await serviceHelper.collectionStats(database, currentCollectionName);
        log.info(`Stats: ${result.size}, ${result.count}, ${result.avgObjSize}`);
        processedFluxNodes = [];
      }
      const result = await serviceHelper.collectionStats(database, currentCollectionName);
      log.info(`Finalized Stats: ${result.size}, ${result.count}, ${result.avgObjSize}`);
      log.info(`Processing of ${currentRoundTime} finished.`);
      log.info(`Finalized with total Nodes with errors: ${fluxNodesWithErrorB.length}`);
      const crt = {
        timestamp: currentRoundTime,
      };
      await serviceHelper.insertOneToDatabase(database, completedRoundsCollection, crt).catch((error) => {
        log.error(error);
      });
      await bootstrapFluxCollection(currentRoundTime);
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
        await serviceHelper.timeout(1000);
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

async function getFluxLocation(req, res) {
  try {
    let { ip } = req.params;
    ip = ip || req.query.ip;
    if (!ip) {
      throw new Error('Mandatory ip parameter is missing');
    }
    ip = ip.split(':')[0];
    const database = db.db(config.database.local.database);
    const query = { ip };
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
    const result = await serviceHelper.findOneInDatabase(database, geocollection, query, projection);
    const resMessage = serviceHelper.createDataMessage(result);
    res.json(resMessage);
  } catch (error) {
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
      await serviceHelper.timeout(1000);
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
    const collectionName = `fluxes${lastCompletedRound}`;
    const query = {};
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
        if (pr === 'geo') {
          projection.projection.geolocation.continent = 1;
          projection.projection.geolocation.continentCode = 1;
          projection.projection.geolocation.country = 1;
          projection.projection.geolocation.countryCode = 1;
          projection.projection.geolocation.regionName = 1;
        } else {
          projection.projection[pr] = 1;
        }
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
          error: 1,
        },
      };
    }
    const cacheKey = `fluxinfo${JSON.stringify(projection)}`;
    let results = myCacheMid.get(cacheKey);
    if (!results) {
      if (fluxInformationRunning) {
        await serviceHelper.timeout(1000);
        if (i < 300) {
          getAllFluxInformation(req, res, i + 1);
        }
        throw new Error('Internal error. Try again later');
      }
      fluxInformationRunning = true;
      // return latest fluxnode round
      results = await serviceHelper.findInDatabase(database, collectionName, query, projection);
      myCacheMid.set(cacheKey, results);
      fluxInformationRunning = false;
    } else {
      log.info('Using getAllFluxInformation cache');
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
        await serviceHelper.timeout(1000);
        if (i < 300) {
          getAllFluxVersions(req, res, i + 1);
        }
        throw new Error('Internal error. Try again later');
      }
      runninggetAllFluxVersions = true;
      const database = db.db(config.database.local.database);
      const lastRound = await getLastRound();
      const lastCompletedRound = lastRound ? lastRound.timestamp : 0;
      const collectionName = `fluxes${lastCompletedRound}`;

      const query = {};
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
      const response = await serviceHelper.findInDatabase(database, collectionName, query, projection);
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
    } else {
      log.info('Using getAllFluxVersions cache');
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
        await serviceHelper.timeout(1000);
        if (i < 300) {
          getAllFluxGeolocation(req, res, i + 1);
        }
        throw new Error('Internal error. Try again later');
      }
      fluxLocationsRunning = true;
      const database = db.db(config.database.local.database);
      const lastRound = await getLastRound();
      const lastCompletedRound = lastRound ? lastRound.timestamp : 0;
      const collectionName = `fluxes${lastCompletedRound}`;
      const query = {};
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
      results = await serviceHelper.findInDatabase(database, collectionName, query, projection);
      results = results.filter((node) => node.geolocation);
      const bresults = results.map((x) => x.geolocation);
      myCache.set('geolocation', bresults);
      fluxLocationsRunning = false;
    } else {
      log.info('Using getAllFluxGeolocation cache');
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
    let { ip } = req.params; // we accept both help/command and help?command=getinfo
    ip = ip || req.query.ip;
    if (!ip) {
      throw new Error('No IP provided');
    }
    const ipHistory = myCacheShort.get(`ipHistory${ip}`);
    if (ipHistory) {
      const resMessage = serviceHelper.createDataMessage(ipHistory);
      res.json(resMessage);
      return;
    }
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
        error: 1,
      },
    };
    const ipHistoryNew = [];
    for (let y = 0; y < bresults.length; y += 1) {
      const time = bresults[y];
      const currentCollectionName = `fluxes${time}`;
      const entry = await serviceHelper.findOneInDatabase(database, currentCollectionName, query, projection);
      if (entry) {
        ipHistoryNew.push(entry);
      }
    }
    myCacheShort.set(`ipHistory${ip}`, ipHistoryNew);
    const resMessage = serviceHelper.createDataMessage(ipHistoryNew);
    res.json(resMessage);
  } catch (error) {
    const errMessage = serviceHelper.createErrorMessage(error.message, error.name, error.code);
    res.json(errMessage);
    log.error(error);
  }
}

let getCompletedRoundsTimestampsRunning = false;
async function getCompletedRoundsTimestamps(req, res, i = 0) {
  try {
    let timestamps = myCacheShort.get('getCompletedRoundsTimestamps');
    if (!timestamps) {
      if (getCompletedRoundsTimestampsRunning) {
        await serviceHelper.timeout(1000);
        if (i < 300) {
          getCompletedRoundsTimestamps(req, res, i + 1);
        }
        throw new Error('Internal error. Try again later');
      }
      getCompletedRoundsTimestampsRunning = true;
      const database = db.db(config.database.local.database);
      const q = {};
      const p = {};
      const completedRounds = await serviceHelper.findInDatabase(database, completedRoundsCollection, q, p);
      timestamps = completedRounds.map((x) => x.timestamp);
      myCacheShort.set('getCompletedRoundsTimestamps', timestamps);
      getCompletedRoundsTimestampsRunning = false;
    } else {
      log.info('Using getCompletedRoundsTimestamps cache');
    }
    const resMessage = serviceHelper.createDataMessage(timestamps);
    res.json(resMessage);
  } catch (error) {
    getCompletedRoundsTimestampsRunning = false;
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
        await serviceHelper.timeout(1000);
        if (i < 300) {
          fluxNodesHistoryStats(req, res, i + 1);
        }
        throw new Error('Internal error. Try again later');
      }
      fluxNodeHistoryStatsRunning = true;
      await createHistoryStats();
      historystats = myCache.get('historyStats');
      fluxNodeHistoryStatsRunning = false;
    } else {
      log.info('Using fluxNodesHistoryStats cache');
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

async function getMultiplier(req, res) {
  try {
    const multiplier = 8;
    const resMessage = serviceHelper.createDataMessage(multiplier);
    res.json(resMessage);
  } catch (error) {
    const errMessage = serviceHelper.createErrorMessage(error.message, error.name, error.code);
    res.json(errMessage);
    log.error(error);
  }
}

async function getAppSpecsUSDPrice(req, res) {
  try {
    const appsSpecsUSDPrices = await axios.get('https://raw.githubusercontent.com/RunOnFlux/fluxstats/master/config/appSpecsUSDPrices.json');
    const resMessage = serviceHelper.createDataMessage(appsSpecsUSDPrices.data);
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
  getFluxLocation,
  getAllFluxInformation,
  getFluxIPHistory,
  getAllFluxGeolocation,
  getAllFluxVersions,
  getCompletedRoundsTimestamps,
  fluxNodesHistoryStats,
  getFluxAppsHashes,
  getFluxSyncedHeight,
  getConnectionsOut,
  getConnectionsIn,
  getCollateralInfo,
  bootstrapFluxCollection,
  getFluxNodeList,
  getFluxNodeGeolocation,
  getFluxInformation,
  createHistoryStats,
  processFluxNode,
  getGeolocationInBatchAndRefreshDatabase,
  processFluxNodes,
  getLastRound,
  getMultiplier,
  getAppSpecsUSDPrice,
};
