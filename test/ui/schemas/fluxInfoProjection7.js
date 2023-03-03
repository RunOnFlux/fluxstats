module.exports = {
  type: 'object',
  properties: {
    status: {
      type: 'string',
    },
    data: {
      type: 'array',
      properties: {
        type: 'object',
        properties: {
          geolocation: {
            type: 'object',
            properties: {
              ip: {
                type: 'string',
              },
              continent: {
                type: 'string',
              },
              continentCode: {
                type: 'string',
              },
              country: {
                type: 'string',
              },
              countryCode: {
                type: 'string',
              },
              region: {
                type: 'string',
              },
              regionName: {
                type: 'string',
              },
              lat: {
                type: 'number',
              },
              long: {
                type: 'number',
              },
              org: {
                type: 'string',
              },
            },
          },
          ip: {
            type: 'string',
          },
        },
      },
    },
  },
};
