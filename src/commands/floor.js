/* Imports */
const { SlashCommandBuilder } = require("@discordjs/builders");
const { project_id } = require("../config.json");
const { MessageEmbed, MessageAttachment } = require("discord.js");
const { CanvasRenderService } = require("chartjs-node-canvas");
/* Imports */

/* Setup */
var FormData = require("form-data");
var XMLHttpRequest = require("xhr2");
var finish = false;
var endpoints = {
  cnftListings: "https://api.cnft.io/market/listings/",
};

const chart_width = 1200;
const chart_height = 600;
/* Setup */

const chartCallback = (ChartJS) => {
  ChartJS.plugins.register({
    beforeDraw: (chartInstance) => {
      const { chart } = chartInstance;
      const { ctx } = chart;
      ctx.fillStyle = "white";
      ctx.fillRect(0, 0, chart.width, chart.height);
    },
  });
};

/* CNFT.io scanner*/
function FindFloor() {
  // Detects a listing for a certain warrior id on a listing page
  let xhr = new XMLHttpRequest();
  let promise = new Promise((resolve, reject) => {
    xhr.open("POST", endpoints.cnftListings);
    var params =
      "search=" +
      "&sort=price" +
      "&order=asc" +
      "&page=1" +
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
    .addStringOption((option) =>
      option
        .setName("type")
        .setDescription("Select how to view your floor")
        .setRequired(true)
        .addChoice("Chart", "floor_chart")
        .addChoice("List", "floor_list")
    ),
  async execute(interaction) {
    const input = interaction.options.getString("type");
    const listing = [];
    const price = [];
    var reply = "```";

    await FindFloor().then(async (data) => {
      var response = JSON.parse(data.response);
      await response.assets.splice(0, 10).forEach((e) => {
        if (input == "floor_list") {
          reply =
            reply +
            "\n" +
            e.price / 1000000 +
            " https://cnft.io/token.php?id=" +
            e.id;
        } else {
          price.push(e.price / 1000000);
          listing.push(e.metadata.tags[0].id);
        }
      });
    });
    if (input == "floor_chart") {
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
          scales: {
            xAxes: [
              {
                ticks: {
                  fontSize: 20,
                },
              },
            ],
            yAxes: [
              {
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
      await interaction.reply({ files: [attatchment] }).then((msg) => {});
    } else {
      await interaction.reply(reply + "```");
    }
  },
};
/* Main */
