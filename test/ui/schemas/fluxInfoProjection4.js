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
          apps: {
            type: 'object',
            properties: {
              fluxusage: {
                type: 'string',
              },
              runningapps: {
                type: 'array',
                properties: {
                  type: 'object',
                  properties: {
                    Id: {
                      type: 'string',
                    },
                    Names: {
                      type: 'array',
                      properties: {
                        type: 'string',
                      },
                    },
                    Image: {
                      type: 'string',
                    },
                    ImageID: {
                      type: 'string',
                    },
                    Command: {
                      type: 'string',
                    },
                    Created: {
                      type: 'number',
                    },
                    Ports: {
                      type: 'array',
                      properties: {
                        type: 'object',
                        properties: {
                          IP: {
                            type: 'string',
                          },
                          PrivatePort: {
                            type: 'number',
                          },
                          PublicPort: {
                            type: 'number',
                          },
                          Type: {
                            type: 'string',
                          },
                        },
                      },
                    },
                  },
                },
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
