const appVersion = require('../../package.json').version;
const { getDatabase } = require('../utils/getDatabase');

async function getCollectionVersion(collection) {
  const db = await getDatabase('versions');

  const version = await db.findOne({ collection }, { sort: { date: -1 } });

  return version;
}

function getDeepKeysFromObjectRecursive(obj, prefix = '') {
  return Object.keys(obj).reduce((keys, key) => {
    const value = obj[key];
    if (typeof value === 'object') {
      return keys.concat(`${prefix}.${getDeepKeysFromObjectRecursive(value, `${prefix}${prefix ? '.' : ''}${key}`).map((k) => `${key}.${k}`)}`);
    }
    return keys.concat(key);
  }, []);
}

function getDeepKeysFromObject(obj) {
  const bannedKeys = ['_id', 'appVersion', 'version', 'createdAt', 'updatedAt'];
  return getDeepKeysFromObjectRecursive(obj)
    .filter((key) => !bannedKeys.includes(key))
    .sort();
}

async function updateCollectionVersionIfNew(collection, sample) {
  const version = await getCollectionVersion(collection);
  if (!sample) throw new Error('sample can\'t be null');

  const previousKeys = getDeepKeysFromObject(version?.sample || {});
  const currentKeys = getDeepKeysFromObject(sample);

  console.log(previousKeys);
  console.log(currentKeys);

  const areSameVersions = version && previousKeys.length === currentKeys.length
        && previousKeys.every((key, index) => key === currentKeys[index]);

  if (!areSameVersions) {
    const previousVersionNumber = version ? version.number : 0;
    const newVersionNumber = previousVersionNumber + 1;
    const db = await getDatabase('versions');
    await db.insertOne({
      appVersion,
      number: newVersionNumber,
      collection,
      sample,
      date: new Date(),
    });
    return newVersionNumber;
  }

  return version.number;
}

async function versionify(collection, object, versionOverride) {
  let version = versionOverride;
  if (!version) {
    version = await updateCollectionVersionIfNew(collection, object);
  }

  return {
    appVersion,
    version,
    ...object,
  };
}

module.exports = {
  getCollectionVersion,
  updateCollectionVersionIfNew,
  versionify,
};
