class NodeTree {
  constructor(ip) {
    this.ip = ip;
    this.tier = '';
    this.zelId = '';
    this.continent = '';
    this.country = '';
    this.org = '';
    this.paymentAddress = '';
    this.connectionin = [];
    this.connectionout = [];
  }
}

const getConnections = async (axios, httpRequestFluxConnections, allips) => httpRequestFluxConnections(axios, allips);

const getConnectionData = async (info, nodes, axios, httpRequestFluxConnections) => {
  await Promise.all(
    nodes.map(async (el) => {
      const values = el;
      const temp = await getConnections(axios, httpRequestFluxConnections, values.ip.split(','));
      const tempin = [];
      const tempout = [];

      if (!temp[0]) {
        return values;
      }

      await temp[0].in.map(async (entry) => {
        const node = await info.filter((e) => e.ip === entry);

        if (!node || Object.keys(node).length <= 0) {
          return entry;
        }

        const nodetree = new NodeTree(entry);
        nodetree.tier = !node[0].node.status.tier ? '' : node[0].node.status.tier;
        tempin.push(nodetree);

        return entry;
      });

      await temp[0].out.map(async (entry) => {
        const node = await info.filter((e) => e.ip === entry);

        if (!node || Object.keys(node).length <= 0) {
          return entry;
        }

        const nodetree = new NodeTree(entry);
        nodetree.tier = !node[0].node.status.tier ? '' : node[0].node.status.tier;
        tempout.push(nodetree);

        return entry;
      });

      values.connectionin = Object.keys(tempin).length < 0 ? [] : tempin;
      values.connectionout = Object.keys(tempout).length < 0 ? [] : tempout;

      return values;
    }),
  );
  return nodes;
};

const populateNode = async (iptosearch, info) => {
  const ret = [];
  const node = new NodeTree(iptosearch);

  const item = await info.filter((e) => e.ip === iptosearch);
  if (item[0]) {
    node.tier = !item[0].node.status.tier ? '' : item[0].node.status.tier;
    node.zelId = !item[0].flux.zelid ? '' : item[0].flux.zelid;
    node.continent = !item[0].geolocation.continent ? '' : item[0].geolocation.continent;
    node.country = !item[0].geolocation.country ? '' : item[0].geolocation.country;
    node.org = !item[0].geolocation.org ? '' : item[0].geolocation.org;
    node.paymentaddress = !item[0].node.status.payment_address ? '' : item[0].node.status.payment_address;
    ret.push(node);
  }

  return ret;
};

const processChildren = async (node, info, axios, httpRequestFluxConnections) => {
  await getConnectionData(info, node.connectionin, axios, httpRequestFluxConnections);
  await getConnectionData(info, node.connectionout, axios, httpRequestFluxConnections);
};

const getDataVisualization = async (axios, MemoryStorage, httpRequestFluxConnections, iptosearch) => {
  const info = MemoryStorage.get('fluxinfo');
  const rootNode = await populateNode(iptosearch, info);
  const rootNodeProcessed = await getConnectionData(info, rootNode, axios, httpRequestFluxConnections);
  await Promise.all(
    rootNodeProcessed.map(async (i) => {
      await processChildren(i, info, axios, httpRequestFluxConnections);
      return i;
    }),
  );
  return rootNodeProcessed;
};

module.exports = {
  getDataVisualization,
  getConnections,
};
