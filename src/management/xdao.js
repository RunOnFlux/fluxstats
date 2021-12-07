const config = require('config');
const serviceHelper = require('../services/serviceHelper');

async function removeRejectedUnpaidRecords() {
  let db = null;
  const proposalsCollection = config.database.proposals.collections.proposals;

  db = await serviceHelper.connectMongoDb();

  const database = db.db(config.database.proposals.database);

  const query = {
    status: 'Rejected Unpaid',
  };

  const result = await serviceHelper.removeDocumentsFromCollection(database, proposalsCollection, query);
  console.log(result);
}

module.exports = {
  removeRejectedUnpaidRecords,
};
