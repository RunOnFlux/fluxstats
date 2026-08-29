const axios = require('axios');
const LRU = require('lru-cache');
const config = require('config');
const log = require('../lib/log');

/**
 * Enterprise apps (spec v8 with a non-empty `enterprise` blob) publish an
 * ENCRYPTED compose: their image, entrypoint and build metadata are withheld
 * from the chain and from every Flux spec endpoint on purpose.
 *
 * The running container still carries all of it, and /flux/info hands us that
 * container listing verbatim. Storing and re-publishing it undid the
 * encryption for every enterprise app on the network, so the listing is
 * scrubbed here — on the way IN, so the value is never written to a round
 * collection, and again on the way OUT, so rounds collected before this shipped
 * are covered too.
 */
const ENTERPRISE_PLACEHOLDER = 'EnterpriseApp';

// Container fields derived from the encrypted spec.
const REDACTED_STRING_FIELDS = ['Image', 'ImageID', 'Command'];

const SPEC_URL = `${config.fluxApi || 'https://api.runonflux.io'}/apps/globalappsspecifications`;
const REFRESH_MS = 10 * 60 * 1000;

const cache = new LRU({ max: 4, ttl: REFRESH_MS }); // lru-cache v7 API, as used in fluxService
const CACHE_KEY = 'enterpriseAppNames';
// Last good answer, kept indefinitely: if the spec API is briefly unreachable we
// reuse it rather than falling back to "nothing is enterprise", which would
// publish exactly what this module exists to hide.
let lastKnownGood = null;
let inFlight = null;

async function fetchEnterpriseAppNames() {
  const res = await axios.get(SPEC_URL, { timeout: 30000 });
  const apps = res && res.data && res.data.data;
  if (!Array.isArray(apps)) throw new Error('globalappsspecifications returned no data array');
  const names = new Set();
  apps.forEach((app) => {
    if (app && app.version >= 8 && app.enterprise) names.add(app.name);
  });
  return names;
}

/**
 * Names of every enterprise app on the network.
 * Returns null only when no answer has EVER been obtained — callers must then
 * redact unconditionally rather than guess.
 */
async function enterpriseAppNames() {
  const cached = cache.get(CACHE_KEY);
  if (cached) return cached;

  if (!inFlight) {
    inFlight = fetchEnterpriseAppNames()
      .then((names) => {
        cache.set(CACHE_KEY, names);
        lastKnownGood = names;
        return names;
      })
      .catch((error) => {
        log.error(`enterpriseRedaction: spec refresh failed (${error.message}); reusing last known set`);
        return lastKnownGood;
      })
      .finally(() => { inFlight = null; });
  }
  return inFlight;
}

/** `/fluxComponent_appName` or `/fluxAppName` -> `appName`. */
function mainAppNameFromContainer(containerName) {
  const raw = String(containerName || '').replace(/^\//, '');
  const body = raw.replace(/^(zel|flux)/, '');
  return body.split('_')[1] || body;
}

/**
 * Replace the spec-derived fields of every enterprise container with the
 * placeholder. Shape is preserved, so container counts and app names still work.
 *
 * @param {Array} runningapps container listing from /flux/info
 * @returns {Promise<Array>} redacted copy; input is not mutated
 */
async function redactRunningApps(runningapps) {
  if (!Array.isArray(runningapps) || !runningapps.length) return runningapps;
  const names = await enterpriseAppNames();

  return runningapps.map((container) => {
    if (!container || typeof container !== 'object') return container;
    const appName = mainAppNameFromContainer((container.Names || [])[0]);
    // names == null: never resolved the set, so we cannot prove this is not
    // enterprise. Fail closed.
    if (names && !names.has(appName)) return container;

    const redacted = { ...container };
    REDACTED_STRING_FIELDS.forEach((field) => {
      if (field in redacted) redacted[field] = ENTERPRISE_PLACEHOLDER;
    });
    if ('Labels' in redacted) redacted.Labels = {};
    return redacted;
  });
}

/** Redact the container listing carried inside one stored fluxinfo document. */
async function redactFluxInfo(fluxInfo) {
  if (!fluxInfo || !fluxInfo.apps || !Array.isArray(fluxInfo.apps.runningapps)) return fluxInfo;
  // eslint-disable-next-line no-param-reassign
  fluxInfo.apps.runningapps = await redactRunningApps(fluxInfo.apps.runningapps);
  return fluxInfo;
}

/** Serve-side net for rounds collected before ingest redaction shipped. */
async function redactResults(results) {
  if (!Array.isArray(results) || !results.length) return results;
  const needsWork = results.some((r) => r && r.apps && Array.isArray(r.apps.runningapps) && r.apps.runningapps.length);
  if (!needsWork) return results;
  return Promise.all(results.map(async (doc) => {
    if (!doc || !doc.apps || !Array.isArray(doc.apps.runningapps)) return doc;
    return { ...doc, apps: { ...doc.apps, runningapps: await redactRunningApps(doc.apps.runningapps) } };
  }));
}

module.exports = {
  ENTERPRISE_PLACEHOLDER,
  enterpriseAppNames,
  mainAppNameFromContainer,
  redactRunningApps,
  redactFluxInfo,
  redactResults,
};
