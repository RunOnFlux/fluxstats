const axios = require('axios');
const log = require('../lib/log');
const serviceHelper = require('./serviceHelper');

async function listApps(req, res) {
  try {
    const appsList = await axios.get('https://raw.githubusercontent.com/RunOnFlux/fluxapi/master/config/marketplaceApps.json');
    res.json({status: 'success', data: appsList.data});
  } catch (error) {
    const errMessage = serviceHelper.createErrorMessage(error.message, error.name, error.code);
    res.json(errMessage);
    log.error(error);
  }
}

module.exports = {
  listApps,
};