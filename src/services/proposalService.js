/* eslint-disable no-await-in-loop */
const axios = require('axios');
const config = require('config');
const log = require('../lib/log');
const serviceHelper = require('./serviceHelper');
const generalService = require('./generalService');

const satoshisRequired = 10000000000; // 100 flux
const proposalAddress = 't1Mzja9iJcEYeW5B4m4s1tJG8M42odFZ16A'; // flux team proposal wallet
const expirationPeriod = 3600000; // 60 mins, after that unpaid proposals are expired => Rejected Unpaid
const voteEndPeriod = 604800000; // 1 week
const miVotesCoefficient = 0.3; // 30 percent of network potential. 10 votes for cumulus, 25 nimbus, 100 stratus

let userVoting = false;

const axiosConfig = {
  timeout: 13456,
};

let db = null;
const databaseLink = config.database.proposals.database;
const proposalsCollection = config.database.proposals.collections.proposals;
const votingCollection = config.database.proposals.collections.voting;

function getLastProposalTxs(transactions) {
  const myAddress = proposalAddress;
  const lightTransactions = [];
  let numberoftxs = transactions.length;
  while (numberoftxs > 0) {
    numberoftxs -= 1;
    const feeSat = transactions[numberoftxs].fees * 1e8;
    let numberofvins = transactions[numberoftxs].vin.length;
    let numberofvouts = transactions[numberoftxs].vout.length;

    let amountSentInItx = 0;
    let amountReceivedInItx = 0;
    while (numberofvins > 0) {
      numberofvins -= 1;
      // here comes search script for self.coins[self.activecoin].address if addr found get this j vin. Take amount, timestamp
      const jsonvin = transactions[numberoftxs].vin[numberofvins]; // the j vin in i transaction
      if (jsonvin.addr !== null && jsonvin.addr !== undefined) {
        if (jsonvin.addr === myAddress) {
          // console.log('this j vin of i transaction has my address. My address was sending coins')
          // console.log('amount sent: ' + jsonvin.value)
          amountSentInItx += +jsonvin.value * 1e8; // satoshis as it was buggy when substracting numbers
        }
        // console.log('vins')
        // console.log(jsonvin)
      }
    }

    // find in outputs for every transaction
    let isMessage = '';
    while (numberofvouts > 0) {
      numberofvouts -= 1;
      // here comes search script for self.coins[self.activecoin].addresses[activeWallet].address if addr found get this j vin. Take amount, timestamp
      // store the good vouts
      const jsonvout = transactions[numberoftxs].vout[numberofvouts]; // the k vout in i transaction
      // console.log(jsonvout);
      // console.log(jsonvout.scriptPubKey.addresses);
      if (jsonvout.scriptPubKey.addresses !== null && jsonvout.scriptPubKey.addresses !== undefined) {
        // console.log(jsonvout.scriptPubKey.addresses);
        if (jsonvout.scriptPubKey.addresses[0] === myAddress) {
          // console.log('this k vout of i transaction has my address. My address was receiving')
          // console.log('amount received: ' + jsonvout.value)
          amountReceivedInItx += +jsonvout.value * 1e8;
        }
      }
      if (jsonvout.scriptPubKey.asm) {
        const possiblemessage = jsonvout.scriptPubKey.asm;
        // console.log(possiblemessage)
        const parts = possiblemessage.split('OP_RETURN ', 2);
        if (parts[1]) {
          const encodedMessage = parts[1];
          const hexx = encodedMessage.toString(); // force conversion
          // console.log(hexx)
          let strx = '';
          for (let k = 0; k < hexx.length && hexx.substr(k, 2) !== '00'; k += 2) {
            strx += String.fromCharCode(parseInt(hexx.substr(k, 2), 16));
          }
          if (strx !== '') {
            isMessage = strx;
          }
          // console.log(strx)
        }
      }
      // console.log('vouts')
      // console.log(jsonvout)
    }
    let substract = +amountReceivedInItx - +amountSentInItx;
    if (substract < 0) {
      substract += feeSat;
    }
    const amountInThisITx = Math.round(substract);
    const txidInThisITx = transactions[numberoftxs].txid; // clicking on tx open explorer

    const messageInThisITx = isMessage;
    if (amountInThisITx === satoshisRequired && messageInThisITx.length > 20) {
      lightTransactions.push({
        txid: txidInThisITx, // txid
        message: messageInThisITx, // our proposal hash
      });
    }
    // console.log(lightTransactions)
  }
  return lightTransactions;
}

async function checkForMissingTransactions() {
  try {
    // get proposals that are unpaid and check if tx with that hash exists
    // 100000000 satoshit (1 flux, todo 10000000000 satoshis for 100 flux), our address
    // we do not assume that unpaid proposal is further than last 50 transactions. Proposal is marked as Rejected Unpaid after 60 mins of not being paid
    const transactionsUrl = `https://explorer.runonflux.io/api/addrs/${proposalAddress}/txs?from=0&to=50`; // todo resolve attacks on address later
    const response = await axios.get(transactionsUrl, axiosConfig);
    const lightTransactions = response.data.items;
    if (typeof lightTransactions !== 'object') throw new Error('Transactions are not an object');
    const proposalTxs = getLastProposalTxs(lightTransactions);
    // get our proposals with status 'unpaid'
    const database = db.db(databaseLink);
    const query = {
      status: 'Unpaid',
    };
    const projection = {
      projection: {
        _id: 0, // all except id
      },
    };
    const results = await serviceHelper.findInDatabase(database, proposalsCollection, query, projection);
    // eslint-disable-next-line no-restricted-syntax
    for (const proposal of results) {
      const isPaid = proposalTxs.find((tx) => tx.message === proposal.hash);
      if (isPaid) {
        // update our database that it is now Open
        const queryUpdate = { hash: proposal.hash };
        const update = { $set: { status: 'Open', txid: isPaid.txid } };
        const options = {};
        await serviceHelper.updateOneInDatabase(database, proposalsCollection, queryUpdate, update, options);
      } else {
        // check if its Rejected Unapid
        const maxTime = new Date().getTime() - expirationPeriod;
        if (maxTime > proposal.submitDate) {
          // mark it as Rejected Unpaid
          const queryUpdate = { hash: proposal.hash };
          const update = { $set: { status: 'Rejected Unpaid' } };
          const options = {};
          await serviceHelper.updateOneInDatabase(database, proposalsCollection, queryUpdate, update, options);
        }
      }
    }
    setTimeout(() => {
      checkForMissingTransactions();
    }, 30 * 1000);
  } catch (error) {
    // restart service after 30 secs
    log.error(error);
    setTimeout(() => {
      checkForMissingTransactions();
    }, 30 * 1000);
  }
}

async function checkOpenProposals() {
  try {
    const database = db.db(databaseLink);
    const query = {
      status: 'Open',
    };
    const projection = {
      projection: {
        _id: 0, // all except id
      },
    };
    // return latest fluxnode round
    const results = await serviceHelper.findInDatabase(database, proposalsCollection, query, projection);
    // for every Open proposal, checkif they shall get rejected, rejected with not enough votes or passed
    // eslint-disable-next-line no-restricted-syntax
    for (const proposal of results) {
      const currentTime = new Date().getTime();

      // voting has ended, update status
      const minVotesRequire = proposal.votesRequired;
      const queryVoting = {
        hash: proposal.hash,
      };
      const votingResults = await serviceHelper.findInDatabase(database, votingCollection, queryVoting, projection);
      // sum up the votes
      let votes = 0;
      let approvalVotes = 0;
      let rejectionVotes = 0;
      votingResults.forEach((vote) => {
        votes += vote.numberOfVotes;
        if (vote.vote === true) {
          approvalVotes += vote.numberOfVotes;
        } else {
          rejectionVotes += vote.numberOfVotes;
        }
      });
      if (currentTime > proposal.voteEndDate) { // change status
        if (votes < minVotesRequire) {
          const queryUpdate = { hash: proposal.hash };
          const update = {
            $set: {
              status: 'Rejected Not Enough Votes', votesTotal: votes, votesYes: approvalVotes, votesNo: rejectionVotes,
            },
          };
          const options = {};
          await serviceHelper.updateOneInDatabase(database, proposalsCollection, queryUpdate, update, options);
        } else if (approvalVotes > rejectionVotes) {
          const queryUpdate = { hash: proposal.hash };
          const update = {
            $set: {
              status: 'Passed', votesTotal: votes, votesYes: approvalVotes, votesNo: rejectionVotes,
            },
          };
          const options = {};
          await serviceHelper.updateOneInDatabase(database, proposalsCollection, queryUpdate, update, options);
        } else { // less or equal to approval votes
          const queryUpdate = { hash: proposal.hash };
          const update = {
            $set: {
              status: 'Rejected', votesTotal: votes, votesYes: approvalVotes, votesNo: rejectionVotes,
            },
          };
          const options = {};
          await serviceHelper.updateOneInDatabase(database, proposalsCollection, queryUpdate, update, options);
        }
      } else { // update just vote numbers
        const queryUpdate = { hash: proposal.hash };
        const update = {
          $set: {
            votesTotal: votes, votesYes: approvalVotes, votesNo: rejectionVotes,
          },
        };
        const options = {};
        await serviceHelper.updateOneInDatabase(database, proposalsCollection, queryUpdate, update, options);
      }
    }
    setTimeout(() => {
      checkOpenProposals();
    }, 240 * 1000);
  } catch (error) {
    // restart service after 4 mins
    log.error(error);
    setTimeout(() => {
      checkOpenProposals();
    }, 240 * 1000);
  }
}

async function listProposals(req, res) {
  try {
    const database = db.db(databaseLink);
    const query = {};
    const projection = {
      projection: {
        _id: 0, // all except id
      },
    };
    const results = await serviceHelper.findInDatabase(database, proposalsCollection, query, projection);
    const resMessage = serviceHelper.createDataMessage(results);
    res.json(resMessage);
  } catch (error) {
    const errMessage = serviceHelper.createErrorMessage(error.message, error.name, error.code);
    res.json(errMessage);
    log.error(error);
  }
}

async function proposalDetail(req, res) {
  try {
    // get information of specific proposal
    let { hash } = req.params;
    hash = hash || req.query.hash;
    if (!hash) {
      const errMessage = serviceHelper.createErrorMessage('No Hash of proposal provided');
      res.json(errMessage);
      return;
    }
    const database = db.db(databaseLink);
    let query = {
      hash,
    };
    const projection = {
      projection: {
        _id: 0, // all except id
      },
    };
    let result = await serviceHelper.findOneInDatabase(database, proposalsCollection, query, projection);
    if (!result) {
      query = {
        txid: hash,
      };
      // check if txid was meant by user instead of proposal hash
      result = await serviceHelper.findOneInDatabase(database, proposalsCollection, query, projection);
    }
    const resMessage = serviceHelper.createDataMessage(result);
    res.json(resMessage);
  } catch (error) {
    const errMessage = serviceHelper.createErrorMessage(error.message, error.name, error.code);
    res.json(errMessage);
    log.error(error);
  }
}

async function voteInformation(req, res) {
  try {
    // get information of specific proposal
    let { hash } = req.params;
    hash = hash || req.query.hash;
    let { zelid } = req.params;
    zelid = zelid || req.query.zelid;
    if (!hash && !zelid) {
      const errMessage = serviceHelper.createErrorMessage('No hash nor zelid provided');
      res.json(errMessage);
      return;
    }
    let query = {};
    const projection = {
      projection: {
        _id: 0, // all except id
      },
    };
    if (hash && zelid) {
      // check specific proposal belonging to zelid
      query = {
        hash,
        zelid,
      };
    } else if (hash) {
      // get all supplied votes for proposal
      query = {
        hash,
      };
    } else if (zelid) {
      // get all votes for zelid
      query = {
        zelid,
      };
    }
    const database = db.db(databaseLink);
    const results = await serviceHelper.findInDatabase(database, votingCollection, query, projection);
    const resMessage = serviceHelper.createDataMessage(results);
    res.json(resMessage);
  } catch (error) {
    const errMessage = serviceHelper.createErrorMessage(error.message, error.name, error.code);
    res.json(errMessage);
    log.error(error);
  }
}

// allow throw;
async function votePower(zelid, hash) {
  const zelidValid = generalService.verifyZelID(zelid);
  if (zelidValid !== true) {
    throw new Error('Invalid zelid');
  }
  const database = db.db(config.database.local.database);
  // if hash is present, find proposal
  let q = {};
  if (hash) {
    const query = {
      hash,
    };
    const projection = {
      projection: {
        _id: 0, // all except id
      },
    };
    const databaseProposals = db.db(databaseLink);
    const result = await serviceHelper.findOneInDatabase(databaseProposals, proposalsCollection, query, projection);
    if (!result) {
      throw new Error('Proposal not found');
    }
    q = {
      timestamp: { $lt: result.submitDate },
    };
  }

  const p = {};
  const fluxcollection = config.database.local.collections.fluxes;
  const completedRoundsCollection = config.database.local.collections.completedRounds;
  const lastRound = await serviceHelper.findOneInDatabaseReverse(database, completedRoundsCollection, q, p);
  const lastCompletedRound = lastRound ? lastRound.timestamp : 0;
  const query = {
    roundTime: lastCompletedRound, // may not contain completely accurate list which is 'ok'
  };
  const projection = {
    projection: {
      _id: 0,
      node: 1,
      flux: 1,
    },
  };
  // return latest fluxnode round
  const results = await serviceHelper.findInDatabase(database, fluxcollection, query, projection);
  const nodes = [];
  let votepowa = 0;
  // eslint-disable-next-line no-restricted-syntax
  for (const result of results) {
    if (result.flux && result.node && result.node.status) {
      if (result.flux.zelid === zelid) {
        if (result.node.status.tier === 'CUMULUS') {
          votepowa = 10;
        } else if (result.node.status.tier === 'NIMBUS') {
          votepowa = 25;
        } else if (result.node.status.tier === 'STRATUS') {
          votepowa = 100;
        }
        const nodeInfo = {
          tier: result.node.status.tier,
          ip: result.flux.ip,
          txhash: result.node.status.txhash,
          outidx: result.node.status.outidx,
          address: result.node.status.payment_address,
          power: votepowa,
          zelid,
        };
        nodes.push(nodeInfo);
      }
    }
  }
  let power = 0;
  nodes.forEach((node) => {
    if (node.tier === 'CUMULUS') {
      power += 10;
    } else if (node.tier === 'NIMBUS') {
      power += 25;
    } else if (node.tier === 'STRATUS') {
      power += 100;
    }
  });
  const data = {
    power,
    nodes,
  };
  return data;
}

async function getVotePower(req, res) {
  try {
    // get current vote power of zelid
    let { zelid } = req.params;
    zelid = zelid || req.query.zelid;
    let { hash } = req.params;
    hash = hash || req.query.hash;
    if (!zelid) {
      const errMessage = serviceHelper.createErrorMessage('No zelid provided');
      res.json(errMessage);
      return;
    }
    const data = await votePower(zelid, hash);
    const resMessage = serviceHelper.createDataMessage(data);
    res.json(resMessage);
  } catch (error) {
    const errMessage = serviceHelper.createErrorMessage(error.message, error.name, error.code);
    res.json(errMessage);
    log.error(error);
  }
}

async function submitProposal(req, res) {
  try {
    // post of
    // {
    //    topic,
    //    description,
    //    grantValue,
    //    grantAddress,
    //    nickName,
    // }
    let body = '';
    req.on('data', (data) => {
      body += data;
    });
    req.on('end', async () => {
      try {
        const processedBody = serviceHelper.ensureObject(body);
        if (!processedBody) {
          throw new Error('Invalid request');
        }
        const specificationVersion = 1;
        const {
          topic, description, grantValue, grantAddress, nickName,
        } = processedBody;
        if (!topic) {
          throw new Error('Missing proposal topic');
        }

        if (!description) {
          throw new Error('Missing proposal description');
        }

        const submitDate = new Date().getTime();
        // calculate hash
        const jsonString = specificationVersion + topic + description + grantValue + grantAddress + nickName + submitDate;
        const hash = generalService.messageHash(jsonString);
        const paidTillDate = submitDate + expirationPeriod;
        const voteEndDate = submitDate + voteEndPeriod;
        // votesRequired,status,txid,votesTotal,votesYes,votesYes
        // get votesRequired as flux network potential
        const countUrl = 'https://api.runonflux.io/daemon/getzelnodecount';
        const response = await axios.get(countUrl, axiosConfig);
        const cumulusVotes = response.data.data['cumulus-enabled'] * 10;
        const nimbusVotes = response.data.data['nimbus-enabled'] * 25;
        const stratusVotes = response.data.data['stratus-enabled'] * 100;
        const votePotential = cumulusVotes + nimbusVotes + stratusVotes;
        const votesRequired = Math.round(votePotential * miVotesCoefficient);
        const proposalToStore = {
          hash,
          topic,
          description,
          grantAddress,
          grantValue,
          nickName,
          submitDate,
          voteEndDate,
          status: 'Unpaid',
          txid: null,
          votesRequired,
          votesTotal: 0,
          votesYes: 0,
          votesNo: 0,
        };
        // check if hash not exists in our db
        const database = db.db(databaseLink);
        const query = {
          hash,
        };
        const projection = {
          projection: {
            _id: 0, // all except id
          },
        };
        const resDB = await serviceHelper.findOneInDatabase(database, proposalsCollection, query, projection);
        if (resDB) {
          throw new Error('Proposal already exists');
        }
        // store proposal
        await serviceHelper.insertOneToDatabase(database, proposalsCollection, proposalToStore);
        const responseData = {
          address: proposalAddress,
          amount: satoshisRequired / 1e8,
          hash,
          submitDate,
          paidTillDate,
        };
        const resMessage = serviceHelper.createDataMessage(responseData);
        res.json(resMessage);
      } catch (error) {
        log.error(error);
        const errMessage = serviceHelper.createErrorMessage(error.message, error.name, error.code);
        res.json(errMessage);
      }
    });
  } catch (error) {
    log.error(error);
    const errMessage = serviceHelper.createErrorMessage(error.message, error.name, error.code);
    res.json(errMessage);
  }
}

async function voteProposal(req, res) {
  try {
    // post of
    // {
    //    hash,
    //    zelid,
    //    message,
    //    signature,
    //    vote, // boolean true, false
    // }
    let body = '';
    req.on('data', (data) => {
      body += data;
    });
    req.on('end', async () => {
      try {
        if (userVoting) {
          throw new Error('Another user is currently voting, try again later');
        }
        userVoting = true;
        const processedBody = serviceHelper.ensureObject(body);
        if (!processedBody) {
          throw new Error('Invalid request');
        }
        const {
          hash, zelid, message, signature, vote,
        } = processedBody;
        if (!hash) {
          throw new Error('Missing hash parameter');
        }
        if (!zelid) {
          throw new Error('Missing vote parameter');
        }
        if (!message) {
          throw new Error('Missing message parameter');
        }
        if (!signature) {
          throw new Error('Missing signature parameter');
        }
        if (vote !== true && vote !== false) {
          throw new Error('Vote must be true or false');
        }
        const zelidValid = generalService.verifyZelID(zelid);
        if (zelidValid !== true) {
          throw new Error('Invalid zelid');
        }
        // check if vote exists and is Open stat
        const database = db.db(databaseLink);
        const query = {
          hash,
        };
        const projection = {
          projection: {
            _id: 0, // all except id
          },
        };
        const resDB = await serviceHelper.findOneInDatabase(database, proposalsCollection, query, projection);
        if (resDB.status !== 'Open') {
          throw new Error('Voting is not active for selected proposal');
        }
        // check if user already voted
        const queryUserVoted = {
          hash,
          zelid,
        };
        const results = await serviceHelper.findInDatabase(database, votingCollection, queryUserVoted, projection);
        if (results.length > 0) {
          throw new Error(`User ${zelid} already voted on proposal ${hash}`);
        }
        // check that message exists
        const messageOk = await generalService.messageExists(message);
        if (messageOk !== true) {
          throw new Error('Invalid message received');
        }
        const signatureOk = await generalService.verifyMessage(message, zelid, signature);
        if (signatureOk !== true) {
          throw new Error('Invalid signature');
        }
        // verification done
        // get votingPower
        const voteDate = new Date().getTime();
        const vPower = await votePower(zelid, hash);
        if (vPower.nodes.length < 1) {
          throw new Error(`No active nodes found for ${zelid}`);
        }
        const castedVotes = [];
        // eslint-disable-next-line no-restricted-syntax
        for (const nodepower of vPower.nodes) {
          // store my voting power per node
          const data = {
            hash,
            zelid,
            vote,
            voteDate,
            numberOfVotes: nodepower.power,
            nodeCollateralOut: nodepower.txhash,
            nodeCollateralIndex: nodepower.outidx,
            nodeAddress: nodepower.address,
            nodeIp: nodepower.ip,
          };
          castedVotes.push(data);
          await serviceHelper.insertOneToDatabase(database, votingCollection, data);
        }
        // delete the message used for signing from our db so nobody can use it again - important step!
        await generalService.deleteMessagePhrase(message);
        const resMessage = serviceHelper.createDataMessage(results);
        res.json(resMessage);
        userVoting = false;
      } catch (error) {
        log.error(error);
        const errMessage = serviceHelper.createErrorMessage(error.message, error.name, error.code);
        res.json(errMessage);
        userVoting = false;
      }
    });
  } catch (error) {
    log.error(error);
    const errMessage = serviceHelper.createErrorMessage(error.message, error.name, error.code);
    res.json(errMessage);
    userVoting = false;
  }
}

async function start() {
  try {
    db = await serviceHelper.connectMongoDb().catch((error) => {
      log.error(error);
      throw error;
    });
    const database = db.db(config.database.local.database);
    database.collection(proposalsCollection).createIndex({ hash: 1 }, { name: 'query for getting specific proposal' });
    database.collection(proposalsCollection).createIndex({ status: 1 }, { name: 'query for getting proposals according to statuses' });
    database.collection(proposalsCollection).createIndex({ txid: 1 }, { name: 'query for getting proposals belonging to txid' });
    database.collection(votingCollection).createIndex({ hash: 1, zelid: 1 }, { name: 'query for getting proposal and zelid' });
    database.collection(votingCollection).createIndex({ hash: 1 }, { name: 'query for getting votes for proposal' });
    database.collection(votingCollection).createIndex({ zelid: 1 }, { name: 'query for getting votes for zelid' });
    log.info('Initiating Proposal services...');
    // check for missing prposal unpaid statuses
    checkForMissingTransactions();
    // check open proposals
    checkOpenProposals();
  } catch (e) {
    // restart service after 5 mins
    log.error(e);
    setTimeout(() => {
      start();
    }, 5 * 30 * 1000);
  }
}
module.exports = {
  start,
  listProposals,
  proposalDetail,
  voteInformation,
  getVotePower,
  submitProposal,
  voteProposal,
};
