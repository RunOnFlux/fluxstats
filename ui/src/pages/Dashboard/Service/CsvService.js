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

module.exports = {
  Download,
};
