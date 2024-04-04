const pino = require('pino');

let logger;

if (process.env.NODE_ENV !== 'production') {
    logger = pino({
        level: 'debug',
        transport: {
            target: 'pino-pretty',
            options: {
                colorize: true
            }
        }
    });
} else {
    logger = pino()
}

module.exports = logger;