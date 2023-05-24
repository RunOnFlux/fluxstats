const sortHistoryInfo = (values, sortProps, originalData) => {
  let tableData = [];
  if (sortProps.column.label === 'Round Time' && sortProps.column.order === 'ascending') {
    values.sort((a, b) => {
      let val = 0;
      if (a.roundTime > b.roundTime) {
        val = 1;
      } else if (a.roundTime < b.roundTime) {
        val = -1;
      }
      return val;
    });
  } else if (sortProps.column.label === 'Round Time' && sortProps.column.order === 'descending') {
    values.sort((a, b) => {
      let val = 0;
      if (a.roundTime < b.roundTime) {
        val = 1;
      } else if (a.roundTime > b.roundTime) {
        val = -1;
      }
      return val;
    });
  } else if (sortProps.column.label === 'Round Time Converted' && sortProps.column.order === 'ascending') {
    values.sort((a, b) => {
      let val = 0;
      if (a.roundTime > b.roundTime) {
        val = 1;
      } else if (a.roundTime < b.roundTime) {
        val = -1;
      }
      return val;
    });
  } else if (sortProps.column.label === 'Round Time Converted' && sortProps.column.order === 'descending') {
    values.sort((a, b) => {
      let val = 0;
      if (a.roundTime < b.roundTime) {
        val = 1;
      } else if (a.roundTime > b.roundTime) {
        val = -1;
      }
      return val;
    });
  } else if (sortProps.column.label === 'Cumulus' && sortProps.column.order === 'ascending') {
    values.sort((a, b) => {
      let val = 0;
      if (a.cumulus > b.cumulus) {
        val = 1;
      } else if (a.cumulus < b.cumulus) {
        val = -1;
      }
      return val;
    });
  } else if (sortProps.column.label === 'Cumulus' && sortProps.column.order === 'descending') {
    values.sort((a, b) => {
      let val = 0;
      if (a.cumulus < b.cumulus) {
        val = 1;
      } else if (a.cumulus > b.cumulus) {
        val = -1;
      }
      return val;
    });
  } else if (sortProps.column.label === 'Nimbus' && sortProps.column.order === 'ascending') {
    values.sort((a, b) => {
      let val = 0;
      if (a.nimbus > b.nimbus) {
        val = 1;
      } else if (a.nimbus < b.nimbus) {
        val = -1;
      }
      return val;
    });
  } else if (sortProps.column.label === 'Nimbus' && sortProps.column.order === 'descending') {
    values.sort((a, b) => {
      let val = 0;
      if (a.nimbus < b.nimbus) {
        val = 1;
      } else if (a.nimbus > b.nimbus) {
        val = -1;
      }
      return val;
    });
  } else if (sortProps.column.label === 'Stratus' && sortProps.column.order === 'ascending') {
    values.sort((a, b) => {
      let val = 0;
      if (a.stratus > b.stratus) {
        val = 1;
      } else if (a.stratus < b.stratus) {
        val = -1;
      }
      return val;
    });
  } else if (sortProps.column.label === 'Stratus' && sortProps.column.order === 'descending') {
    values.sort((a, b) => {
      let val = 0;
      if (a.stratus < b.stratus) {
        val = 1;
      } else if (a.stratus > b.stratus) {
        val = -1;
      }
      return val;
    });
  } else if (sortProps.column.label === 'Total Nodes' && sortProps.column.order === 'ascending') {
    values.sort((a, b) => {
      let val = 0;
      if (a.total > b.total) {
        val = 1;
      } else if (a.total < b.total) {
        val = -1;
      }
      return val;
    });
  } else if (sortProps.column.label === 'Total Nodes' && sortProps.column.order === 'descending') {
    values.sort((a, b) => {
      let val = 0;
      if (a.total < b.total) {
        val = 1;
      } else if (a.total > b.total) {
        val = -1;
      }
      return val;
    });
  } else {
    tableData = JSON.parse(originalData);
  }
  return { datas: values, tableDatas: tableData };
};

const sortNode = (values, sortProps, originalData) => {
  let tableData = [];
  if (sortProps.column.label === 'IP Address' && sortProps.column.order === 'ascending') {
    values.sort((a, b) => {
      let val = 0;
      if (a.node.status.ip > b.node.status.ip) {
        val = 1;
      } else if (a.node.status.ip < b.node.status.ip) {
        val = -1;
      }
      return val;
    });
  } else if (sortProps.column.label === 'IP Address' && sortProps.column.order === 'descending') {
    values.sort((a, b) => {
      let val = 0;
      if (a.node.status.ip < b.node.status.ip) {
        val = 1;
      } else if (a.node.status.ip > b.node.status.ip) {
        val = -1;
      }
      return val;
    });
  } else if (sortProps.column.label === 'Network Protocol' && sortProps.column.order === 'ascending') {
    values.sort((a, b) => {
      let val = 0;
      if (a.node.status.network > b.node.status.network) {
        val = 1;
      } else if (a.node.status.network < b.node.status.network) {
        val = -1;
      }
      return val;
    });
  } else if (sortProps.column.label === 'Network Protocol' && sortProps.column.order === 'descending') {
    values.sort((a, b) => {
      let val = 0;
      if (a.node.status.network < b.node.status.network) {
        val = 1;
      } else if (a.node.status.network > b.node.status.network) {
        val = -1;
      }
      return val;
    });
  } else if (sortProps.column.label === 'Tier' && sortProps.column.order === 'ascending') {
    values.sort((a, b) => {
      let val = 0;
      if (a.node.status.tier > b.node.status.tier) {
        val = 1;
      } else if (a.node.status.tier < b.node.status.tier) {
        val = -1;
      }
      return val;
    });
  } else if (sortProps.column.label === 'Tier' && sortProps.column.order === 'descending') {
    values.sort((a, b) => {
      let val = 0;
      if (a.node.status.tier < b.node.status.tier) {
        val = 1;
      } else if (a.node.status.tier > b.node.status.tier) {
        val = -1;
      }
      return val;
    });
  } else if (sortProps.column.label === 'Status' && sortProps.column.order === 'ascending') {
    values.sort((a, b) => {
      let val = 0;
      if (a.node.status.status > b.node.status.status) {
        val = 1;
      } else if (a.node.status.status < b.node.status.status) {
        val = -1;
      }
      return val;
    });
  } else if (sortProps.column.label === 'Status' && sortProps.column.order === 'descending') {
    values.sort((a, b) => {
      let val = 0;
      if (a.node.status.status < b.node.status.status) {
        val = 1;
      } else if (a.node.status.status > b.node.status.status) {
        val = -1;
      }
      return val;
    });
  } else if (sortProps.column.label === 'Payment Rank' && sortProps.column.order === 'ascending') {
    values.sort((a, b) => {
      let val = 0;
      if (a.node.status.rank > b.node.status.rank) {
        val = 1;
      } else if (a.node.status.rank < b.node.status.rank) {
        val = -1;
      }
      return val;
    });
  } else if (sortProps.column.label === 'Payment Rank' && sortProps.column.order === 'descending') {
    values.sort((a, b) => {
      let val = 0;
      if (a.node.status.rank < b.node.status.rank) {
        val = 1;
      } else if (a.node.status.rank > b.node.status.rank) {
        val = -1;
      }
      return val;
    });
  } else {
    tableData = JSON.parse(originalData);
  }
  return { datas: values, tableDatas: tableData };
};

const sortNodeAddressInfo = (values, sortProps, originalData) => {
  let tableData = [];
  if (sortProps.column.label === 'Zel ID' && sortProps.column.order === 'ascending') {
    values.sort((a, b) => {
      let val = 0;
      if (a.zelId > b.zelId) {
        val = 1;
      } else if (a.zelId < b.zelId) {
        val = -1;
      }
      return val;
    });
  } else if (sortProps.column.label === 'Zel ID' && sortProps.column.order === 'descending') {
    values.sort((a, b) => {
      let val = 0;
      if (a.zelId < b.zelId) {
        val = 1;
      } else if (a.zelId > b.zelId) {
        val = -1;
      }
      return val;
    });
  } else if (sortProps.column.label === 'Payment ID' && sortProps.column.order === 'ascending') {
    values.sort((a, b) => {
      let val = 0;
      if (a.paymentId > b.paymentId) {
        val = 1;
      } else if (a.paymentId < b.paymentId) {
        val = -1;
      }
      return val;
    });
  } else if (sortProps.column.label === 'Payment ID' && sortProps.column.order === 'descending') {
    values.sort((a, b) => {
      let val = 0;
      if (a.paymentId < b.paymentId) {
        val = 1;
      } else if (a.paymentId > b.paymentId) {
        val = -1;
      }
      return val;
    });
  } else if (sortProps.column.label === 'Organization' && sortProps.column.order === 'ascending') {
    values.sort((a, b) => {
      let val = 0;
      if (a.org > b.org) {
        val = 1;
      } else if (a.org < b.org) {
        val = -1;
      }
      return val;
    });
  } else if (sortProps.column.label === 'Organization' && sortProps.column.order === 'descending') {
    values.sort((a, b) => {
      let val = 0;
      if (a.org < b.org) {
        val = 1;
      } else if (a.org > b.org) {
        val = -1;
      }
      return val;
    });
  } else if (sortProps.column.label === 'Total Nodes' && sortProps.column.order === 'ascending') {
    values.sort((a, b) => {
      let val = 0;
      if (parseInt(a.totalNodes, 10) > parseInt(b.totalNodes, 10)) {
        val = 1;
      } else if (parseInt(a.totalNodes, 10) < parseInt(b.totalNodes, 10)) {
        val = -1;
      }
      return val;
    });
  } else if (sortProps.column.label === 'Total Nodes' && sortProps.column.order === 'descending') {
    values.sort((a, b) => {
      let val = 0;
      if (parseInt(a.totalNodes, 10) < parseInt(b.totalNodes, 10)) {
        val = 1;
      } else if (parseInt(a.totalNodes, 10) > parseInt(b.totalNodes, 10)) {
        val = -1;
      }
      return val;
    });
  } else {
    tableData = JSON.parse(originalData);
  }
  return { datas: values, tableDatas: tableData };
};

const sortNodeApp = (values, sortProps, originalData) => {
  let tableData = [];
  if (sortProps.column.label === 'IP Address' && sortProps.column.order === 'ascending') {
    values.sort((a, b) => {
      let val = 0;
      if (a.ip > b.ip) {
        val = 1;
      } else if (a.ip < b.ip) {
        val = -1;
      }
      return val;
    });
  } else if (sortProps.column.label === 'IP Address' && sortProps.column.order === 'descending') {
    values.sort((a, b) => {
      let val = 0;
      if (a.ip < b.ip) {
        val = 1;
      } else if (a.ip > b.ip) {
        val = -1;
      }
      return val;
    });
  } else if (sortProps.column.label === 'Total Application Running' && sortProps.column.order === 'ascending') {
    values.sort((a, b) => {
      let val = 0;
      if (a.apps.count > b.apps.count) {
        val = 1;
      } else if (a.apps.count < b.apps.count) {
        val = -1;
      }
      return val;
    });
  } else if (sortProps.column.label === 'Total Application Running' && sortProps.column.order === 'descending') {
    values.sort((a, b) => {
      let val = 0;
      if (a.apps.count < b.apps.count) {
        val = 1;
      } else if (a.apps.count > b.apps.count) {
        val = -1;
      }
      return val;
    });
  } else if (sortProps.column.label === 'Flux Watch Tower Installed' && sortProps.column.order === 'ascending') {
    values.sort((a, b) => {
      let val = 0;
      if (a.apps.fluxtower > b.apps.fluxtower) {
        val = 1;
      } else if (a.apps.fluxtower < b.apps.fluxtower) {
        val = -1;
      }
      return val;
    });
  } else if (sortProps.column.label === 'Flux Watch Tower Installed' && sortProps.column.order === 'descending') {
    values.sort((a, b) => {
      let val = 0;
      if (a.apps.fluxtower < b.apps.fluxtower) {
        val = 1;
      } else if (a.apps.fluxtower > b.apps.fluxtower) {
        val = -1;
      }
      return val;
    });
  } else if (sortProps.column.label === 'Flux Usage' && sortProps.column.order === 'ascending') {
    values.sort((a, b) => {
      let val = 0;
      if (a.apps.fluxusage > b.apps.fluxusage) {
        val = 1;
      } else if (a.apps.fluxusage < b.apps.fluxusage) {
        val = -1;
      }
      return val;
    });
  } else if (sortProps.column.label === 'Flux Usage' && sortProps.column.order === 'descending') {
    values.sort((a, b) => {
      let val = 0;
      if (a.apps.fluxusage < b.apps.fluxusage) {
        val = 1;
      } else if (a.apps.fluxusage > b.apps.fluxusage) {
        val = -1;
      }
      return val;
    });
  } else if (sortProps.column.label === 'CPU Locked' && sortProps.column.order === 'ascending') {
    values.sort((a, b) => {
      let val = 0;
      if (a.apps.resources.appsCpusLocked > b.apps.resources.appsCpusLocked) {
        val = 1;
      } else if (a.apps.resources.appsCpusLocked < b.apps.resources.appsCpusLocked) {
        val = -1;
      }
      return val;
    });
  } else if (sortProps.column.label === 'CPU Locked' && sortProps.column.order === 'descending') {
    values.sort((a, b) => {
      let val = 0;
      if (a.apps.resources.appsCpusLocked < b.apps.resources.appsCpusLocked) {
        val = 1;
      } else if (a.apps.resources.appsCpusLocked > b.apps.resources.appsCpusLocked) {
        val = -1;
      }
      return val;
    });
  } else if (sortProps.column.label === 'RAM Locked' && sortProps.column.order === 'ascending') {
    values.sort((a, b) => {
      let val = 0;
      if (a.apps.resources.appsRamLocked > b.apps.resources.appsRamLocked) {
        val = 1;
      } else if (a.apps.resources.appsRamLocked < b.apps.resources.appsRamLocked) {
        val = -1;
      }
      return val;
    });
  } else if (sortProps.column.label === 'RAM Locked' && sortProps.column.order === 'descending') {
    values.sort((a, b) => {
      let val = 0;
      if (a.apps.resources.appsRamLocked < b.apps.resources.appsRamLocked) {
        val = 1;
      } else if (a.apps.resources.appsRamLocked > b.apps.resources.appsRamLocked) {
        val = -1;
      }
      return val;
    });
  } else if (sortProps.column.label === 'HDD Locked' && sortProps.column.order === 'ascending') {
    values.sort((a, b) => {
      let val = 0;
      if (a.apps.resources.appsHddLocked > b.apps.resources.appsHddLocked) {
        val = 1;
      } else if (a.apps.resources.appsHddLocked < b.apps.resources.appsHddLocked) {
        val = -1;
      }
      return val;
    });
  } else if (sortProps.column.label === 'HDD Locked' && sortProps.column.order === 'descending') {
    values.sort((a, b) => {
      let val = 0;
      if (a.apps.resources.appsHddLocked < b.apps.resources.appsHddLocked) {
        val = 1;
      } else if (a.apps.resources.appsHddLocked > b.apps.resources.appsHddLocked) {
        val = -1;
      }
      return val;
    });
  } else {
    tableData = JSON.parse(originalData);
  }
  return { datas: values, tableDatas: tableData };
};

const sortNodeAppHash = (values, sortProps, originalData) => {
  let tableData = [];
  if (sortProps.column.label === 'IP Address' && sortProps.column.order === 'ascending') {
    values.sort((a, b) => {
      let val = 0;
      if (a.ip > b.ip) {
        val = 1;
      } else if (a.ip < b.ip) {
        val = -1;
      }
      return val;
    });
  } else if (sortProps.column.label === 'IP Address' && sortProps.column.order === 'descending') {
    values.sort((a, b) => {
      let val = 0;
      if (a.ip < b.ip) {
        val = 1;
      } else if (a.ip > b.ip) {
        val = -1;
      }
      return val;
    });
  } else if (sortProps.column.label === 'Scanned Height' && sortProps.column.order === 'ascending') {
    values.sort((a, b) => {
      let val = 0;
      if (a.scannedHeight > b.scannedHeight) {
        val = 1;
      } else if (a.scannedHeight < b.scannedHeight) {
        val = -1;
      }
      return val;
    });
  } else if (sortProps.column.label === 'Scanned Height' && sortProps.column.order === 'descending') {
    values.sort((a, b) => {
      let val = 0;
      if (a.scannedHeight < b.scannedHeight) {
        val = 1;
      } else if (a.scannedHeight > b.scannedHeight) {
        val = -1;
      }
      return val;
    });
  } else if (sortProps.column.label === 'Hashes Present' && sortProps.column.order === 'ascending') {
    values.sort((a, b) => {
      let val = 0;
      if (a.hashesPresent > b.hashesPresent) {
        val = 1;
      } else if (a.hashesPresent < b.hashesPresent) {
        val = -1;
      }
      return val;
    });
  } else if (sortProps.column.label === 'Hashes Present' && sortProps.column.order === 'descending') {
    values.sort((a, b) => {
      let val = 0;
      if (a.hashesPresent < b.hashesPresent) {
        val = 1;
      } else if (a.hashesPresent > b.hashesPresent) {
        val = -1;
      }
      return val;
    });
  } else if (sortProps.column.label === 'App Hashes Total' && sortProps.column.order === 'ascending') {
    values.sort((a, b) => {
      let val = 0;
      if (a.appsHashesTotal > b.appsHashesTotal) {
        val = 1;
      } else if (a.appsHashesTotal < b.appsHashesTotal) {
        val = -1;
      }
      return val;
    });
  } else if (sortProps.column.label === 'App Hashes Total' && sortProps.column.order === 'descending') {
    values.sort((a, b) => {
      let val = 0;
      if (a.appsHashesTotal < b.appsHashesTotal) {
        val = 1;
      } else if (a.appsHashesTotal > b.appsHashesTotal) {
        val = -1;
      }
      return val;
    });
  } else {
    tableData = JSON.parse(originalData);
  }
  return { datas: values, tableDatas: tableData };
};

const sortNodeBenchmark = (values, sortProps, originalData) => {
  let tableData = [];
  if (sortProps.column.label === 'IP Address' && sortProps.column.order === 'ascending') {
    values.sort((a, b) => {
      let val = 0;
      if (a.benchmark.bench.ipaddress > b.benchmark.bench.ipaddress) {
        val = 1;
      } else if (a.benchmark.bench.ipaddress < b.benchmark.bench.ipaddress) {
        val = -1;
      }
      return val;
    });
  } else if (sortProps.column.label === 'IP Address' && sortProps.column.order === 'descending') {
    values.sort((a, b) => {
      let val = 0;
      if (a.benchmark.bench.ipaddress < b.benchmark.bench.ipaddress) {
        val = 1;
      } else if (a.benchmark.bench.ipaddress > b.benchmark.bench.ipaddress) {
        val = -1;
      }
      return val;
    });
  } else if (sortProps.column.label === 'Download Speed' && sortProps.column.order === 'ascending') {
    values.sort((a, b) => {
      let val = 0;
      if (a.benchmark.bench.download_speed > b.benchmark.bench.download_speed) {
        val = 1;
      } else if (a.benchmark.bench.download_speed < b.benchmark.bench.download_speed) {
        val = -1;
      }
      return val;
    });
  } else if (sortProps.column.label === 'Download Speed' && sortProps.column.order === 'descending') {
    values.sort((a, b) => {
      let val = 0;
      if (a.benchmark.bench.download_speed < b.benchmark.bench.download_speed) {
        val = 1;
      } else if (a.benchmark.bench.download_speed > b.benchmark.bench.download_speed) {
        val = -1;
      }
      return val;
    });
  } else if (sortProps.column.label === 'Upload Speed' && sortProps.column.order === 'ascending') {
    values.sort((a, b) => {
      let val = 0;
      if (a.benchmark.bench.upload_speed > b.benchmark.bench.upload_speed) {
        val = 1;
      } else if (a.benchmark.bench.upload_speed < b.benchmark.bench.upload_speed) {
        val = -1;
      }
      return val;
    });
  } else if (sortProps.column.label === 'Upload Speed' && sortProps.column.order === 'descending') {
    values.sort((a, b) => {
      let val = 0;
      if (a.benchmark.bench.upload_speed < b.benchmark.bench.upload_speed) {
        val = 1;
      } else if (a.benchmark.bench.upload_speed > b.benchmark.bench.upload_speed) {
        val = -1;
      }
      return val;
    });
  } else if (sortProps.column.label === 'Ping' && sortProps.column.order === 'ascending') {
    values.sort((a, b) => {
      let val = 0;
      if (a.benchmark.bench.ping > b.benchmark.bench.ping) {
        val = 1;
      } else if (a.benchmark.bench.ping < b.benchmark.bench.ping) {
        val = -1;
      }
      return val;
    });
  } else if (sortProps.column.label === 'Ping' && sortProps.column.order === 'descending') {
    values.sort((a, b) => {
      let val = 0;
      if (a.benchmark.bench.ping < b.benchmark.bench.ping) {
        val = 1;
      } else if (a.benchmark.bench.ping > b.benchmark.bench.ping) {
        val = -1;
      }
      return val;
    });
  } else if (sortProps.column.label === 'Status' && sortProps.column.order === 'ascending') {
    values.sort((a, b) => {
      let val = 0;
      if (a.benchmark.status.status > b.benchmark.status.status) {
        val = 1;
      } else if (a.benchmark.status.status < b.benchmark.status.status) {
        val = -1;
      }
      return val;
    });
  } else if (sortProps.column.label === 'Status' && sortProps.column.order === 'descending') {
    values.sort((a, b) => {
      let val = 0;
      if (a.benchmark.status.status < b.benchmark.status.status) {
        val = 1;
      } else if (a.benchmark.status.status > b.benchmark.status.status) {
        val = -1;
      }
      return val;
    });
  } else if (sortProps.column.label === 'Total Application Running' && sortProps.column.order === 'ascending') {
    values.tableData.sort((a, b) => {
      let val = 0;
      if (a.apps.count > b.apps.count) {
        val = 1;
      } else if (a.apps.count < b.apps.count) {
        val = -1;
      }
      return val;
    });
  } else if (sortProps.column.label === 'Total Application Running' && sortProps.column.order === 'descending') {
    values.tableData.sort((a, b) => {
      let val = 0;
      if (a.apps.count < b.apps.count) {
        val = 1;
      } else if (a.apps.count > b.apps.count) {
        val = -1;
      }
      return val;
    });
  } else if (sortProps.column.label === 'Tier' && sortProps.column.order === 'ascending') {
    values.sort((a, b) => {
      let val = 0;
      if (a.node.status.tier > b.node.status.tier) {
        val = 1;
      } else if (a.node.status.tier < b.node.status.tier) {
        val = -1;
      }
      return val;
    });
  } else if (sortProps.column.label === 'Tier' && sortProps.column.order === 'descending') {
    values.sort((a, b) => {
      let val = 0;
      if (a.node.status.tier < b.node.status.tier) {
        val = 1;
      } else if (a.node.status.tier > b.node.status.tier) {
        val = -1;
      }
      return val;
    });
  } else if (sortProps.column.label === 'Organization' && sortProps.column.order === 'ascending') {
    values.sort((a, b) => {
      let val = 0;
      if (a.geolocation.org > b.geolocation.org) {
        val = 1;
      } else if (a.geolocation.org < b.geolocation.org) {
        val = -1;
      }
      return val;
    });
  } else if (sortProps.column.label === 'Organization' && sortProps.column.order === 'descending') {
    values.sort((a, b) => {
      let val = 0;
      if (a.geolocation.org < b.geolocation.org) {
        val = 1;
      } else if (a.geolocation.org > b.geolocation.org) {
        val = -1;
      }
      return val;
    });
  } else if (sortProps.column.label === 'Thunder Enabled' && sortProps.column.order === 'ascending') {
    values.sort((a, b) => {
      let val = 0;
      if (a.benchmark.bench.thunder > b.benchmark.bench.thunder) {
        val = 1;
      } else if (a.benchmark.bench.thunder < b.benchmark.bench.thunder) {
        val = -1;
      }
      return val;
    });
  } else if (sortProps.column.label === 'Thunder Enabled' && sortProps.column.order === 'descending') {
    values.sort((a, b) => {
      let val = 0;
      if (a.benchmark.bench.thunder < b.benchmark.bench.thunder) {
        val = 1;
      } else if (a.benchmark.bench.thunder > b.benchmark.bench.thunder) {
        val = -1;
      }
      return val;
    });
  } else if (sortProps.column.label === 'UPnP Enabled' && sortProps.column.order === 'ascending') {
    values.sort((a, b) => {
      let val = 0;
      if (a.benchmark.upnp > b.benchmark.upnp) {
        val = 1;
      } else if (a.benchmark.upnp < b.benchmark.upnp) {
        val = -1;
      }
      return val;
    });
  } else if (sortProps.column.label === 'UPnP Enabled' && sortProps.column.order === 'descending') {
    values.sort((a, b) => {
      let val = 0;
      if (a.benchmark.upnp < b.benchmark.upnp) {
        val = 1;
      } else if (a.benchmark.upnp > b.benchmark.upnp) {
        val = -1;
      }
      return val;
    });
  } else {
    tableData = JSON.parse(originalData);
  }
  return { datas: values, tableDatas: tableData };
};

const sortNodeConnection = (values, sortProps, originalData) => {
  let tableData = [];
  if (sortProps.column.label === 'IP Address' && sortProps.column.order === 'ascending') {
    values.sort((a, b) => {
      let val = 0;
      if (a.ip > b.ip) {
        val = 1;
      } else if (a.ip < b.ip) {
        val = -1;
      }
      return val;
    });
  } else if (sortProps.column.label === 'IP Address' && sortProps.column.order === 'descending') {
    values.sort((a, b) => {
      let val = 0;
      if (a.ip < b.ip) {
        val = 1;
      } else if (a.ip > b.ip) {
        val = -1;
      }
      return val;
    });
  } else if (sortProps.column.label === 'Total Incoming' && sortProps.column.order === 'ascending') {
    values.sort((a, b) => {
      let val = 0;
      if (a.in > b.in) {
        val = 1;
      } else if (a.in < b.in) {
        val = -1;
      }
      return val;
    });
  } else if (sortProps.column.label === 'Total Incoming' && sortProps.column.order === 'descending') {
    values.sort((a, b) => {
      let val = 0;
      if (a.in < b.in) {
        val = 1;
      } else if (a.in > b.in) {
        val = -1;
      }
      return val;
    });
  } else if (sortProps.column.label === 'Total Outgoing' && sortProps.column.order === 'ascending') {
    values.sort((a, b) => {
      let val = 0;
      if (a.out > b.out) {
        val = 1;
      } else if (a.out < b.out) {
        val = -1;
      }
      return val;
    });
  } else if (sortProps.column.label === 'Total Outgoing' && sortProps.column.order === 'descending') {
    values.sort((a, b) => {
      let val = 0;
      if (a.out < b.out) {
        val = 1;
      } else if (a.out > b.out) {
        val = -1;
      }
      return val;
    });
  } else {
    tableData = JSON.parse(originalData);
  }
  return { datas: values, tableDatas: tableData };
};

const sortNodeDaemon = (values, sortProps, originalData) => {
  let tableData = [];
  if (sortProps.column.label === 'IP Address' && sortProps.column.order === 'ascending') {
    values.sort((a, b) => {
      let val;
      if (a.ip > b.ip) {
        val = 1;
      } else if (a.ip < b.ip) {
        val = -1;
      } else {
        val = 0;
      }
      return val;
    });
  } else if (sortProps.column.label === 'IP Address' && sortProps.column.order === 'descending') {
    values.sort((a, b) => {
      let val = 0;
      if (a.ip < b.ip) {
        val = 1;
      } else if (a.ip > b.ip) {
        val = -1;
      }
      return val;
    });
  } else if (sortProps.column.label === 'Daemon Version' && sortProps.column.order === 'ascending') {
    values.sort((a, b) => {
      let val = 0;
      if (a.daemon.info.version > b.daemon.info.version) {
        val = 1;
      } else if (a.daemon.info.version < b.daemon.info.version) {
        val = -1;
      }
      return val;
    });
  } else if (sortProps.column.label === 'Daemon Version' && sortProps.column.order === 'descending') {
    values.sort((a, b) => {
      let val = 0;
      if (a.daemon.info.version < b.daemon.info.version) {
        val = 1;
      } else if (a.daemon.info.version > b.daemon.info.version) {
        val = -1;
      }
      return val;
    });
  } else if (sortProps.column.label === 'Benchmark Version' && sortProps.column.order === 'ascending') {
    values.sort((a, b) => {
      let val = 0;
      if (a.benchmark.info.version > b.benchmark.info.version) {
        val = 1;
      } else if (a.benchmark.info.version < b.benchmark.info.version) {
        val = -1;
      }
      return val;
    });
  } else if (sortProps.column.label === 'Benchmark Version' && sortProps.column.order === 'descending') {
    values.sort((a, b) => {
      let val = 0;
      if (a.benchmark.info.version < b.benchmark.info.version) {
        val = 1;
      } else if (a.benchmark.info.version > b.benchmark.info.version) {
        val = -1;
      }
      return val;
    });
  } else if (sortProps.column.label === 'Flux Version' && sortProps.column.order === 'ascending') {
    values.sort((a, b) => {
      let val = 0;
      if (a.flux.version > b.flux.version) {
        val = 1;
      } else if (a.flux.version < b.flux.version) {
        val = -1;
      }
      return val;
    });
  } else if (sortProps.column.label === 'Flux Version' && sortProps.column.order === 'descending') {
    values.sort((a, b) => {
      let val = 0;
      if (a.flux.version < b.flux.version) {
        val = 1;
      } else if (a.flux.version > b.flux.version) {
        val = -1;
      }
      return val;
    });
  } else {
    tableData = JSON.parse(originalData);
  }
  return { datas: values, tableDatas: tableData };
};

const sortNodeLocation = (values, sortProps, originalData) => {
  let tableData = [];
  if (sortProps.column.label === 'IP Address' && sortProps.column.order === 'ascending') {
    values.sort((a, b) => {
      let val = 0;
      if (a.geolocation.ip > b.geolocation.ip) {
        val = 1;
      } else if (a.geolocation.ip < b.geolocation.ip) {
        val = -1;
      }
      return val;
    });
  } else if (sortProps.column.label === 'IP Address' && sortProps.column.order === 'descending') {
    values.sort((a, b) => {
      let val = 0;
      if (a.geolocation.ip < b.geolocation.ip) {
        val = 1;
      } else if (a.geolocation.ip > b.geolocation.ip) {
        val = -1;
      }
      return val;
    });
  } else if (sortProps.column.label === 'Country' && sortProps.column.order === 'ascending') {
    values.sort((a, b) => {
      let val = 0;
      if (a.geolocation.country > b.geolocation.country) {
        val = 1;
      } else if (a.geolocation.country < b.geolocation.country) {
        val = -1;
      }
      return val;
    });
  } else if (sortProps.column.label === 'Country' && sortProps.column.order === 'descending') {
    values.sort((a, b) => {
      let val = 0;
      if (a.geolocation.country < b.geolocation.country) {
        val = 1;
      } else if (a.geolocation.country > b.geolocation.country) {
        val = -1;
      }
      return val;
    });
  } else if (sortProps.column.label === 'Country Code' && sortProps.column.order === 'ascending') {
    values.sort((a, b) => {
      let val = 0;
      if (a.geolocation.countryCode > b.geolocation.countryCode) {
        val = 1;
      } else if (a.geolocation.countryCode < b.geolocation.countryCode) {
        val = -1;
      }
      return val;
    });
  } else if (sortProps.column.label === 'Country Code' && sortProps.column.order === 'descending') {
    values.sort((a, b) => {
      let val = 0;
      if (a.geolocation.countryCode < b.geolocation.countryCode) {
        val = 1;
      } else if (a.geolocation.countryCode > b.geolocation.countryCode) {
        val = -1;
      }
      return val;
    });
  } else if (sortProps.column.label === 'Region' && sortProps.column.order === 'ascending') {
    values.sort((a, b) => {
      let val = 0;
      if (a.geolocation.region > b.geolocation.region) {
        val = 1;
      } else if (a.geolocation.region < b.geolocation.region) {
        val = -1;
      }
      return val;
    });
  } else if (sortProps.column.label === 'Region' && sortProps.column.order === 'descending') {
    values.sort((a, b) => {
      let val = 0;
      if (a.geolocation.region < b.geolocation.region) {
        val = 1;
      } else if (a.geolocation.region > b.geolocation.region) {
        val = -1;
      }
      return val;
    });
  } else if (sortProps.column.label === 'Region Name' && sortProps.column.order === 'ascending') {
    values.sort((a, b) => {
      let val = 0;
      if (a.geolocation.regionName > b.geolocation.regionName) {
        val = 1;
      } else if (a.geolocation.regionName < b.geolocation.regionName) {
        val = -1;
      }
      return val;
    });
  } else if (sortProps.column.label === 'Region Name' && sortProps.column.order === 'descending') {
    values.sort((a, b) => {
      let val = 0;
      if (a.geolocation.regionName < b.geolocation.regionName) {
        val = 1;
      } else if (a.geolocation.regionName > b.geolocation.regionName) {
        val = -1;
      }
      return val;
    });
  } else if (sortProps.column.label === 'Latitude' && sortProps.column.order === 'ascending') {
    values.sort((a, b) => {
      let val = 0;
      if (a.geolocation.lat > b.geolocation.lat) {
        val = 1;
      } else if (a.geolocation.lat < b.geolocation.lat) {
        val = -1;
      }
      return val;
    });
  } else if (sortProps.column.label === 'Latitude' && sortProps.column.order === 'descending') {
    values.sort((a, b) => {
      let val = 0;
      if (a.geolocation.lat < b.geolocation.lat) {
        val = 1;
      } else if (a.geolocation.lat > b.geolocation.lat) {
        val = -1;
      }
      return val;
    });
  } else if (sortProps.column.label === 'Longitude' && sortProps.column.order === 'ascending') {
    values.sort((a, b) => {
      let val = 0;
      if (a.geolocation.lon > b.geolocation.lon) {
        val = 1;
      } else if (a.geolocation.lon < b.geolocation.lon) {
        val = -1;
      }
      return val;
    });
  } else if (sortProps.column.label === 'Longitude' && sortProps.column.order === 'descending') {
    values.sort((a, b) => {
      let val = 0;
      if (a.geolocation.lon < b.geolocation.lon) {
        val = 1;
      } else if (a.geolocation.lon > b.geolocation.lon) {
        val = -1;
      }
      return val;
    });
  } else if (sortProps.column.label === 'Organization' && sortProps.column.order === 'ascending') {
    values.sort((a, b) => {
      let val = 0;
      if (a.geolocation.org > b.geolocation.org) {
        val = 1;
      } else if (a.geolocation.org < b.geolocation.org) {
        val = -1;
      }
      return val;
    });
  } else if (sortProps.column.label === 'Organization' && sortProps.column.order === 'descending') {
    values.sort((a, b) => {
      let val = 0;
      if (a.geolocation.org < b.geolocation.org) {
        val = 1;
      } else if (a.geolocation.org > b.geolocation.org) {
        val = -1;
      }
      return val;
    });
  } else if (sortProps.column.label === 'Tier' && sortProps.column.order === 'ascending') {
    values.sort((a, b) => {
      let val = 0;
      if (a.node.status.tier > b.node.status.tier) {
        val = 1;
      } else if (a.node.status.tier < b.node.status.tier) {
        val = -1;
      }
      return val;
    });
  } else if (sortProps.column.label === 'Tier' && sortProps.column.order === 'descending') {
    values.sort((a, b) => {
      let val = 0;
      if (a.node.status.tier < b.node.status.tier) {
        val = 1;
      } else if (a.node.status.tier > b.node.status.tier) {
        val = -1;
      }
      return val;
    });
  } else {
    tableData = JSON.parse(originalData);
  }
  return { datas: values, tableDatas: tableData };
};

const sortNodeUptime = (values, sortProps, originalData) => {
  let tableData = [];
  if (sortProps.column.label === 'IP Address' && sortProps.column.order === 'ascending') {
    values.sort((a, b) => {
      let val = 0;
      if (a.ip > b.ip) {
        val = 1;
      } else if (a.ip < b.ip) {
        val = -1;
      }
      return val;
    });
  } else if (sortProps.column.label === 'IP Address' && sortProps.column.order === 'descending') {
    values.sort((a, b) => {
      let val = 0;
      if (a.ip < b.ip) {
        val = 1;
      } else if (a.ip > b.ip) {
        val = -1;
      }
      return val;
    });
  } else if (sortProps.column.label === 'Active Since' && sortProps.column.order === 'ascending') {
    values.sort((a, b) => {
      let val = 0;
      if (a.activeSince > b.activeSince) {
        val = 1;
      } else if (a.activeSince < b.activeSince) {
        val = -1;
      }
      return val;
    });
  } else if (sortProps.column.label === 'Active Since' && sortProps.column.order === 'descending') {
    values.sort((a, b) => {
      let val = 0;
      if (a.activeSince < b.activeSince) {
        val = 1;
      } else if (a.activeSince > b.activeSince) {
        val = -1;
      }
      return val;
    });
  } else if (sortProps.column.label === 'Active Since Converted' && sortProps.column.order === 'ascending') {
    values.sort((a, b) => {
      let val = 0;
      if (new Date(a.activeSinceConverted).getTime() > new Date(b.activeSinceConverted).getTime()) {
        val = 1;
      } else if (new Date(a.activeSinceConverted).getTime() < new Date(b.activeSinceConverted).getTime()) {
        val = -1;
      }
      return val;
    });
  } else if (sortProps.column.label === 'Active Since Converted' && sortProps.column.order === 'descending') {
    values.sort((a, b) => {
      let val = 0;
      if (new Date(a.activeSinceConverted).getTime() < new Date(b.activeSinceConverted).getTime()) {
        val = 1;
      } else if (new Date(a.activeSinceConverted).getTime() > new Date(b.activeSinceConverted).getTime()) {
        val = -1;
      }
      return val;
    });
  } else if (sortProps.column.label === 'Data Collected At' && sortProps.column.order === 'ascending') {
    values.sort((a, b) => {
      let val = 0;
      if (a.dataCollectedAt > b.dataCollectedAt) {
        val = 1;
      } else if (a.dataCollectedAt < b.dataCollectedAt) {
        val = -1;
      }
      return val;
    });
  } else if (sortProps.column.label === 'Data Collected At' && sortProps.column.order === 'descending') {
    values.sort((a, b) => {
      let val = 0;
      if (a.dataCollectedAt < b.dataCollectedAt) {
        val = 1;
      } else if (a.dataCollectedAt > b.dataCollectedAt) {
        val = -1;
      }
      return val;
    });
  } else if (sortProps.column.label === 'Data Collected At Converted' && sortProps.column.order === 'ascending') {
    values.sort((a, b) => {
      let val = 0;
      if (new Date(a.dataCollectedAtConverted).getTime() > new Date(b.dataCollectedAtConverted).getTime()) {
        val = 1;
      } else if (new Date(a.dataCollectedAtConverted).getTime() < new Date(b.dataCollectedAtConverted).getTime()) {
        val = -1;
      }
      return val;
    });
  } else if (sortProps.column.label === 'Data Collected At Converted' && sortProps.column.order === 'descending') {
    values.sort((a, b) => {
      let val = 0;
      if (new Date(a.dataCollectedAtConverted).getTime() < new Date(b.dataCollectedAtConverted).getTime()) {
        val = 1;
      } else if (new Date(a.dataCollectedAtConverted).getTime() > new Date(b.dataCollectedAtConverted).getTime()) {
        val = -1;
      }
      return val;
    });
  } else {
    tableData = JSON.parse(originalData);
  }
  return { datas: values, tableDatas: tableData };
};

const sortMarketplace = (values, sortProps, originalData) => {
  let tableData = [];
  if (sortProps.column.label === 'Name' && sortProps.column.order === 'ascending') {
    values.sort((a, b) => {
      let val = 0;
      if (a.name > b.name) {
        val = 1;
      } else if (a.name < b.name) {
        val = -1;
      }
      return val;
    });
  } else if (sortProps.column.label === 'Name' && sortProps.column.order === 'descending') {
    values.sort((a, b) => {
      let val = 0;
      if (a.name < b.name) {
        val = 1;
      } else if (a.name > b.name) {
        val = -1;
      }
      return val;
    });
  } else if (sortProps.column.label === 'Description' && sortProps.column.order === 'ascending') {
    values.sort((a, b) => {
      let val = 0;
      if (a.description > b.description) {
        val = 1;
      } else if (a.description < b.description) {
        val = -1;
      }
      return val;
    });
  } else if (sortProps.column.label === 'Description' && sortProps.column.order === 'descending') {
    values.sort((a, b) => {
      let val = 0;
      if (a.description < b.description) {
        val = 1;
      } else if (a.description > b.description) {
        val = -1;
      }
      return val;
    });
  } else if (sortProps.column.label === 'Category' && sortProps.column.order === 'ascending') {
    values.sort((a, b) => {
      let val = 0;
      if (a.category > b.category) {
        val = 1;
      } else if (a.category < b.category) {
        val = -1;
      }
      return val;
    });
  } else if (sortProps.column.label === 'Category' && sortProps.column.order === 'descending') {
    values.sort((a, b) => {
      let val = 0;
      if (a.category < b.category) {
        val = 1;
      } else if (a.category > b.category) {
        val = -1;
      }
      return val;
    });
  } else if (sortProps.column.label === 'Price' && sortProps.column.order === 'ascending') {
    values.sort((a, b) => {
      let val = 0;
      if (a.price > b.price) {
        val = 1;
      } else if (a.price < b.price) {
        val = -1;
      }
      return val;
    });
  } else if (sortProps.column.label === 'Price' && sortProps.column.order === 'descending') {
    values.sort((a, b) => {
      let val = 0;
      if (a.price < b.price) {
        val = 1;
      } else if (a.price > b.price) {
        val = -1;
      }
      return val;
    });
  } else if (sortProps.column.label === 'Visible' && sortProps.column.order === 'ascending') {
    values.sort((a, b) => {
      let val = 0;
      if (a.visible > b.visible) {
        val = 1;
      } else if (a.visible < b.visible) {
        val = -1;
      }
      return val;
    });
  } else if (sortProps.column.label === 'Visible' && sortProps.column.order === 'descending') {
    values.sort((a, b) => {
      let val = 0;
      if (a.visible < b.visible) {
        val = 1;
      } else if (a.visible > b.visible) {
        val = -1;
      }
      return val;
    });
  } else if (sortProps.column.label === 'Enabled' && sortProps.column.order === 'ascending') {
    values.sort((a, b) => {
      let val = 0;
      if (a.enabled > b.enabled) {
        val = 1;
      } else if (a.enabled < b.enabled) {
        val = -1;
      }
      return val;
    });
  } else if (sortProps.column.label === 'Enabled' && sortProps.column.order === 'descending') {
    values.sort((a, b) => {
      let val = 0;
      if (a.enabled < b.enabled) {
        val = 1;
      } else if (a.enabled > b.enabled) {
        val = -1;
      }
      return val;
    });
  } else {
    tableData = JSON.parse(originalData);
  }
  return { datas: values, tableDatas: tableData };
};

module.exports = {
  sortHistoryInfo,
  sortNode,
  sortNodeAddressInfo,
  sortNodeApp,
  sortNodeAppHash,
  sortNodeBenchmark,
  sortNodeConnection,
  sortNodeDaemon,
  sortNodeLocation,
  sortNodeUptime,
  sortMarketplace,
};
