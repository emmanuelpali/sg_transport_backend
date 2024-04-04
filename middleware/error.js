const logger = require('../logger');

const errorMiddleware = (err, req, res, next) => {
    logger.error('Something went wrong: ', err);
    res.status(500).json({ error: 'Internal Server Error' });
}

module.exports = errorMiddleware;