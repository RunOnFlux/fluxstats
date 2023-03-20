module.exports = {
  server: {
    port: 8123,
  },
  explorer: 'https://explorer.runonflux.io',
  firebase: false,
  database: {
    url: '127.0.0.1',
    port: 27017,
    local: {
      database: 'testfluxapi2',
      collections: {
        // Array of round of flux/info calls + geolocation.
        fluxes: 'fluxes', // WARNING replaced with 'fluxes-timestamp' for performance
        // geolocations of ip addresses belonging to flux instances
        geolocation: 'geolocation',
        // timestamp of completed full rounds that determines flux collections
        completedRounds: 'completedrounds',
      },
    },
    kadena: {
      database: 'kadena',
      collections: {
        // Array of round of flux/info calls + geolocation.
        nodes: 'nodes',
        // timestamp of completed full rounds
        completedRounds: 'completedrounds',
      },
    },
    proposals: {
      database: 'proposals',
      collections: {
        // Proposals {hash,topic,grantValue,grantAddress,description,nickName,submitDate,voteEndDate,votesRequired,status,txid,votesTotal,votesYes,votesNo} where votesTotal,votesYes,votesNo are with 5 min accuracy
        proposals: 'proposals',
        // Voting {hash,zelId,vote,voteDate,numberOfVotes,nodeCollateralOut,nodeCollateralIndex,nodeAddress,nodeIp}
        voting: 'voting',
      },
    },
    general: {
      database: 'general',
      collections: {
        activeMessagePhrases: 'activemessagephrases', // active message phrases used for creation of random messages that user has to sign
      },
    },
    marketplace: {
      database: 'marketplace',
      collections: {
        apps: 'apps',
      },
    },
  },
};
