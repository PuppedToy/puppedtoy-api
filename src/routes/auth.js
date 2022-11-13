const express = require('express');

const controller = require('../controller/auth');

const router = express.Router();

router.post('/login', controller.loginController);
router.post('/register', controller.registerController);

module.exports = router;
