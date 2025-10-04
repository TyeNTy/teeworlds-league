const { enumMapsWithLabel } = require("../enums/enumMaps");

const detectMapFromServer = (mapString) => {
  const mapName = mapString.split("/").pop();
  const foundMap = enumMapsWithLabel.find((map) => map.label === mapName);
  return foundMap ? foundMap.value : null;
};

module.exports = { detectMapFromServer };
