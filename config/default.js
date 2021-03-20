module.exports = {
  server: {
    port: 8123,
  },
  explorer: 'https://explorer.zel.cash',
  database: {
    url: '127.0.0.1',
    port: 27017,
    local: {
      database: 'testfluxapi2',
      collections: {
        // Array of round of flux/info calls + geolocation.
        fluxes: 'fluxes',
        // geolocations of ip addresses belonging to flux instances
        geolocation: 'geolocation',
        // timestamp of completed full rounds
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
  },
};
