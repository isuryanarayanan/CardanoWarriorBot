/*
 *
 * jpg.store market engine
 *
 * API endpoint: https://jpg.store/api/policy/8f80ebfaf62a8c33ae2adf047572604c74db8bc1daba2b43f9a65635/listings/
 *               config.endpoints.jpgListings
 *
 * API architecture: The cnft api is straight forward, jus use this endpoint to
 * get all the listings. Plain and simple.
 *
 * Engine architecture: The JPGEngine is the main method exported, it can handle
 * the scraping, searching and formatting the data from the jpg.store api.
 *
 * Available methods include:
 * - JPGEngine.crawl
 * - JPGEngine.floor(options)
 */

const XMLHttpRequest = require("xhr2");
const config = require("../config.json");
const rarities_json = require("../rarities.json");
const { arrayRemove } = require("../services/misc.js");
const project_id = process.env["BLOCKFROST_PROJECT_ID"];
const item_classes = rarities_json.item_classes;
const warrior_rarities = rarities_json.warrior_rarity;
const warrior_classes = rarities_json.warrior_classes;

function crawl() {
  // Crawls jpg.store marketplace with filters passed in

  let xhr = new XMLHttpRequest();
  let promise = new Promise((resolve, reject) => {
    xhr.open("GET", config.endpoints.jpgListings);
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.onload = () => {
      resolve(xhr);
    };
    xhr.onerror = () => {
      reject(xhr);
    };
    xhr.send();
  });

  return promise;
}

function crawlAsset(asset) {
  // Crawls jpg.store asset

  let xhr = new XMLHttpRequest();
  let promise = new Promise((resolve, reject) => {
    xhr.open("GET", config.endpoints.jpgAssets + asset);
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.onload = () => {
      resolve(xhr);
    };
    xhr.onerror = () => {
      reject(xhr);
    };
    xhr.send();
  });

  return promise;
}

function constraintCheck(asset, constraints) {
  // Checks if the query constraints
  // will pass for a warrior metadata

  let test_items_number = true;
  let test_items_query = true;
  let test_warrior_class = true;
  let test_warrior_rarity = true;

  constraints.forEach((test) => {
    if (test.name == "warrior_rarity") {
      test_warrior_rarity = asset["onchain_metadata"].rarity == test.value;
    }
    if (test.name == "warrior_class") {
      test_warrior_class =
        asset["onchain_metadata"].type.toLowerCase() == test.value;
    }
    if (test.name == "items_number") {
      test_items_number = asset["onchain_metadata"].items.length == test.value;
    }
    if (test.name == "items_query") {
      test.value.forEach((query) => {
        if (
          !asset["onchain_metadata"].items.filter(
            (e) => e.name.toLowerCase() === query
          ).length > 0
        ) {
          test_items_query = false;
        }
      });
    }
  });

  // All tests should pass for to be in floor
  return (
    test_items_query &&
    test_items_number &&
    test_warrior_class &&
    test_warrior_rarity
  );
}

async function floor(op = undefined) {
  let listings = [];
  let assets = [];

  await crawl().then(async (data) => {
    listings = JSON.parse(data.response);
  });

  listings.sort((a, b) => (a.price_lovelace > b.price_lovelace ? 1 : -1));

  for (let i = 0; i < listings.length; i++) {
    await crawlAsset(listings[i].asset)
      .then((data) => {
        var asset = JSON.parse(data.response);
        if (
          constraintCheck(asset, op) &&
          assets.length <= config.chart.floor_cap
        ) {
          assets.push({
            price: parseInt(asset.price_lovelace),
            asset: asset.onchain_metadata,
            market: asset,
						market_name:"jpg"
          });
        }
      })
      .catch((e) => {
				console.log(e);
      });
  }

  return assets;
}

module.exports = { crawl, floor };
