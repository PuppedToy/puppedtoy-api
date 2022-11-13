const express = require('express');

const { authMiddleware } = require('../utils/middlewares');
const authRouter = require('./auth');
const resourcesRouter = require('./resources');

const router = express.Router();

router.use('/auth', authRouter);
router.use(authMiddleware);
router.use('/resources', resourcesRouter);

module.exports = router;
