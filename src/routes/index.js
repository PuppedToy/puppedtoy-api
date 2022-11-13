const express = require('express');

const resourcesRouter = require('./resources');

const router = express.Router();

router.use('/resources', resourcesRouter);

module.exports = router;
