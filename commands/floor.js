/* Imports */
const { SlashCommandBuilder } = require("@discordjs/builders");
const project_id = process.env["project_id"];
const { MessageEmbed, MessageAttachment } = require("discord.js");
const { CanvasRenderService } = require("chartjs-node-canvas");
/* Imports */

/* Setup */
var XMLHttpRequest = require("xhr2");
var finish = false;
var endpoints = {
  cnftListings: "https://api.cnft.io/market/listings/",
};

const chart_width = 1200;
const chart_height = 500;
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
function FindFloor() {
  // Finds floor page
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
    .setDescription("Finds floor price for CardanoWarrior NFT's"),
  async execute(interaction) {
    const listing = [];
    const price = [];

    await FindFloor().then(async (data) => {
      var response = JSON.parse(data.response);
      await response.assets.splice(0, 15).forEach((e) => {
        price.push(e.price / 1000000);
        listing.push(e.metadata.tags[0].id);
      });
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
						barPercentage: 0.5,
						barThickness: 6,
						maxBarThickness: 8,
						minBarLength: 2,
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
							gridLines: { color: "#FFFFFF", zeroLineColor: "#FFFFFF" },
              scaleLabel: {
								display:true,
                labelString: "CardanoWarrior id's",
              },
              ticks: {
                fontSize: 20,
              },
            },
          ],
          yAxes: [
            {
              gridLines: { color: "#FFFFFF", zeroLineColor: "#FFFFFF" },
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

    await interaction.reply("The floor is " + price[0]);
    await interaction.editReply({ files: [attatchment] });
  },
};
/* Main */
