const XMLHttpRequest = require("xhr2");
const { arrayRemove } = require("./misc.js");
const { chartBuilder } = require("./chart.js");
const rarities_json = require("../rarities.json");
const project_id = process.env["BLOCKFROST_PROJECT_ID"];
const warrior_classes = rarities_json.warrior_classes;
const item_classes = rarities_json.item_classes;
const warrior_rarities = rarities_json.warrior_rarity;

const config = {
  floor_cap: 9,
  floor_chart_height: 500,
  floor_chart_width: 1000,
};
const endpoints = {
  cnftListings: "https://api.cnft.io/market/listings/",
};

function crawlCNFT(filters) {
  // Crawls CNFT.io marketplace
  // takes in a page number and returns a promise containing
  // cnft.io market listings for cardanowarriors on that page

  let xhr = new XMLHttpRequest();
  let promise = new Promise((resolve, reject) => {
    xhr.open("POST", endpoints.cnftListings);
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
      test_warrior_rarity = asset.metadata.rarity == test.value;
    }
    if (test.name == "warrior_class") {
      test_warrior_class = asset.metadata.type.toLowerCase() == test.value;
    }
    if (test.name == "items_number") {
      test_items_number = asset.metadata.items.length == test.value;
    }
    if (test.name == "items_query") {
      test.value.forEach((query) => {
        if (
          !asset.metadata.items.filter((e) => e.name.toLowerCase() === query)
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
  // Checks if the query constraints

  let floor_warriors = [];
  let cnft_page = 1;
  let cnft_page_limit = 0;
  let cnft_page_limit_hit = false;

  // loop until the floor list fills up or the page limit is hit
  while (floor_warriors.length <= config.floor_cap && !cnft_page_limit_hit) {
    await crawlCNFT({ page: cnft_page }).then(async (data) => {
      var response = JSON.parse(data.response);

      if (response.results.length == 0) {
        cnft_page_limit_hit = true;
        return;
      }

      await response.results.forEach((e) => {
        if (
          constraintCheck(e.asset, op) &&
          floor_warriors.length <= config.floor_cap
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
