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
          region: {
            type: 'string',
          },
          regionName: {
            type: 'string',
          },
          lat: {
            type: 'string',
          },
          lon: {
            type: 'string',
          },
          org: {
            type: 'string',
          },
        },
      },
    },
  },
};
