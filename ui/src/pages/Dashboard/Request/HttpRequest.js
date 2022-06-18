const httpRequestFluxInfo = async (axios, MemoryStorage) => {
  const lsdata = MemoryStorage.get('fluxinfo');
  if (!lsdata) {
    const response = await axios.get('https://stats.runonflux.io/fluxinfo');
    MemoryStorage.put('fluxinfo', response.data.data, 18000);
  }
};

const httpRequestDaemonInfo = async (axios, MemoryStorage) => {
  const lsdata = MemoryStorage.get('daemon/viewdeterministiczelnodelist');
  if (!lsdata) {
    const response = await axios.get('https://api.runonflux.io/daemon/viewdeterministiczelnodelist');
    MemoryStorage.put('daemon/viewdeterministiczelnodelist', response.data.data, 18000);
  }
};

const httpRequestFluxHistoryStats = async (axios, MemoryStorage) => {
  const lsdata = MemoryStorage.get('fluxhistorystats');
  if (!lsdata) {
    const response = await axios.get('https://stats.runonflux.io/fluxhistorystats');
    MemoryStorage.put('fluxhistorystats', response.data.data, 18000);
  }
};

module.exports = {
  httpRequestFluxInfo,
  httpRequestDaemonInfo,
  httpRequestFluxHistoryStats,
};
