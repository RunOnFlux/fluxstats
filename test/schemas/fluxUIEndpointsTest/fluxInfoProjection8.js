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
};