const express = require('express');
const cors = require('cors');
const pinoLogger = require('./logger');
const pinoHttp = require('pino-http')
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(pinoHttp({ pinoLogger }))

// import routes and middlewares
const loadsRouter = require('./routes/loads');
const authRouter = require('./routes/authRoutes');
const errorMiddleware = require('./middleware/error');

app.use('/api/auth', authRouter);
app.use('/api/loads', loadsRouter);

app.get('/', (req, res) => {
    res.send('Welcome to the Loads API');
});

app.use(errorMiddleware);

app.listen(process.env.PORT || 3000, () => {
    console.log(`listening on port ${process.env.PORT || 3000}`);
});