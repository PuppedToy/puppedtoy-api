const { MongoClient } = require('mongodb');

let client;
let connectionPromise;

function connectDatabase() {
  if (connectionPromise) {
    return Promise.reject(new Error('The database was already connected'));
  }

  client = new MongoClient(
    process.env.MONGODB_URI,
    { useNewUrlParser: true, useUnifiedTopology: true },
  );

  connectionPromise = client.connect()
    .then(() => client.db(process.env.DB_NAME));

  return connectionPromise;
}

connectDatabase();

function getDatabase(collection = null) {
  if (!connectionPromise) {
    return Promise.reject(new Error('The database is not connected'));
  }

  if (collection && (typeof collection !== 'string')) {
    return Promise.reject(new Error('The parameter collection should be a string'));
  }

  if (!collection) {
    return connectionPromise;
  }

  return connectionPromise
    .then((db) => db.collection(collection));
}

function closeDatabase() {
  if (connectionPromise) {
    const closePromise = connectionPromise
      .then(() => client.close());

    connectionPromise = null;

    return closePromise;
  }

  return Promise.resolve();
}

module.exports = {
  getDatabase,
  connectDatabase,
  closeDatabase,
};
