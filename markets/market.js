const jpgEngine = require("./jpg.js");
const cnftEngine = require("./cnft.js");

async function findFloor(options) {
  var assets = [];
  var jpg_assets = await jpgEngine.floor(options);
  var cnft_assets = await cnftEngine.floor(options);

  assets = assets.concat(jpg_assets);
  assets = assets.concat(cnft_assets);
  assets.sort((a, b) => (a.price > b.price ? 1 : -1));
	return assets.slice(0,10);
}

module.exports = { findFloor };
