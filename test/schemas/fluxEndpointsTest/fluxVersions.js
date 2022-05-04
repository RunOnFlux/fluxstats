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
                    daemon: {
                        type: 'number'
                    },
                    benchmark: {
                        type: 'string'
                    },
                    flux: {
                        type: 'string'
                    },
                }
            }
        }
    }
};