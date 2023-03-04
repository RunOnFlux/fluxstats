/* eslint-disable no-loop-func */
/* eslint-disable no-await-in-loop */
const axios = require('axios');
const rateLimit = require('axios-rate-limit');
const log = require('../lib/log');
const serviceHelper = require('./serviceHelper');

const http = rateLimit(axios.create(), { maxRequests: 20, perMilliseconds: 1000 });

const defaultTimeout = 5000;

const explorerTimeout = 20000;

let processedThundernodes = [];
let fluxNodesWithError = [];
let processedFluxNodes = [];

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

async function processThunder(time, node, timeout, retry = false) {
  try {
    const adjustedNode = {};
    adjustedNode.tier = node.tier;
    adjustedNode.ip = node.ip;
    adjustedNode.payment_address = node.payment_address;
    const { CancelToken } = axios;
    const source = CancelToken.source();
    let isResolved = false;
    setTimeout(() => {
      if (!isResolved) {
        source.cancel('Operation canceled by the user.');
      }
    }, timeout * 2);
    const port = adjustedNode.ip.split(':')[1] || 16127;
    const fluxnodeList = await http.get(`http://${adjustedNode.ip.split(':')[0]}:${port}/benchmark/getbenchmarks`, {
      cancelToken: source.token,
      timeout,
    });
    isResolved = true;
    if (fluxnodeList.data.status === 'success' && fluxnodeList.data.data.thunder) {
      adjustedNode.time = time;
      processedThundernodes.push(adjustedNode);
      log.info(`Found Thunder Node on ip ${node.ip}`);
    }
    processedFluxNodes.push(node);
  } catch (error) {
    log.error(error);
    log.error(node.ip);
    if (!retry) {
      fluxNodesWithError.push(node);
    }
  }
}

async function processThunderNodes() {
  const startRefresh = new Date().getTime();
  try {
    log.info(`Beginning processing processThunderNodes of ${startRefresh}.`);
    fluxNodesWithError = [];
    processedFluxNodes = [];
    processedThundernodes = [];
    let nodes = await getNodes();
    if (nodes && nodes.length > 0) {
      nodes = nodes.filter((node) => node.last_paid_height && node.tier === 'CUMULUS'); // only CUMULUS nodes that are longer on the network
      const l = nodes.length;
      let totalProcessedNodes = 0;
      log.info(`Found ${l} FluxNode Cumulus.`);
      let promiseArray = [];
      // eslint-disable-next-line no-restricted-syntax
      for (const [i, node] of nodes.entries()) {
        promiseArray.push(processThunder(startRefresh, node, defaultTimeout));
        if ((i + 1) % 75 === 0) {
          await Promise.allSettled(promiseArray);
          promiseArray = [];
          totalProcessedNodes += processedFluxNodes.length;
          log.info(`processThunderNodes total processed: ${totalProcessedNodes}`);
          processedFluxNodes = [];
          log.info(`Thunder Nodes Already Found: ${processedThundernodes.length}`);
        }
      }
      if (promiseArray.length > 0) {
        await Promise.allSettled(promiseArray);
        promiseArray = [];
        totalProcessedNodes += processedFluxNodes.length;
        processedFluxNodes = [];
        log.info(`Thunder Nodes Already Found: ${processedThundernodes.length}`);
      }
      log.info(`Found ${fluxNodesWithError.length} FluxNodes with errors.`);
      // eslint-disable-next-line no-restricted-syntax
      for (const [i, node] of fluxNodesWithError.entries()) {
        promiseArray.push(processThunder(startRefresh, node, explorerTimeout, true));
        if ((i + 1) % 20 === 0) {
          await Promise.allSettled(promiseArray);
          promiseArray = [];
          totalProcessedNodes += processedFluxNodes.length;
          log.info(`processThunderNodes total processed: ${totalProcessedNodes}`);
          processedFluxNodes = [];
        }
      }
      if (promiseArray.length > 0) {
        await Promise.allSettled(promiseArray);
        promiseArray = [];
        totalProcessedNodes += processedFluxNodes.length;
        log.info(`processThunderNodes total processed: ${totalProcessedNodes}`);
        processedFluxNodes = [];
      }
      log.info(`Total Thunder Found: ${processedThundernodes.length}`);
      fluxNodesWithError = [];
    } else {
      log.error('No flux Nodes Found');
    }
  } catch (e) {
    log.error(e);
  } finally {
    const endRefresh = new Date().getTime() - startRefresh;
    log.info(`Execution time of processThunder: ${endRefresh} ms`);
    setTimeout(() => {
      processThunder();
    }, 8 * 60 * 60 * 1000);
    // Executions in 8h interval
  }
}

async function getThunderNodes(req, res) {
  try {
    const results = processedThundernodes;
    if (!results.length) {
      throw new Error('No data found');
    }
    const yesterday = new Date().getTime() - 86400000;
    if (results[0].time < yesterday) {
      processedThundernodes = [];
      processThunderNodes();
      throw new Error('Information with more than one day, beginning new processing');
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
  processThunder,
  processThunderNodes,
  getThunderNodes,
  getNodes,
};
