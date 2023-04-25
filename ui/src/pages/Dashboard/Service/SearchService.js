const generateSearch = (Fuse, tableData, values) => new Fuse(tableData, { useExtendedSearch: true, keys: values });

const search = (fuseSearch, searchQuery) => {
  const temp = [];
  const result = fuseSearch.search(`=${searchQuery}`);
  for (let i = 0; i < Object.keys(result).length; i += 1) {
    temp.push(result[i].item);
  }
  return temp;
};

module.exports = {
  generateSearch,
  search,
};
