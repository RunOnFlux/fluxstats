const config = require('config');
const serviceHelper = require('../services/serviceHelper');

async function removeRecords() {
  let db = null;
  const fluxcollection = config.database.local.collections.fluxes;
  const completedRoundsCollection = config.database.local.collections.completedRounds;

  db = await serviceHelper.connectMongoDb();

  const database = db.db(config.database.local.database);

  const daysInMiliseconds = 35 * 24 * 60 * 60 * 1000;
  const currentTime = new Date().getTime();
  const minimumTime = currentTime - daysInMiliseconds;

  const query = {
    roundTime: { $lt: minimumTime },
  };

  const result = await serviceHelper.removeDocumentsFromCollection(database, fluxcollection, query);
  console.log(result);

  const queryB = {
    timestamp: { $lt: minimumTime },
  };

  const resultB = await serviceHelper.removeDocumentsFromCollection(database, completedRoundsCollection, queryB);
  console.log(resultB);

  const collections = await serviceHelper.listCollections(database);
  console.log(collections);
  for (const collection of collections) {
    const alteredName = collection.slice(6);
    const collectionTimestamp = Number(alteredName) * 1000;
    if (collectionTimestamp < minimumTime && collection.startsWitH('fluxes')) {
      // drop it
      // eslint-disable-next-line no-await-in-loop
      await serviceHelper.dropCollection(database, collection);
      console.log(collection);
    }
  }
}

module.exports = {
  removeRecords,
};
