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
                    node: {
                        type: 'object',
                        properties: {
                            status: {
                                type: 'object',
                                properties: {
                                    status: {
                                        type: 'string'
                                    },
                                    collateral: {
                                        type: 'string'
                                    },
                                    txhash: {
                                        type: 'string'
                                    },
                                    outidx: {
                                        type: 'string'
                                    },
                                    ip: {
                                        type: 'string'
                                    },
                                    network: {
                                        type: 'string'
                                    },
                                    added_height: {
                                        type: 'number'
                                    },
                                    confirmed_height: {
                                        type: 'number'
                                    },
                                    last_confirmed_height: {
                                        type: 'number'
                                    },
                                    last_paid_height: {
                                        type: 'number'
                                    },
                                    tier: {
                                        type: 'string'
                                    },
                                    payment_address: {
                                        type: 'string'
                                    },
                                    pubkey: {
                                        type: 'string'
                                    },
                                    activesince: {
                                        type: 'string'
                                    },
                                    lastpaid: {
                                        type: 'string'
                                    },
                                    amount: {
                                        type: 'string'
                                    },
                                }
                            }
                        }
                    },
                    flux: {
                        type: 'object',
                        properties: {
                            version: {
                                type: 'string'
                            },
                            ip: {
                                type: 'string'
                            },
                            zelid: {
                                type: 'string'
                            },
                            cruxid: {
                                type: 'string'
                            },
                            timezone: {
                                type: 'string'
                            },
                            dos: {
                                type: 'object',
                                properties: {
                                    dosState: {
                                        type: 'number'
                                    },
                                    dosMessage: {
                                        type: 'string'
                                    },
                                }
                            },
                            proxy: {
                                type: 'string'
                            },
                        }
                    },
                    geolocation: {
                        type: 'object',
                        properties: {
                            ip: {
                                type: 'string'
                            },
                            continent: {
                                type: 'string'
                            },
                            continentCode: {
                                type: 'string'
                            },
                            country: {
                                type: 'string'
                            },
                            countryCode: {
                                type: 'string'
                            },
                            region: {
                                type: 'string'
                            },
                            regionName: {
                                type: 'string'
                            },
                            lat: {
                                type: 'number'
                            },
                            long: {
                                type: 'number'
                            },
                            org: {
                                type: 'string'
                            },
                        }
                    },
                    tier: {
                        type: 'string'
                    },
                }
            }
        }
    }
}