/* Imports */
const { SlashCommandBuilder } = require("@discordjs/builders");
const { MessageEmbed, MessageAttachment } = require("discord.js");
const { CanvasRenderService } = require("chartjs-node-canvas");
const rarities_json = require("./rarities.json");
const project_id = process.env["project_id"];
/* Imports */

/* Setup and essential variables */
const XMLHttpRequest = require("xhr2");
const warrior_classes = rarities_json.warrior_classes;
const item_classes = rarities_json.item_classes;
const warrior_rarities = rarities_json.warrior_rarity;

const endpoints = {
  cnftListings: "https://api.cnft.io/market/listings/",
};
const config = {
  floor_cap: 9,
  floor_chart_height: 500,
  floor_chart_width: 1000,
};

const chartCallback = (ChartJS) => {
  ChartJS.plugins.register({
    beforeDraw: (chartInstance) => {
      const { chart } = chartInstance;
      const { ctx } = chart;
      ctx.fillStyle = "black";
      ctx.fillRect(0, 0, chart.width, chart.height);
    },
  });
};
/* Setup and essential variables */

function arrayRemove(arr, value) {
  // Removes value from array arr
	
  return arr.filter(function (ele) {
    return ele != value;
  });
}

function crawlCNFT(page) {
	// Crawls CNFT.io marketplace
	// takes in a page number and returns a promise containing 
	// cnft.io market listings for cardanowarriors on that page
	
  let xhr = new XMLHttpRequest();
  let promise = new Promise((resolve, reject) => {
    xhr.open("POST", endpoints.cnftListings);
    var params =
      "search=" +
      "&sort=price" +
      "&order=asc" +
      "&page=" +
      page +
      "&verified=true" +
      "&project=Cardano+Warriors";
    xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    xhr.onload = () => {
      resolve(xhr);
    };
    xhr.onerror = () => {
      reject(xhr);
    };

    xhr.send(params);
  });
  return promise;
}

async function chartBuilder(warriors) {
	// Builds a bar chart with an array of 
	// market listings from cnft.io 
	
  let chart_price = [];
  let chart_listing = [];

  warriors.forEach((asset) => {
		// parses price data and listing data
    chart_price.push(asset.price / 1000000);
    chart_listing.push(
      asset.metadata.tags[1].type + "\n#" + asset.metadata.tags[0].id
    );
  });

  const canvas = new CanvasRenderService(
    config.floor_chart_width,
    config.floor_chart_height,
    chartCallback
  );
  const configuration = {
    type: "bar",
    data: {
      labels: chart_listing,
      datasets: [
        {
          label: "Floor Cardano Warriors",
          data: chart_price,
          backgroundColor: "#7289d9",
        },
      ],
    },

    options: {
      layout: {
        padding: {
          left: 0,
          right: 0,
          top: 0,
          bottom: 30,
        },
      },
      scales: {
        xAxes: [
          {
            gridLines: { color: "#666666", zeroLineColor: "#666666" },
            ticks: {
              display: "top",
              fontSize: 15,
            },
          },
        ],
        yAxes: [
          {
            gridLines: { color: "#666666", zeroLineColor: "#666666" },
            scaleLabel: {
              display: true,
              labelString: "Price in ADA",
            },
            ticks: {
              fontSize: 20,
            },
          },
        ],
      },
    },
  };
  const image = await canvas.renderToBuffer(configuration);
  const attatchment = new MessageAttachment(image);

  return { floor_price: chart_price[0], attatchment: attatchment };
}

function constraintCheck(metadata, constraints) {
	// Checks if the query constraints 
	// will pass for a warrior metadata
	
  let test_items_number = true;
  let test_items_query = true;
  let test_warrior_class = true;
  let test_warrior_rarity = true;

  constraints.forEach((test) => {
    if (test.name == "warrior_rarity") {
      test_warrior_rarity = metadata.tags[3].rarity == test.value;
    }
    if (test.name == "warrior_class") {
      test_warrior_class = metadata.tags[1].type.toLowerCase() == test.value;
    }
    if (test.name == "items_number") {
      test_items_number = metadata.tags[2].items.length == test.value;
    }
    if (test.name == "items_query") {
      test.value.forEach((query) => {
        if (
          !metadata.tags[2].items.filter((e) => e.name.toLowerCase() === query)
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
	// Finds floor for the options passed
	
  let floor_warriors = [];
  let cnft_page = 1;
  let cnft_page_limit = 0;
  let cnft_page_limit_hit = false;

  // loop until the floor list fills up or the page limit is hit
  while (floor_warriors.length <= config.floor_cap && !cnft_page_limit_hit) {
    await crawlCNFT(cnft_page).then(async (data) => {
      var response = JSON.parse(data.response);
      cnft_page_limit = -1 * Math.floor((-1 * response.found) / 25);

      if (cnft_page == cnft_page_limit + 1) {
        cnft_page_limit_hit = true;
        return;
      }

      await response.assets.forEach((e) => {
        if (
          constraintCheck(e.metadata, op) &&
          floor_warriors.length <= config.floor_cap
        ) {
          /* If rarity matches query then add them to the chart */
          floor_warriors.push(e);
        }
      });
    });
    cnft_page++;
  }
  return floor_warriors;
}

/* Main */
module.exports = {
  data: new SlashCommandBuilder()
    .setName("floor")
    .setDescription("Finds floor price for CardanoWarrior NFT's")
    .addStringOption((options) =>
      options
        .setName("items_number")
        .setDescription("9/8/7/6/5/4/3/2/1/0 items")
        .addChoice("9 item", "9")
        .addChoice("8 item", "8")
        .addChoice("7 item", "7")
        .addChoice("6 item", "6")
        .addChoice("5 item", "5")
        .addChoice("4 item", "4")
        .addChoice("3 item", "3")
        .addChoice("2 item", "2")
        .addChoice("1 item", "1")
        .addChoice("0 item", "0")
    )
    .addStringOption((options) =>
      options
        .setName("items_query")
        .setDescription("green hat,emerald armor,cross shield ...")
    )
    .addStringOption((options) =>
      options
        .setName("warrior_class")
        .setDescription("guardian,assassin,ent,dark knight...")
    )
    .addStringOption((options) =>
      options
        .setName("warrior_rarity")
        .setDescription("common/uncommon/rare/epic/legendary/mythical")
        .addChoice("Common", "Common")
        .addChoice("Uncommon", "Uncommon")
        .addChoice("Rare", "Rare")
        .addChoice("Epic", "Epic")
        .addChoice("Legendary", "Legendary")
        .addChoice("Mythical", "Mythical")
    ),
  async execute(interaction) {
    await interaction.reply("looking through cardania...");

    let collision = false;
    let test_class = true;
    let test_item = true;
    let filters = "";

    let warrior_options = interaction.options._hoistedOptions;
    let rarity_select = null;
    let class_select = null;
    let item_query_select = null;

    try {
      rarity_select = warrior_options
        .filter((e) => e.name === "warrior_rarity")[0]
        .value.toLowerCase();
      filters = filters + rarity_select + " / ";
    } catch (err) {}

    try {
      class_select = warrior_options
        .filter((e) => e.name === "warrior_class")[0]
        .value.toLowerCase();
      filters = filters + class_select + " / ";
      if (class_select && !warrior_classes.includes(class_select)) {
        test_class = false;
      }
    } catch (err) {}

    try {
      item_query_select = warrior_options
        .filter((e) => e.name === "items_query")[0]
        .value.toLowerCase();

      item_query_select = item_query_select.split(",");
      await item_query_select.forEach((query) => {
        if (
          query &&
          !item_classes.filter((e) => e[0].toLowerCase() === query).length > 0
        ) {
          if (item_query_select.length <= 1) {
            test_item = false;
          }
          item_query_select = arrayRemove(item_query_select, query);
        }
      });
      warrior_options.forEach((e) => {
        if (e.name == "items_query") {
          e.value = item_query_select;
        }
      });
      filters = filters + item_query_select + " / ";
    } catch (err) {}

    // Collision detection of class and rarity filter
    if (rarity_select && class_select) {
      if (!warrior_rarities[rarity_select].includes(class_select)) {
        collision = true;
      }
    }

    // If all test pass then continue
    if (!collision && test_class && test_item) {
      console.log(warrior_options);
      let warriors = await findFloor(warrior_options);

      if (warriors.length != 0) {
        let chart = await chartBuilder(warriors);
        await interaction.editReply(filters + "floor is " + chart.floor_price);
        await interaction.editReply({ files: [chart.attatchment] });
      } else {
        await interaction.editReply("No listings found, so the floor is lava");
      }
    } else {
      await interaction.editReply("Your query is invalid");
    }
  },
};

