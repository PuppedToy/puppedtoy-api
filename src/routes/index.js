const express = require('express');

const { authMiddleware } = require('../utils/middlewares');
const authRouter = require('./auth');
const resourcesRouter = require('./resources');
const stableDiffusionRouter = require('./stableDiffusion');

const router = express.Router();

router.use('/auth', authRouter);
router.use(authMiddleware);
router.use('/resources', resourcesRouter);
router.use('/stable-diffusion', stableDiffusionRouter);

module.exports = router;
