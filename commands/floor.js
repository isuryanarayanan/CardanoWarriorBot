/* Imports */
const { SlashCommandBuilder } = require("@discordjs/builders");
const project_id = process.env["project_id"];
const { MessageEmbed, MessageAttachment } = require("discord.js");
const { CanvasRenderService } = require("chartjs-node-canvas");
/* Imports */

/* Setup */
var XMLHttpRequest = require("xhr2");
var endpoints = {
  cnftListings: "https://api.cnft.io/market/listings/",
};
const warrior_classes = [
  "assassin",
  "balrog",
  "barbarian",
  "cleric",
  "cook",
  "cyclop",
  "dark elf",
  "dark knight",
  "demon",
  "dragon",
  "dwarf",
  "elf",
  "ent",
  "guardian",
  "hobbit",
  "king",
  "knight",
  "lizard",
  "mage",
  "manticore",
  "minotaur",
  "mummy",
  "ninja",
  "orc",
  "skeleton",
  "thief",
  "vampire",
  "villager",
  "warrior",
  "werewolf",
  "wraith",
  "zombie",
];

const chart_width = 1000;
const chart_height = 500;
const chart_length = 12;
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
/* Setup */

/* CNFT.io scanner*/
function FindFloor(page, order) {
  // Finds floor page
  let xhr = new XMLHttpRequest();
  let promise = new Promise((resolve, reject) => {
    xhr.open("POST", endpoints.cnftListings);
    var params =
      "search=" +
      "&sort=price" +
      "&order=" +
      order +
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
/* CNFT.io scanner */

/* Main */
module.exports = {
  data: new SlashCommandBuilder()
    .setName("floor")
    .setDescription("Finds floor price for CardanoWarrior NFT's")
    .addSubcommand((subcommand) =>
      subcommand
        .setName("class")
        .setDescription("Floor based on class of warrior")
        .addStringOption((options) =>
          options
            .setName("class")
            .setDescription(
              "like assasin,balrog etc.. (It will take longer for higher rarity warriors)"
            )
            .setRequired(true)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("rarity")
        .setDescription("Floor based on rarity of warrior")
        .addStringOption((options) =>
          options
            .setName("rarity")
            .setDescription("Returns floor chart of the rarity selected")
            .setRequired(true)
            .addChoice("Common (instant)", "Common")
            .addChoice("Uncommon (a little slow)", "Uncommon")
            .addChoice("Rare (slow)", "Rare")
            .addChoice("Epic (slower)", "Epic")
            .addChoice("Legendary (very slow)", "Legendary")
            .addChoice("Mythical (go take a nap)", "Mythical")
        )
    ),
  async execute(interaction) {
    // Constant variables used in query
    const warrior_class = interaction.options.getString("class");
    const warrior_rarity = interaction.options.getString("rarity");
    const listing = [];
    const price = [];
    // Variables to support the query
    var page = 1;
    var page_limit = 0;
    var page_limit_hit = false;
    var order = "asc";
    var class_assets = [];
    var warrior_query = "";

    // Initial reply, we edit this to display result
    await interaction.reply("...");

    if (warrior_rarity) {
      /* If the choice is rarity */
      warrior_query = warrior_rarity;
      await interaction.editReply("The floor for " + warrior_rarity + " is ..");

      while (class_assets.length < chart_length && !page_limit_hit) {
        /* Find 12 listings */
        await FindFloor(page, order).then(async (data) => {
          var response = JSON.parse(data.response);
          page_limit = -1 * Math.floor((-1 * response.found) / 25);

          if (page == page_limit) {
            page_limit_hit = true;
            return;
          }
          await response.assets.forEach((e) => {
            if (
              e.metadata.tags[3].rarity == warrior_rarity &&
              class_assets.length < chart_length
            ) {
              /* If rarity matches query then add them to the chart */
              class_assets.push(e);
            }
          });
        });

        page++;
      }
    }

    if (warrior_class) {
      /* If the choice is class */
      if (warrior_classes.includes(warrior_class)) {
      	/* If the class choice is valid */
        warrior_query = warrior_class;
        await interaction.editReply(
          "The floor for " + warrior_class + " is .."
        );
        while (class_assets.length < chart_length && !page_limit_hit) {
          /* Find 12 listings */
          await FindFloor(page, order).then(async (data) => {
            var response = JSON.parse(data.response);
            page_limit = -1 * Math.floor((-1 * response.found) / 25);

            if (page == page_limit) {
              page_limit_hit = true;
              return;
            }

            await response.assets.forEach((e) => {
              if (
                e.metadata.tags[1].type.toLowerCase() == warrior_class &&
                class_assets.length < chart_length
              ) {
                /* If class matches query then add them to the chart */
                class_assets.push(e);
              }
            });
          });

          page++;
        }
      } else {
      	/* If the class choice is invalid */
        await interaction.editReply("what?");
      }
    }

    if (class_assets[0] != undefined) {
      class_assets.forEach((asset) => {
        price.push(asset.price / 1000000);
        listing.push(
          asset.metadata.tags[1].type + "\n#" + asset.metadata.tags[0].id
        );
      });
      const canvas = new CanvasRenderService(
        chart_width,
        chart_height,
        chartCallback
      );
      const configuration = {
        type: "bar",
        data: {
          labels: listing,
          datasets: [
            {
              label: "Floor Cardano Warriors",
              data: price,
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

      await interaction.editReply(
        "The floor for " + warrior_query + " is " + price[0]
      );
      await interaction.editReply({ files: [attatchment] });
    } else {
      await interaction.editReply("what?");
    }
  },
};
/* Main */
