/* eslint-disable no-loop-func */
/* eslint-disable no-await-in-loop */
const axios = require('axios');
const rateLimit = require('axios-rate-limit');
const log = require('../lib/log');
const serviceHelper = require('./serviceHelper');

const http = rateLimit(axios.create(), { maxRequests: 20, perMilliseconds: 1000 });

const timeout = 5000;

let processedKDAnodes = [];

let processingStatus = 0;

async function kadenaAppLocationsNode() { // chainwebnode only
  const apps = ['nonExistingApp'];
  let locations = [];
  try {
    // eslint-disable-next-line no-restricted-syntax
    for (const app of apps) {
      const res = await http.get(`https://api.runonflux.io/apps/location/${app}`);
      if (res.data.status === 'success') {
        locations = locations.concat(res.data.data);
      } else {
        throw new Error(res.data.data);
      }
    }
    return locations;
  } catch (e) {
    log.error(e);
    return locations;
  }
}

async function kadenaAppLocations() { // chainwebdata
  const apps = ['Kadena', 'Kadena2', 'Kadena3', 'Kadena4', 'Kadena5'];
  let locations = [];
  try {
    // eslint-disable-next-line no-restricted-syntax
    for (const app of apps) {
      const res = await http.get(`https://api.runonflux.io/apps/location/${app}`);
      if (res.data.status === 'success') {
        locations = locations.concat(res.data.data);
      } else {
        throw new Error(res.data.data);
      }
    }
    return locations;
  } catch (e) {
    log.error(e);
    return locations;
  }
}

async function getNodes() {
  try {
    const res = await http.get('https://api.runonflux.io/daemon/viewdeterministiczelnodelist');
    if (res.data.status === 'success') {
      return res.data.data;
    }
    throw new Error(res.data.data);
  } catch (e) {
    log.error(e);
    return [];
  }
}

async function processKDA() {
  const startRefresh = new Date().getTime();
  try {
    log.info(`Beginning processing processKDA of ${startRefresh}.`);
    let nodes = await getNodes();
    const kdaRunningNodes = await kadenaAppLocations();
    const kdaRunningNodesChainweb = await kadenaAppLocationsNode();
    nodes = nodes.filter((node) => node.tier !== 'CUMULUS' && node.last_paid_height); // only nodes that are longer on the network
    const nodesWithKDAset = [];
    const time = new Date().getTime();
    let i = 0;
    const l = nodes.length;
    log.info(`Found ${l} FluxNode Kadena eligible.`);
    // eslint-disable-next-line no-restricted-syntax
    for (const node of nodes) {
      i += 1;
      try {
        const adjustedNode = {};
        adjustedNode.tier = node.tier;
        adjustedNode.ip = node.ip;
        const { CancelToken } = axios;
        const source = CancelToken.source();
        let isResolved = false;
        setTimeout(() => {
          if (!isResolved) {
            source.cancel('Operation canceled by the user.');
          }
        }, timeout * 2);
        const port = adjustedNode.ip.split(':')[1] || 16127;
        const fluxnodeList = await http.get(`http://${adjustedNode.ip.split(':')[0]}:${port}/flux/kadena`, {
          cancelToken: source.token,
          timeout,
        });
        isResolved = true;
        if (fluxnodeList.data.status === 'success' && fluxnodeList.data.data) {
          adjustedNode.kadena = fluxnodeList.data.data;
          adjustedNode.time = time;
          nodesWithKDAset.push(adjustedNode);
        }
        processingStatus = `${i} of ${l}`;
        if ((i + 1) % 75 === 0) {
          log.info(`Flux Kadena Nodes Processed: ${i + 1}`);
        }
      } catch (error) {
        log.error(`Error Getting Kadena info from IP ${node.ip}`);
      }
    }
    // if node runs kda app
    // eslint-disable-next-line no-restricted-syntax
    for (const kdaNode of kdaRunningNodes) {
      const nodeExists = nodesWithKDAset.find((node) => node.ip === kdaNode.ip);
      if (nodeExists) {
        const chainwebDataNode = JSON.parse(JSON.stringify(nodeExists));
        chainwebDataNode.tier = 'chainwebdata';
        nodesWithKDAset.push(chainwebDataNode);
      }
    }
    // eslint-disable-next-line no-restricted-syntax
    for (const kdaNode of kdaRunningNodesChainweb) {
      const nodeExists = nodesWithKDAset.find((node) => node.ip === kdaNode.ip);
      if (nodeExists) {
        const chainwebDataNode = JSON.parse(JSON.stringify(nodeExists));
        chainwebDataNode.tier = 'chainwebnode';
        nodesWithKDAset.push(chainwebDataNode);
      }
    }
    processedKDAnodes = nodesWithKDAset;
  } catch (e) {
    log.error(e);
  } finally {
    const endRefresh = new Date().getTime() - startRefresh;
    log.info(`Execution time of processKDA: ${endRefresh} ms`);
    setTimeout(() => {
      processKDA();
    }, 2 * 60 * 60 * 1000);
    // Executions in 2h interval
  }
}

async function getKadenaNodes(req, res) {
  try {
    const results = processedKDAnodes;
    if (!results.length) {
      throw new Error(`Processing status ${processingStatus}`);
    }
    const yesterday = new Date().getTime() - 86400000;
    if (results[0].time < yesterday) {
      processedKDAnodes = [];
      processKDA();
      throw new Error(`Beginning new processing. Processing status ${processingStatus}`);
    }
    const resMessage = serviceHelper.createDataMessage(results);
    res.json(resMessage);
  } catch (error) {
    const errMessage = serviceHelper.createErrorMessage(error.message, error.name, error.code);
    res.json(errMessage);
    log.error(error);
  }
}

module.exports = {
  processKDA,
  getKadenaNodes,
  getNodes,
  kadenaAppLocations,
  kadenaAppLocationsNode,
};
