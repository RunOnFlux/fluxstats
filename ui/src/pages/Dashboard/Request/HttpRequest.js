const httpRequestFluxInfo = async (axios, MemoryStorage) => {
  const lsdata = MemoryStorage.get('fluxinfo');
  if (!lsdata) {
    const response = await axios.get('https://stats.runonflux.io/fluxinfo');
    MemoryStorage.put('fluxinfo', response.data.data, 18000);
  }
  return 60;
};

const httpRequestDaemonInfo = async (axios, MemoryStorage) => {
  const lsdata = MemoryStorage.get('daemon/viewdeterministiczelnodelist');
  if (!lsdata) {
    const response = await axios.get('https://api.runonflux.io/daemon/viewdeterministiczelnodelist');
    MemoryStorage.put('daemon/viewdeterministiczelnodelist', response.data.data, 18000);
  }
  return 80;
};

const httpRequestFluxHistoryStats = async (axios, MemoryStorage) => {
  const lsdata = MemoryStorage.get('fluxhistorystats');
  if (!lsdata) {
    const response = await axios.get('https://stats.runonflux.io/fluxhistorystats');
    MemoryStorage.put('fluxhistorystats', response.data.data, 18000);
  }
  return 95;
};

const httpRequestIncomingConnectedPeers = async (axios, ipport) => {
  const ip = ipport;
  let response = '';
  if (ipport.includes(':')) {
    response = await axios.get(`http://${ipport.split(':')[0]}:${ipport.split(':')[1]}/flux/incomingconnectionsinfo`, { timeout: 2000 });
    if (response) {
      return response.data.data;
    }
  }
  response = await axios.get(`http://${ip}:16127/flux/incomingconnectionsinfo`, { timeout: 2000 });
  if (response) {
    return response.data.data;
  }
  return [];
};

const httpRequestOutgoingConnectedPeers = async (axios, ipport) => {
  const ip = ipport;
  let response = '';
  if (ipport.includes(':')) {
    response = await axios.get(`http://${ipport.split(':')[0]}:${ipport.split(':')[1]}/flux/connectedpeersinfo`, { timeout: 2000 });
    if (response) {
      return response.data.data;
    }
  }
  response = await axios.get(`http://${ip}:16127/flux/connectedpeersinfo`, { timeout: 2000 });
  if (response) {
    return response.data.data;
  }
  return [];
};

module.exports = {
  httpRequestFluxInfo,
  httpRequestDaemonInfo,
  httpRequestFluxHistoryStats,
  httpRequestIncomingConnectedPeers,
  httpRequestOutgoingConnectedPeers,
};
