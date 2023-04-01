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

const httpRequestFluxPriceHistory = async (axios, MemoryStorage) => {
  const lsdata = MemoryStorage.get('fluxpricehistory');
  if (!lsdata) {
    const response = await axios.get('https://api.coingecko.com/api/v3/coins/zelcash/market_chart?vs_currency=USD&days=30');
    MemoryStorage.put('fluxpricehistory', response.data.prices, 18000);
  }
};

const httpRequestFluxHistoryStats = async (axios, MemoryStorage) => {
  const lsdata = MemoryStorage.get('fluxhistorystats');
  if (!lsdata) {
    const response = await axios.get('https://stats.runonflux.io/fluxhistorystats');
    MemoryStorage.put('fluxhistorystats', response.data.data, 18000);
  }
};

// ipports -> array of string port value
async function httpRequestFluxConnections(axios, ipports) {
  try {
    const ret = [];
    const ips = ipports;
    const datain = [];
    const dataout = [];

    await ips.map((item) => {
      ret.push({
        ip: item,
        in: [],
        out: [],
      });
      return item;
    });

    await Promise.all(
      ret.map(async (item) => {
        const value = item;
        const ipval = value.ip;
        if (!ipval) {
          return value;
        }
        try {
          let response1 = '';
          let response2 = '';
          if (ipval.includes(':')) {
            response1 = await axios.get(`http://${ipval.split(':')[0]}:${ipval.split(':')[1]}/flux/incomingconnectionsinfo`, { timeout: 2000 });
            response2 = await axios.get(`http://${ipval.split(':')[0]}:${ipval.split(':')[1]}/flux/connectedpeersinfo`, { timeout: 2000 });
          } else {
            response1 = await axios.get(`http://${ipval}:16127/flux/incomingconnectionsinfo`, { timeout: 2000 });
            response2 = await axios.get(`http://${ipval}:16127/flux/connectedpeersinfo`, { timeout: 2000 });
          }
          if (response1) {
            await response1.data.data.map((i) => {
              datain.push(i.ip.split(':')[3]);
              return i;
            });
          }
          if (response2) {
            await response2.data.data.map((i) => {
              dataout.push(i.ip);
              return i;
            });
          }
          value.in = datain;
          value.out = dataout;
          return value;
        } catch (e) {
          return value;
        }
      }),
    );

    return ret;
  } catch (e) {
    return [];
  }
}

module.exports = {
  httpRequestFluxInfo,
  httpRequestDaemonInfo,
  httpRequestFluxHistoryStats,
  httpRequestFluxConnections,
  httpRequestFluxPriceHistory,
};
