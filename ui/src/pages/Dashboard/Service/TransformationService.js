const processState = (keys, filters) => {
  filters.states.map((item) => {
    const values = item;
    values.state = false;
    if (keys.includes(values.name)) {
      values.state = true;
    }
    return values;
  });
  return filters;
};

const processFilters = (filters, filter, module) => {
  const arr = [];
  const data = [];
  filters.default.forEach((item) => {
    const objs = filter.get(item);
    objs.forEach((obj) => {
      if (module === 'historyinfo') {
        if (!arr.includes(`${obj.roundTime}${obj.total}`)) {
          arr.push(`${obj.roundTime}${obj.total}`);
          data.push(obj);
        }
      } else if (module === 'node') {
        if (!arr.includes(`${obj.node.status.ip}${obj.flux.zelid}`)) {
          arr.push(`${obj.node.status.ip}${obj.flux.zelid}`);
          data.push(obj);
        }
      } else if (module === 'nodeaddressinfo') {
        if (!arr.includes(`${obj.zelId}${obj.paymentId}`)) {
          arr.push(`${obj.zelId}${obj.paymentId}`);
          data.push(obj);
        }
      } else if (module === 'nodeapp') {
        if (!arr.includes(`${obj.ip}${obj.apps.count}`)) {
          arr.push(`${obj.ip}${obj.apps.count}`);
          data.push(obj);
        }
      } else if (module === 'nodeapphash') {
        if (!arr.includes(`${obj.ip}${obj.scannedHeight}`)) {
          arr.push(`${obj.ip}${obj.scannedHeight}`);
          data.push(obj);
        }
      } else if (module === 'nodebenchmark') {
        if (!arr.includes(`${obj.benchmark.bench.ipaddress}${obj.geolocation.org}`)) {
          arr.push(`${obj.benchmark.bench.ipaddress}${obj.geolocation.org}`);
          data.push(obj);
        }
      } else if (module === 'nodeconnection') {
        if (!arr.includes(`${obj.flux.ip}${obj.flux.numberOfConnectionsIn}`)) {
          arr.push(`${obj.flux.ip}${obj.flux.numberOfConnectionsIn}`);
          data.push(obj);
        }
      } else if (module === 'nodedaemon') {
        if (!arr.includes(`${obj.ip}${obj.daemon.info.blocks}`)) {
          arr.push(`${obj.ip}${obj.daemon.info.blocks}`);
          data.push(obj);
        }
      } else if (module === 'nodelocation') {
        if (!arr.includes(`${obj.geolocation.ip}${obj.geolocation.country}${obj.node.status.tier}`)) {
          arr.push(`${obj.geolocation.ip}${obj.geolocation.country}${obj.node.status.tier}`);
          data.push(obj);
        }
      } else if (module === 'nodeuptime') {
        if (!arr.includes(`${obj.ip}${obj.activeSince}`)) {
          arr.push(`${obj.ip}${obj.activeSince}`);
          data.push(obj);
        }
      }
    });
  });
  return data;
};

module.exports = {
  processState,
  processFilters,
};
