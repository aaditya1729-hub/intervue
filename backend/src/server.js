const path = require('path');
const express = require('express');
const http = require('http');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const { Server } = require('socket.io');
const config = require('./config');
const { notFound, errorHandler } = require('./middleware/errors');
const pollsRouter = require('./routes/polls');
const { setupPollNamespace } = require('./sockets/pollSocket');
const { ensureDataDir } = require('./services/persistenceService');

ensureDataDir();

const app = express();
app.use(helmet());
app.use(cors({ origin: config.corsOrigin }));
app.use(express.json());
app.use(morgan('dev'));

app.get('/health', (req, res) => res.json({ ok: true }));
app.use('/api/polls', pollsRouter);

app.use(notFound);
app.use(errorHandler);

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: config.corsOrigin,
    methods: ['GET', 'POST'],
  },
});

setupPollNamespace(io);

server.listen(config.port, () => {
  console.log(`Server listening on http://localhost:${config.port}`);
});