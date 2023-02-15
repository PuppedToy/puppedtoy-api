const express = require('express');

const controller = require('../controller/resources');
const { checkScopesMiddleware } = require('../utils/middlewares');

const router = express.Router();

router.get('/', controller.listAllResourcesController);
router.get('/:collection', controller.listResourcesController);
router.get('/:collection/:id', controller.getResourceController);
router.post('/:collection', checkScopesMiddleware('owner'), controller.createResourceController);
router.patch('/:collection/:id', checkScopesMiddleware('owner'), controller.updateResourceController);
router.delete('/:collection/:id', checkScopesMiddleware('owner'), controller.deleteResourceController);

module.exports = router;
