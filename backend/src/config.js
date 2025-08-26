const path = require('path');
require('dotenv').config();

const config = {
  port: parseInt(process.env.PORT || '4000', 10),
  corsOrigin: process.env.CORS_ORIGIN || '*',
  defaultTimeLimitSeconds: parseInt(process.env.POLL_TIME_LIMIT_DEFAULT || '60', 10),
  dataDir: process.env.DATA_DIR || 'storage',
  nodeEnv: process.env.NODE_ENV || 'development',
};

config.rooms = {
  poll: (pollId) => `poll:${pollId}`,
};

module.exports = config;