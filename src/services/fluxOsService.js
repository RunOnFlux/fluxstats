const axios = require('axios');
const log = require('../lib/log');
const serviceHelper = require('./serviceHelper');

async function listOsImageHashes(req, res) {
  try {
    const hashesList = await axios.get('https://raw.githubusercontent.com/RunOnFlux/fluxapi/master/config/fluxOsImageHashes.json');
    res.json({ status: 'success', data: hashesList.data });
  } catch (error) {
    const errMessage = serviceHelper.createErrorMessage(error.message, error.name, error.code);
    res.json(errMessage);
    log.error(error);
  }
}

async function getFluxOSRevenue(req, res) {
  try {
    const hashesList = await axios.get('http://localhost:3333/v1/fluxos/all');
    res.json({ status: 'success', data: hashesList.data });
  } catch (error) {
    const errMessage = serviceHelper.createErrorMessage(error.message, error.name, error.code);
    res.json(errMessage);
    log.error(error);
  }
}

module.exports = {
  listOsImageHashes,
  getFluxOSRevenue,
};
