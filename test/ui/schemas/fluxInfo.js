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
          node: {
            type: 'object',
            properties: {
              status: {
                type: 'object',
                properties: {
                  status: {
                    type: 'string',
                  },
                  collateral: {
                    type: 'string',
                  },
                  txhash: {
                    type: 'string',
                  },
                  outidx: {
                    type: 'string',
                  },
                  ip: {
                    type: 'string',
                  },
                  network: {
                    type: 'string',
                  },
                  added_height: {
                    type: 'number',
                  },
                  confirmed_height: {
                    type: 'number',
                  },
                  last_confirmed_height: {
                    type: 'number',
                  },
                  last_paid_height: {
                    type: 'number',
                  },
                  tier: {
                    type: 'string',
                  },
                  payment_address: {
                    type: 'string',
                  },
                  pubkey: {
                    type: 'string',
                  },
                  activesince: {
                    type: 'string',
                  },
                  lastpaid: {
                    type: 'string',
                  },
                  amount: {
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
          addedHeight: {
            type: 'number',
          },
          confirmedHeight: {
            type: 'number',
          },
          lastConfirmedHeight: {
            type: 'number',
          },
          lastPaidHeight: {
            type: 'number',
          },
          tier: {
            type: 'string',
          },
          paymentAddress: {
            type: 'string',
          },
          activeSince: {
            type: 'string',
          },
          collateralHash: {
            type: 'string',
          },
          collateralIndex: {
            type: 'number',
          },
          roundTime: {
            type: 'number',
          },
          appsHashesTotal: {
            type: 'number',
          },
          hashesPresent: {
            type: 'number',
          },
          scannedHeight: {
            type: 'number',
          },
          connectionsOut: {
            type: 'array',
            properties: {
              type: 'string',
            },
          },
          connectionsIn: {
            type: 'array',
            properties: {
              type: 'string',
            },
          },
          dataCollectedAt: {
            type: 'number',
          },
        },
      },
    },
  },
};
