const Download = async (data, values, module, ExportToCsv) => {
  const date = new Date();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const year = date.getFullYear();
  const options = {
    filename: `${module}_${month}${day}${year}`,
    fieldSeparator: ',',
    quoteStrings: '"',
    decimalSeparator: '.',
    showLabels: true,
    showTitle: true,
    title: `${module} - ${month}/${day}/${year}`,
    useTextFile: false,
    useBom: true,
    headers: values,
  };
  const csvExporter = new ExportToCsv(options);
  csvExporter.generateCsv(data);
};

const HistoryInfoHeaders = [
  'Round Time',
  'Round Time Converted',
  'Total Nodes',
  'Cumulus',
  'Nimbus',
  'Stratus',
];

const NodeHeaders = [
  'IP Address',
  'Network Protocol',
  'Tier',
  'Status',
  'Payment Rank',
  'Collateral',
  'Txn Hash',
  'Added Height',
  'Out Idx',
  'Confirmed Height',
  'Last Confirmed Height',
  'Last Paid Height',
  'Payment Address',
  'Pub Key',
  'Zel ID',
  'Active Since',
  'Active Since Converted',
  'Last Paid',
  'Last Paid Converted',
  'Amount',
  'Crux ID',
  'DOS State',
  'DOS Message',
];

const NodeAddressInfoHeaders = [
  'Zel ID',
  'Payment ID',
  'Organization',
  'Total Nodes',
  'Total Cumulus',
  'Total Nimbus',
  'Total Stratus',
];

const NodeAppHeaders = [
  'IP Address',
  'Total Application Running',
  'Flux Tower Installed',
  'Flux Usage',
  'CPU Locked',
  'RAM Locked',
  'HDD Locked',
  'Running Apps',
];

const NodeAppHashHeaders = [
  'IP Address',
  'Scanned Height',
  'Hashes Present',
  'App Hashes Total',
];

const NodeBenchmarkHeaders = [
  'IP Address',
  'Organization',
  'Tier',
  'Download Speed',
  'Upload Speed',
  'Ping',
  'Status',
  'UPnP Enabled',
  'Total Application Running',
  'RPC Port',
  'Benchmarking',
  'Flux',
  'Architecture',
  'Arm Board',
  'Time',
  'Converted Time',
  'Real Cores',
  'Cores',
  'RAM',
  'SSD',
  'HDD',
  'Total Storage',
  'Disk',
  'Disk Size',
  'Disk Write Speed',
  'EPS',
  'Thunder',
  'Errors',
  'Needed To Fix Issues',
];

const NodeConnectionHeaders = [
  'IP Address',
  'Total Connection In',
  'Total Connection Out',
];

const NodeDaemonHeaders = [
  'IP Address',
  'Daemon Version',
  'Flux Version',
  'Benchmark Version',
  'Bench Version',
  'Bench Speed Version',
  'Protocol Version',
  'Wallet Version',
  'Blocks',
  'Time Offset',
  'Connections',
  'Proxy',
  'Difficulty',
  'Testnet',
  'Key Pool Old Test',
  'Key Pool Size',
  'Pay Txn Fee',
  'Relay Fee',
  'Errors',
];

const NodeLocationHeaders = [
  'IP Address',
  'Country',
  'Country Code',
  'Region',
  'Region Name',
  'Latitude',
  'Longitude',
  'Tier',
];

const NodeUptimeHeaders = [
  'IP Address',
  'Tier',
  'Active Since',
  'Active Since Converted',
  'Data Collected At',
  'Data Collected At Converted',
];

const MarketplaceHeaders = [
  'Name',
  'Description',
  'Price',
  'Multipliers',
  'Category',
  'Version',
  'Instances',
  'CPU',
  'RAM',
  'HDD',
  'Visible',
  'Enabled',
  'Container Ports',
  'Port Specs',
  'Ports',
];

module.exports = {
  Download,
  HistoryInfoHeaders,
  NodeHeaders,
  NodeAddressInfoHeaders,
  NodeAppHeaders,
  NodeAppHashHeaders,
  NodeBenchmarkHeaders,
  NodeConnectionHeaders,
  NodeDaemonHeaders,
  NodeLocationHeaders,
  NodeUptimeHeaders,
  MarketplaceHeaders,
};
