const { ObjectId } = require('mongodb');

const { getDatabase } = require('../utils/getDatabase');
const { versionify } = require('./versions');

async function create(collection, resource, version) {
  const db = await getDatabase(collection);
  const versionedResource = await versionify(collection, resource, version);
  const insertion = {
    ...versionedResource,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  const result = await db.insertOne(insertion);
  return result;
}

async function update(collection, id, resource) {
  const db = await getDatabase(collection);
  const newFields = { ...resource, updatedAt: new Date() };
  const result = await db.updateOne({ _id: ObjectId(id) }, { $set: newFields });
  return result;
}

async function remove(collection, id) {
  const db = await getDatabase(collection);
  const result = await db.deleteOne({ _id: ObjectId(id) });
  return result;
}

async function getById(collection, id) {
  const db = await getDatabase(collection);
  const resource = await db.findOne({ _id: ObjectId(id) });
  return resource;
}

async function getAll(collection) {
  const db = await getDatabase(collection);
  const resources = await db.find({}).toArray();
  return resources;
}

async function getResourcesList() {
  const db = await getDatabase('versions');
  const resources = await db.distinct('collection', { 'sample.isResource': true });
  return resources;
}

module.exports = {
  create,
  update,
  remove,
  getById,
  getAll,
  getResourcesList,
};
