const apicache = require('apicache');
const path = require('path');
const fluxService = require('./services/fluxService');
const kadenaService = require('./services/kadenaService');
const proposalService = require('./services/proposalService');
const generalService = require('./services/generalService');
const marketplaceService = require('./services/marketplaceService');

const cache = apicache.middleware;

module.exports = (app) => {
  // GET methods
  app.get('/storedlocations', cache('5 minutes'), (req, res) => {
    fluxService.getAllGeolocation(req, res);
  });
  // strings of projection wanted
  app.get('/fluxinfo/:projection?', cache('10 minutes'), (req, res) => {
    fluxService.getAllFluxInformation(req, res);
  });
  app.get('/fluxhistory/ip/:ip?', cache('5 minutes'), (req, res) => {
    fluxService.getFluxIPHistory(req, res);
  });
  app.get('/fluxversions', cache('5 minutes'), (req, res) => {
    fluxService.getAllFluxVersions(req, res);
  });
  app.get('/fluxlocations', cache('20 minutes'), (req, res) => {
    fluxService.getAllFluxGeolocation(req, res);
  });
  app.get('/availabletimes', cache('5 minutes'), (req, res) => {
    fluxService.getCompletedRoundsTimestamps(req, res);
  });
  app.get('/fluxlocationsnow', cache('5 minutes'), (req, res) => {
    fluxService.getAllFluxGeolocation(req, res);
  });
  // get last month of history stats
  app.get('/fluxhistorystats', cache('15 minutes'), (req, res) => {
    fluxService.fluxNodesHistoryStats(req, res);
  });

  app.get('/kadena/nodes', cache('1 minute'), (req, res) => {
    kadenaService.getKadenaNodes(req, res);
  });

  app.get('/hashes', cache('1 minute'), (req, res) => {
    res.sendFile(path.join(__dirname, './fluxHashes'));
  });

  app.get('/general/messagephrase', (req, res) => { // get message phrase for vote signing
    generalService.getMessagePhrase(req, res);
  });
  app.get('/general/allactivemessagephrase', (req, res) => {
    generalService.activeMessagePhrases(req, res);
  });

  app.get('/proposals/listproposals', cache('1 minute'), (req, res) => {
    proposalService.listProposals(req, res);
  });
  app.get('/proposals/price', cache('1 minute'), (req, res) => {
    proposalService.getPrice(req, res);
  });
  app.get('/proposals/proposaldetail/:hash?', cache('1 minute'), (req, res) => {
    proposalService.proposalDetail(req, res);
  });
  app.get('/proposals/voteinformation/:hash?/:zelid?', cache('1 minute'), (req, res) => { // if data array is empty, user did not vote
    proposalService.voteInformation(req, res);
  });
  app.get('/proposals/votepower/:zelid?/:hash?', cache('2 minute'), (req, res) => { // object of power as numbeer and array of nodeInfo object { tier, ip, txhash, outidx, address, power, zelid, };
    proposalService.getVotePower(req, res);
  });
  app.post('/proposals/submitproposal', (req, res) => {
    proposalService.submitProposal(req, res);
  });
  app.post('/proposals/voteproposal', (req, res) => {
    proposalService.voteProposal(req, res);
  });

  app.get('/marketplace/listapps', cache('1 minute'), (req, res) => {
    marketplaceService.listApps(req, res);
  });
};
