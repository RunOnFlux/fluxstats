const request = require('supertest');
const chai = require('chai');

chai.use(require('chai-json-schema'));

module.exports = (server) => {
    describe('Flux UI Endpoints Test', () => {
        it('9. should receive status 200 on /fluxinfo?projection=ip,tier,geolocation,benchmark,node,flux and return 0 when server is running', (done) => {
            request(server)
                .get('/fluxinfo?projection=ip,tier,geolocation,benchmark,node,flux')
                .expect(200)
                .end((err, res) => {
                    if (err) {
                        done(-1);
                    }
                    chai.expect(res.body).to.be.jsonSchema(
                        {
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
                                            benchmark: {
                                                type: 'object',
                                                properties: {
                                                    info: {
                                                        type: 'object',
                                                        properties: {
                                                            version: {
                                                                type: 'string'
                                                            },
                                                            rpcport: {
                                                                type: 'number'
                                                            },
                                                        }
                                                    },
                                                    status: {
                                                        type: 'object',
                                                        properties: {
                                                            status: {
                                                                type: 'string'
                                                            },
                                                            benchmarking: {
                                                                type: 'string'
                                                            },
                                                            flux: {
                                                                type: 'string'
                                                            },
                                                        }
                                                    },
                                                    bench: {
                                                        type: 'object',
                                                        properties: {
                                                            ipaddress: {
                                                                type: 'string'
                                                            },
                                                            architecture: {
                                                                type: 'string'
                                                            },
                                                            armboard: {
                                                                type: 'string'
                                                            },
                                                            status: {
                                                                type: 'string'
                                                            },
                                                            time: {
                                                                type: 'number'
                                                            },
                                                            real_cores: {
                                                                type: 'number'
                                                            },
                                                            cores: {
                                                                type: 'number'
                                                            },
                                                            ram: {
                                                                type: 'number'
                                                            },
                                                            ssd: {
                                                                type: 'number'
                                                            },
                                                            hdd: {
                                                                type: 'number'
                                                            },
                                                            ddwrite: {
                                                                type: 'number'
                                                            },
                                                            totalstorage: {
                                                                type: 'number'
                                                            },
                                                            disksinfo: {
                                                                type: 'array',
                                                                properties: {
                                                                    type: 'object',
                                                                    properties: {
                                                                        disk: {
                                                                            type: 'string'
                                                                        },
                                                                        size: {
                                                                            type: 'number'
                                                                        },
                                                                        writespeed: {
                                                                            type: 'number'
                                                                        },
                                                                    }
                                                                }
                                                            },
                                                            eps: {
                                                                type: 'number'
                                                            },
                                                            ping: {
                                                                type: 'number'
                                                            },
                                                            download_speed: {
                                                                type: 'number'
                                                            },
                                                            upload_speed: {
                                                                type: 'number'
                                                            },
                                                            bench_version: {
                                                                type: 'string'
                                                            },
                                                            speed_version: {
                                                                type: 'string'
                                                            },
                                                            error: {
                                                                type: 'string'
                                                            },
                                                        }
                                                    },
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
                                            ip: {
                                                type: 'string'
                                            },
                                            tier: {
                                                type: 'string'
                                            },
                                        }
                                    }
                                }
                            }
                        }
                    );
                    done(0);
                });
        });
        it('10. should receive status 200 on /fluxhistorystats and return 0 when server is running', (done) => {
            request(server)
                .get('/fluxhistorystats')
                .expect(200)
                .end((err, res) => {
                    if (err) {
                        done(-1);
                    }
                    chai.expect(res.body).to.be.jsonSchema(
                        {
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
                                    }
                                }
                            }
                        }
                    );
                    done(0);
                });
        });
        it('11. should receive status 200 on /fluxinfo?projection=node,flux,appsHashesTotal and return 0 when server is running', (done) => {
            request(server)
                .get('/fluxinfo?projection=node,flux,appsHashesTotal')
                .expect(200)
                .end((err, res) => {
                    if (err) {
                        done(-1);
                    }
                    chai.expect(res.body).to.be.jsonSchema(
                        {
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
                                            appsHashesTotal: {
                                                type: 'number'
                                            },
                                        }
                                    }
                                }
                            }
                        }
                    );
                    done(0);
                });
        });
        it('12. should receive status 200 on /fluxinfo?projection=node,flux,geolocation,tier and return 0 when server is running', (done) => {
            request(server)
                .get('/fluxinfo?projection=node,flux,geolocation,tier')
                .expect(200)
                .end((err, res) => {
                    if (err) {
                        done(-1);
                    }
                    chai.expect(res.body).to.be.jsonSchema(
                        {
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
                    );
                    done(0);
                });
        });
        it('13. should receive status 200 on /fluxinfo?projection=ip,apps and return 0 when server is running', (done) => {
            request(server)
                .get('/fluxinfo?projection=ip,apps')
                .expect(200)
                .end((err, res) => {
                    if (err) {
                        done(-1);
                    }
                    chai.expect(res.body).to.be.jsonSchema(
                        {
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
                                                        type: 'string'
                                                    },
                                                    runningapps: {
                                                        type: 'array',
                                                        properties: {
                                                            type: 'object',
                                                            properties: {
                                                                Id: {
                                                                    type: 'string'
                                                                },
                                                                Names: {
                                                                    type: 'array',
                                                                    properties: {
                                                                        type: 'string'
                                                                    }
                                                                },
                                                                Image: {
                                                                    type: 'string'
                                                                },
                                                                ImageID: {
                                                                    type: 'string'
                                                                },
                                                                Command: {
                                                                    type: 'string'
                                                                },
                                                                Created: {
                                                                    type: 'number'
                                                                },
                                                                Ports: {
                                                                    type: 'array',
                                                                    properties: {
                                                                        type: 'object',
                                                                        properties: {
                                                                            IP: {
                                                                                type: 'string'
                                                                            },
                                                                            PrivatePort: {
                                                                                type: 'number'
                                                                            },
                                                                            PublicPort: {
                                                                                type: 'number'
                                                                            },
                                                                            Type: {
                                                                                type: 'string'
                                                                            },
                                                                        }
                                                                    }
                                                                },
                                                            }
                                                        }
                                                    },
                                                }
                                            },
                                            ip: {
                                                type: 'string'
                                            },
                                        }
                                    }
                                }
                            }
                        }
                    );
                    done(0);
                });
        });
        it('14. should receive status 200 on /fluxinfo?projection=ip,collateralIndex,collateralHash,appsHashesTotal,hashesPresent,addedHeight,lastPaidHeight,confirmedHeight,lastConfirmedHeight,scannedHeight and return 0 when server is running', (done) => {
            request(server)
                .get('/fluxinfo?projection=ip,collateralIndex,collateralHash,appsHashesTotal,hashesPresent,addedHeight,lastPaidHeight,confirmedHeight,lastConfirmedHeight,scannedHeight')
                .expect(200)
                .end((err, res) => {
                    if (err) {
                        done(-1);
                    }
                    chai.expect(res.body).to.be.jsonSchema(
                        {
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
                                                type: 'string'
                                            },
                                            addedHeight: {
                                                type: 'number'
                                            },
                                            confirmedHeight: {
                                                type: 'number'
                                            },
                                            lastConfirmedHeight: {
                                                type: 'number'
                                            },
                                            lastPaidHeight: {
                                                type: 'number'
                                            },
                                            collateralHash: {
                                                type: 'string'
                                            },
                                            collateralIndex: {
                                                type: 'number'
                                            },
                                            appsHashesTotal: {
                                                type: 'number'
                                            },
                                            hashesPresent: {
                                                type: 'number'
                                            },
                                            scannedHeight: {
                                                type: 'number'
                                            },
                                        }
                                    }
                                }
                            }
                        }
                    );
                    done(0);
                });
        });
        it('15. should receive status 200 on /fluxinfo?projection=ip,connectionsOut,connectionsIn and return 0 when server is running', (done) => {
            request(server)
                .get('/fluxinfo?projection=ip,connectionsOut,connectionsIn')
                .expect(200)
                .end((err, res) => {
                    if (err) {
                        done(-1);
                    }
                    chai.expect(res.body).to.be.jsonSchema(
                        {
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
                                                type: 'string'
                                            },
                                            connectionsOut: {
                                                type: 'array',
                                                properties: {
                                                    type: 'string'
                                                }
                                            },
                                            connectionsIn: {
                                                type: 'array',
                                                properties: {
                                                    type: 'string'
                                                }
                                            },
                                        }
                                    }
                                }
                            }
                        }
                    );
                    done(0);
                });
        });
        it('16. should receive status 200 on /fluxinfo?projection=ip,geolocation and return 0 when server is running', (done) => {
            request(server)
                .get('/fluxinfo?projection=ip,geolocation')
                .expect(200)
                .end((err, res) => {
                    if (err) {
                        done(-1);
                    }
                    chai.expect(res.body).to.be.jsonSchema(
                        {
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
                                            ip: {
                                                type: 'string'
                                            },
                                        }
                                    }
                                }
                            }
                        }
                    );
                    done(0);
                });
        });
        it('17. should receive status 200 on /fluxinfo?projection=ip,activeSince,dataCollectedAt and return 0 when server is running', (done) => {
            request(server)
                .get('/fluxinfo?projection=ip,activeSince,dataCollectedAt')
                .expect(200)
                .end((err, res) => {
                    if (err) {
                        done(-1);
                    }
                    chai.expect(res.body).to.be.jsonSchema(
                        {
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
                                                type: 'string'
                                            },
                                            activeSince: {
                                                type: 'string'
                                            },
                                            dataCollectedAt: {
                                                type: 'number'
                                            },
                                        }
                                    }
                                }
                            }
                        }
                    );
                    done(0);
                });
        });
        it('18. should receive status 200 on /fluxinfo?projection=ip,daemon,benchmark,flux and return 0 when server is running', (done) => {
            request(server)
                .get('/fluxinfo?projection=ip,daemon,benchmark,flux')
                .expect(200)
                .end((err, res) => {
                    if (err) {
                        done(-1);
                    }
                    chai.expect(res.body).to.be.jsonSchema(
                        {
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
                                                                type: 'number'
                                                            },
                                                            protocolversion: {
                                                                type: 'number'
                                                            },
                                                            walletversion: {
                                                                type: 'number'
                                                            },
                                                            blocks: {
                                                                type: 'number'
                                                            },
                                                            timeoffset: {
                                                                type: 'number'
                                                            },
                                                            connections: {
                                                                type: 'number'
                                                            },
                                                            proxy: {
                                                                type: 'string'
                                                            },
                                                            difficulty: {
                                                                type: 'number'
                                                            },
                                                            testnet: {
                                                                type: 'boolean'
                                                            },
                                                            keypoololdest: {
                                                                type: 'number'
                                                            },
                                                            keypoolsize: {
                                                                type: 'number'
                                                            },
                                                            paytxfee: {
                                                                type: 'number'
                                                            },
                                                            relayfee: {
                                                                type: 'number'
                                                            },
                                                            errors: {
                                                                type: 'string'
                                                            },
                                                        }
                                                    }
                                                }
                                            },
                                            benchmark: {
                                                type: 'object',
                                                properties: {
                                                    info: {
                                                        type: 'object',
                                                        properties: {
                                                            version: {
                                                                type: 'string'
                                                            },
                                                            rpcport: {
                                                                type: 'number'
                                                            },
                                                        }
                                                    },
                                                    status: {
                                                        type: 'object',
                                                        properties: {
                                                            status: {
                                                                type: 'string'
                                                            },
                                                            benchmarking: {
                                                                type: 'string'
                                                            },
                                                            flux: {
                                                                type: 'string'
                                                            },
                                                        }
                                                    },
                                                    bench: {
                                                        type: 'object',
                                                        properties: {
                                                            ipaddress: {
                                                                type: 'string'
                                                            },
                                                            architecture: {
                                                                type: 'string'
                                                            },
                                                            armboard: {
                                                                type: 'string'
                                                            },
                                                            status: {
                                                                type: 'string'
                                                            },
                                                            time: {
                                                                type: 'number'
                                                            },
                                                            real_cores: {
                                                                type: 'number'
                                                            },
                                                            cores: {
                                                                type: 'number'
                                                            },
                                                            ram: {
                                                                type: 'number'
                                                            },
                                                            ssd: {
                                                                type: 'number'
                                                            },
                                                            hdd: {
                                                                type: 'number'
                                                            },
                                                            ddwrite: {
                                                                type: 'number'
                                                            },
                                                            totalstorage: {
                                                                type: 'number'
                                                            },
                                                            disksinfo: {
                                                                type: 'array',
                                                                properties: {
                                                                    type: 'object',
                                                                    properties: {
                                                                        disk: {
                                                                            type: 'string'
                                                                        },
                                                                        size: {
                                                                            type: 'number'
                                                                        },
                                                                        writespeed: {
                                                                            type: 'number'
                                                                        },
                                                                    }
                                                                }
                                                            },
                                                            eps: {
                                                                type: 'number'
                                                            },
                                                            ping: {
                                                                type: 'number'
                                                            },
                                                            download_speed: {
                                                                type: 'number'
                                                            },
                                                            upload_speed: {
                                                                type: 'number'
                                                            },
                                                            bench_version: {
                                                                type: 'string'
                                                            },
                                                            speed_version: {
                                                                type: 'string'
                                                            },
                                                            error: {
                                                                type: 'string'
                                                            },
                                                        }
                                                    },
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
                                            ip: {
                                                type: 'string'
                                            },
                                        }
                                    }
                                }
                            }
                        }
                    );
                    done(0);
                });
        });
    });
};