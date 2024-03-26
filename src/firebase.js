const config = require('config');
const log = require('./lib/log');
// eslint-disable-next-line import/no-unresolved
const serviceAccount = require('./serviceAccountKey.json');

let firebase;

if (config.firebase) {
  // eslint-disable-next-line global-require
  firebase = require('firebase-admin');
  firebase.initializeApp({
    credential: firebase.credential.cert(serviceAccount),
  });
  log.debug('Firebase initialized');
}

module.exports = {
  firebase,
};
