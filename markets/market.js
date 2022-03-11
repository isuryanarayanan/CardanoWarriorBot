const jpgEngine = require("./jpg.js");
const cnftEngine = require("./cnft.js");

async function findFloor(options) {
  var jpg_assets = await jpgEngine.floor(options);
	var cnft_assets = await cnftEngine.floor(options);
	console.log(jpg_assets.length+"-"+cnft_assets.length)
  return [];
}

module.exports = { findFloor };
