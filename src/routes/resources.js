const express = require('express');

const controller = require('../controller/resources');

const router = express.Router();

router.get('/', controller.listAllResourcesController);
router.post('/:collection', controller.createResourceController);
router.get('/:collection', controller.listResourcesController);
router.get('/:collection/:id', controller.getResourceController);
router.patch('/:collection/:id', controller.updateResourceController);
router.delete('/:collection/:id', controller.deleteResourceController);

module.exports = router;
