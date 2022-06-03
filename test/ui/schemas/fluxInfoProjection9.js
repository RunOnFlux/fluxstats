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
          daemon: {
            type: 'object',
            properties: {
              info: {
                type: 'object',
                properties: {
                  version: {
                    type: 'number',
                  },
                  protocolversion: {
                    type: 'number',
                  },
                  walletversion: {
                    type: 'number',
                  },
                  blocks: {
                    type: 'number',
                  },
                  timeoffset: {
                    type: 'number',
                  },
                  connections: {
                    type: 'number',
                  },
                  proxy: {
                    type: 'string',
                  },
                  difficulty: {
                    type: 'number',
                  },
                  testnet: {
                    type: 'boolean',
                  },
                  keypoololdest: {
                    type: 'number',
                  },
                  keypoolsize: {
                    type: 'number',
                  },
                  paytxfee: {
                    type: 'number',
                  },
                  relayfee: {
                    type: 'number',
                  },
                  errors: {
                    type: 'string',
                  },
                },
              },
            },
          },
          benchmark: {
            type: 'object',
            properties: {
              info: {
                type: 'object',
                properties: {
                  version: {
                    type: 'string',
                  },
                  rpcport: {
                    type: 'number',
                  },
                },
              },
              status: {
                type: 'object',
                properties: {
                  status: {
                    type: 'string',
                  },
                  benchmarking: {
                    type: 'string',
                  },
                  flux: {
                    type: 'string',
                  },
                },
              },
              bench: {
                type: 'object',
                properties: {
                  ipaddress: {
                    type: 'string',
                  },
                  architecture: {
                    type: 'string',
                  },
                  armboard: {
                    type: 'string',
                  },
                  status: {
                    type: 'string',
                  },
                  time: {
                    type: 'number',
                  },
                  real_cores: {
                    type: 'number',
                  },
                  cores: {
                    type: 'number',
                  },
                  ram: {
                    type: 'number',
                  },
                  ssd: {
                    type: 'number',
                  },
                  hdd: {
                    type: 'number',
                  },
                  ddwrite: {
                    type: 'number',
                  },
                  totalstorage: {
                    type: 'number',
                  },
                  disksinfo: {
                    type: 'array',
                    properties: {
                      type: 'object',
                      properties: {
                        disk: {
                          type: 'string',
                        },
                        size: {
                          type: 'number',
                        },
                        writespeed: {
                          type: 'number',
                        },
                      },
                    },
                  },
                  eps: {
                    type: 'number',
                  },
                  ping: {
                    type: 'number',
                  },
                  download_speed: {
                    type: 'number',
                  },
                  upload_speed: {
                    type: 'number',
                  },
                  bench_version: {
                    type: 'string',
                  },
                  speed_version: {
                    type: 'string',
                  },
                  error: {
                    type: 'string',
                  },
                },
              },
            },
          },
          flux: {
            type: 'object',
            properties: {
              version: {
                type: 'string',
              },
              ip: {
                type: 'string',
              },
              zelid: {
                type: 'string',
              },
              cruxid: {
                type: 'string',
              },
              timezone: {
                type: 'string',
              },
              dos: {
                type: 'object',
                properties: {
                  dosState: {
                    type: 'number',
                  },
                  dosMessage: {
                    type: 'string',
                  },
                },
              },
              proxy: {
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
