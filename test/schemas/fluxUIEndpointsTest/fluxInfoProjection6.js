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
};