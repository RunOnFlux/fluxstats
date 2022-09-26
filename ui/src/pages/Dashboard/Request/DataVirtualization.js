const getConnectionIn = async (axios, httpRequestIncomingConnectedPeers, ip) => httpRequestIncomingConnectedPeers(axios, ip);

const getConnectionOut = async (axios, httpRequestOutgoingConnectedPeers, ip) => httpRequestOutgoingConnectedPeers(axios, ip);

const getIndividualDataVisualization = async (axios, MemoryStorage, httpRequestIncomingConnectedPeers, httpRequestOutgoingConnectedPeers, ip) => {
  const info = MemoryStorage.get('fluxinfo');
  let el = [];

  el = info.filter((i) => i.ip === ip);

  if (Object.keys(el).length < 0) {
    return el;
  }

  el = await el[0];

  const connectionin = await getConnectionIn(axios, httpRequestIncomingConnectedPeers, ip);

  const tempin = [];
  await connectionin.map(async (e) => {
    if (!e.ip.split(':')[3]) {
      return e;
    }

    let item = info.filter((i) => i.node.status.ip === e.ip.split(':')[3]);

    if (Object.keys(item).length < 0 || !item) {
      return e;
    }

    item = await item[0];
    try {
      tempin.push({
        ip: !item.node.status.ip ? '' : item.node.status.ip,
        tier: !item.node.status.tier ? '' : item.node.status.tier,
        zelid: !item.flux.zelid ? '' : item.flux.zelid,
        continent: !item.geolocation.continent ? '' : item.geolocation.continent,
        country: !item.geolocation.country ? '' : item.geolocation.country,
        org: !item.geolocation.org ? '' : item.geolocation.org,
        paymentaddress: !item.node.status.payment_address ? '' : item.node.status.payment_address,
      });
    } catch (ex) {
      // console.log(`Connection in not found: ${e.ip.split(':')[3]}`);
    }
    return e;
  });

  const connectionout = await getConnectionOut(axios, httpRequestOutgoingConnectedPeers, ip);

  const tempout = [];
  await connectionout.map(async (e) => {
    if (!e.ip) {
      return e;
    }

    let item = info.filter((i) => i.node.status.ip === e.ip);

    if (Object.keys(item).length < 0 || !item) {
      return e;
    }

    item = await item[0];
    try {
      tempout.push({
        ip: !item.node.status.ip ? '' : item.node.status.ip,
        tier: !item.node.status.tier ? '' : item.node.status.tier,
        zelid: !item.flux.zelid ? '' : item.flux.zelid,
        continent: !item.geolocation.continent ? '' : item.geolocation.continent,
        country: !item.geolocation.country ? '' : item.geolocation.country,
        org: !item.geolocation.org ? '' : item.geolocation.org,
        paymentaddress: !item.node.status.payment_address ? '' : item.node.status.payment_address,
      });
    } catch (ex) {
      // console.log(`Connection out not found: ${e.ip}`);
    }
    return e;
  });

  await tempin.map(async (i) => {
    const val = i;
    val.connectionin = await getConnectionIn(axios, httpRequestIncomingConnectedPeers, val.ip);
    val.connectionout = await getConnectionOut(axios, httpRequestOutgoingConnectedPeers, val.ip);
    return val;
  });

  await tempout.map(async (i) => {
    const val = i;
    val.connectionin = await getConnectionIn(axios, httpRequestIncomingConnectedPeers, val.ip);
    val.connectionout = await getConnectionOut(axios, httpRequestOutgoingConnectedPeers, val.ip);
    return val;
  });

  const elements = [];
  elements.push({
    ip: !el.node.status.ip ? '' : el.node.status.ip,
    tier: !el.node.status.tier ? '' : el.node.status.tier,
    zelid: !el.flux.zelid ? '' : el.flux.zelid,
    continent: !el.geolocation.continent ? '' : el.geolocation.continent,
    country: !el.geolocation.country ? '' : el.geolocation.country,
    org: !el.geolocation.org ? '' : el.geolocation.org,
    paymentaddress: !el.node.status.payment_address ? '' : el.node.status.payment_address,
    connectionin: Object.keys(tempin).length < 0 ? [] : tempin,
    connectionout: Object.keys(tempout).length < 0 ? [] : tempout,
  });

  console.log(elements);
  return elements;
};

module.exports = {
  getIndividualDataVisualization,
  getConnectionIn,
  getConnectionOut,
};
