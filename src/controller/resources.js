const resourcesDb = require('../db/resources');

async function createResourceController(req, res, next) {
  const { collection } = req.params;
  const { body } = req;
  const { version, ...resource } = body;
  resource.isResource = true;
  try {
    const newResource = await resourcesDb.create(collection, resource, version);
    res.status(201).send(newResource);
  } catch (error) {
    next(error);
  }
}

async function listResourcesController(req, res, next) {
  const { collection } = req.params;
  try {
    const resources = await resourcesDb.getAll(collection);
    res.status(200).send(resources);
  } catch (error) {
    next(error);
  }
}

async function getResourceController(req, res, next) {
  const { collection, id } = req.params;
  try {
    const resource = await resourcesDb.getById(collection, id);
    if (resource) {
      res.status(200).send(resource);
    } else {
      res.status(404).send();
    }
  } catch (error) {
    next(error);
  }
}

async function updateResourceController(req, res, next) {
  const { collection, id } = req.params;
  const { body: resource } = req;
  try {
    const updatedResource = await resourcesDb.update(collection, id, resource);
    if (updatedResource) {
      res.status(200).send(updatedResource);
    } else {
      res.status(404).send();
    }
  } catch (error) {
    next(error);
  }
}

async function deleteResourceController(req, res, next) {
  const { collection, id } = req.params;
  try {
    const result = await resourcesDb.remove(collection, id);

    if (result.deletedCount === 0) {
      res.status(404).send();
    } else {
      res.status(204).send();
    }
  } catch (error) {
    next(error);
  }
}

async function listAllResourcesController(req, res, next) {
  try {
    const resources = await resourcesDb.getResourcesList();
    res.status(200).send(resources);
  } catch (error) {
    next(error);
  }
}

module.exports = {
  createResourceController,
  getResourceController,
  listResourcesController,
  updateResourceController,
  deleteResourceController,
  listAllResourcesController,
};
