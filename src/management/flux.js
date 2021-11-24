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
}

module.exports = {
  removeRecords,
};
