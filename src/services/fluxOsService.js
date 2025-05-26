const axios = require('axios');
const log = require('../lib/log');
const serviceHelper = require('./serviceHelper');

async function listOsImageHashes(req, res) {
  try {
    const hashesList = await axios.get('https://raw.githubusercontent.com/RunOnFlux/fluxapi/master/config/fluxOsImageHashes.json');
    res.json({ status: 'success', data: hashesList.data });
  } catch (error) {
    // temp patch until next ArcaneOS release (today is 02/05/25)
    // const errMessage = serviceHelper.createErrorMessage(error.message, error.name, error.code);
    // res.json(errMessage);
    res.status(503).end();
    log.error(error);
  }
}

module.exports = {
  listOsImageHashes,
};
