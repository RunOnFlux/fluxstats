const config = require('config');
const serviceHelper = require('./src/services/serviceHelper');

async function removeRecords() {
  let db = null;
  const kadenaNodesCollection = config.database.kadena.collections.nodes;
  // const completedRoundsCollection = config.database.kadena.collections.completedRounds;

  db = await serviceHelper.connectMongoDb();

  const database = db.db(config.database.kadena.database);

  const daysInMiliseconds = 35 * 24 * 60 * 60 * 1000;
  const currentTime = new Date().getTime();
  const minimumTime = currentTime - daysInMiliseconds;

  const query = {
    roundTime: { $lt: minimumTime },
  };
  const projection = {};

  const results = await serviceHelper.findInDatabase(database, kadenaNodesCollection, query, projection);
  console.log(results[0]);

  // const result = await serviceHelper.removeDocumentsFromCollection(database, kadenaNodesCollection, query);
  // console.log(result);

  // const queryB = {
  //   timestamp: { $lt: minimumTime },
  // };

  // const result = await serviceHelper.removeDocumentsFromCollection(database, completedRoundsCollection, queryB);
  // console.log(result);
}

removeRecords();
