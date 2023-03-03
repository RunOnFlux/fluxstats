module.exports = {
  type: 'object',
  properties: {
    status: {
      type: 'string',
    },
    data: {
      type: 'object',
      properties: {
        cumulus: {
          type: 'string',
        },
        nimbus: {
          type: 'string',
        },
        stratus: {
          type: 'string',
        },
      },
    },
  },
};
