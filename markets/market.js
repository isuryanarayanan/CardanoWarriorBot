const jpgEngine = require("./jpg.js");
const cnftEngine = require("./cnft.js");

async function findFloor(options) {
	var jpg_assets = await jpgEngine.floor(options);
  var cnft_assets = await cnftEngine.floor(options);
  console.log(jpg_assets);
  console.log(cnft_assets);
  return [];
}

module.exports = { findFloor };
