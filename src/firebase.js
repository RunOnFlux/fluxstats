const config = require('config');
const log = require('./lib/log');

let firebase;

if (config.firebase) {
  firebase = require("firebase-admin");
  const serviceAccount = require("./serviceAccountKey.json");
  firebase.initializeApp({
    credential: firebase.credential.cert(serviceAccount)
  });
  log.debug('Firebase initialized');
}

module.exports = {
  firebase,
};