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
};