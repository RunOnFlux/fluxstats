module.exports = {
  server: {
    port: 8123,
  },
  explorer: 'https://explorer.zel.cash',
  database: {
    url: '127.0.0.1',
    port: 27017,
    local: {
      database: 'testfluxapi',
      collections: {
        // Array of round of zelflux/info calls + geolocation.
        fluxes: 'fluxes',
        // geolocations of ip addresses belonging to zelflux instances
        geolocation: 'geolocation',
      },
    },
  },
};
