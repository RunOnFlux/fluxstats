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

// ipports -> array of string port value
const httpRequestFluxConnections = async (axios, ipports) => {
  const response = await axios.post('http://localhost:8123/fluxconnections', { ips: ipports }, {
    headers: {
      'Content-Type': 'application/json',
    },
    timeout: Number.MAX_VALUE,
  });
  return response.data;
};

module.exports = {
  httpRequestFluxInfo,
  httpRequestDaemonInfo,
  httpRequestFluxHistoryStats,
  httpRequestFluxConnections,
};
