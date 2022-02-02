/*
 *
 * This module handles work that involves cnft.io API's
 *
 * There are two main function that is being exported from this module,
 *
 * - crawlCNFT
 *
 *   this function uses the cnft.io API to make a query and return
 *   the result as a promise. On resolving the returned promise
 *   the information returned from the API is shown.
 *
 * - findFloor
 *
 *   This function will recursively use the crawlCNFT function and looks for
 *   listings that matches the constraints that are passed.
 *
 *
 */
const { arrayRemove } = require("./misc.js");
const { chartBuilder } = require("./chart.js");
const XMLHttpRequest = require("xhr2");

// Loading rarity information and other system variables
const rarities_json = require("../rarities.json");
const warrior_classes = rarities_json.warrior_classes;
const item_classes = rarities_json.item_classes;
const warrior_rarities = rarities_json.warrior_rarity;
const project_id = process.env["BLOCKFROST_PROJECT_ID"];
const config = require("../config.json");

function crawlCNFT(filters) {
  // Crawls CNFT.io marketplace with filters passed in

  let xhr = new XMLHttpRequest();
  let promise = new Promise((resolve, reject) => {
    xhr.open("POST", config.endpoints.cnftListings);
    var params = {
      types: ["offer", "listing"],
      project: "Cardano Warriors",
      sort: { price: 1 },
      priceMin: 0,
      priceMax: null,
      page: filters.page,
      verified: true,
      nsfw: false,
      sold: false,
    };
    if (filters.search) {
      params.search = "CardanoWarrior" + filters.search;
    }

    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.onload = () => {
      resolve(xhr);
    };
    xhr.onerror = () => {
      reject(xhr);
    };

    xhr.send(JSON.stringify(params));
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
      test_warrior_rarity = asset[0].metadata.rarity == test.value;
    }
    if (test.name == "warrior_class") {
      test_warrior_class = asset[0].metadata.type.toLowerCase() == test.value;
    }
    if (test.name == "items_number") {
      test_items_number = asset[0].metadata.items.length == test.value;
    }
    if (test.name == "items_query") {
      test.value.forEach((query) => {
        if (
					!asset[0].metadata.items.filter((e) => e.name.toLowerCase() === query)
            .length > 0
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

async function findFloor(op = undefined) {
  let floor_warriors = [];
  let cnft_page = 1;
  let cnft_page_limit = 0;
  let cnft_page_limit_hit = false;

  // loop until the floor list fills up or the page limit is hit
  while (
    floor_warriors.length <= config.chart.floor_cap &&
    !cnft_page_limit_hit
  ) {
    await crawlCNFT({ page: cnft_page }).then(async (data) => {
      var response = JSON.parse(data.response);

      if (response.results.length == 0) {
        cnft_page_limit_hit = true;
        return;
      }

      await response.results.forEach((e) => {
        if (
					constraintCheck(e.assets, op) &&
          floor_warriors.length <= config.chart.floor_cap
        ) {
          //If rarity matches query then add them to the chart
          floor_warriors.push(e);
        }
      });
    });
    cnft_page++;
  }
  return floor_warriors;
}

module.exports = { crawlCNFT, findFloor };
