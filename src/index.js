const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();
const debug = require('debug');

console.log('Starting server...');
const logger = debug('puppedtoy:server');
logger.log = console.log.bind(console);

const router = require('./routes');
const { initChat } = require('./utils/chat');

const app = express();
// eslint-disable-next-line import/order
const server = require('http').createServer(app);

const port = process.env.PORT || 3000;

app.use(helmet());
app.use(bodyParser.json());
app.use(cors());
app.use(morgan('combined'));

app.use(router);

// Not found
app.use((req, res) => {
  res.status(404).json({
    error: 'Not found',
  });
});

// Error handling middleware
app.use((error, req, res) => {
  console.error(error);

  const response = {
    error: {
      message: error.message,
      stack: error.stack,
    },
  };

  res.status(500).send(response);
});

initChat(server);
server.listen(port, () => {
  logger(`Started on port ${port}`);
});
