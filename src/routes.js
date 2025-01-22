const apicache = require('apicache');
const path = require('path');
const fluxService = require('./services/fluxService');
const kadenaService = require('./services/kadenaService');
const proposalService = require('./services/proposalService');
const generalService = require('./services/generalService');
const marketplaceService = require('./services/marketplaceService');
const thunderService = require('./services/thunderService');
const permanentMessages = require('./services/permanentMessagesService');
const fluxOsService = require('./services/fluxOsService');
const richListService = require('./services/richListService');

const cache = apicache.middleware;

module.exports = (app) => {
  // GET methods
  app.get('/storedlocations', cache('5 minutes'), (req, res) => {
    fluxService.getAllGeolocation(req, res);
  });
  app.get('/fluxlocation/:ip', cache('5 minutes'), (req, res) => {
    fluxService.getFluxLocation(req, res);
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
  app.get('/fluxmessages/all', cache('15 minutes'), (req, res) => {
    permanentMessages.apiAllMessages(req, res);
  });
  app.get('/fluxmessages/missing', cache('15 minutes'), (req, res) => {
    permanentMessages.apiMissingMessages(req, res);
  });
  app.get('/fluxmessages/stats', cache('15 minutes'), (req, res) => {
    permanentMessages.apiStatsMessages(req, res);
  });
  app.get('/fluxmessages/get/:hash?/:txid?', cache('1 minute'), (req, res) => {
    permanentMessages.apiGetMessage(req, res);
  });

  app.get('/kadena/nodes', cache('1 minute'), (req, res) => {
    kadenaService.getKadenaNodes(req, res);
  });

  app.get('/apps/multiplier', cache('1 minute'), (req, res) => {
    fluxService.getMultiplier(req, res);
  });

  app.get('/apps/getappspecsusdprice', cache('10 minutes'), (req, res) => {
    fluxService.getAppSpecsUSDPrice(req, res);
  });

  app.get('/getmodulesminimumversions', cache('10 minutes'), (req, res) => {
    fluxService.getModulesMinVersions(req, res);
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
  app.get('/proposals/votepower/:zelid?/:hash?', cache('2 minutes'), (req, res) => { // object of power as numbeer and array of nodeInfo object { tier, ip, txhash, outidx, address, power, zelid, };
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

  app.get('/marketplace/listdevapps', cache('1 minute'), (req, res) => {
    marketplaceService.listDevApps(req, res);
  });

  app.get('/thunder/nodes', cache('1 minute'), (req, res) => {
    thunderService.getThunderNodes(req, res);
  });
  app.get('/fractus/nodes', cache('1 minute'), (req, res) => {
    thunderService.getThunderNodes(req, res);
  });
  app.get('/fluxos/hashes', cache('5 minutes'), (req, res) => {
    fluxOsService.listOsImageHashes(req, res);
  });
  app.get('/fluxos/revenue', cache('5 minutes'), (req, res) => {
    fluxOsService.getFluxOSRevenue(req, res);
  });

  app.get('/api/v1/richlist', cache('1 minute'), (req, res) => {
    richListService.apiRichList(req, res);
  });
};
