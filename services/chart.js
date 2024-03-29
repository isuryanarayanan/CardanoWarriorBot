/*
 * This module deals with the chart embed that is used in the floor command.
 * Information about listings are passed into this module and a chart is generated
 * using chart.js renderToBuffer method.
 */
const { MessageEmbed, MessageAttachment } = require("discord.js");
const { CanvasRenderService } = require("chartjs-node-canvas");
const config = require("../config.json");

const chartCallback = (ChartJS) => {
  ChartJS.plugins.register({
    beforeDraw: (chartInstance) => {
      const { chart } = chartInstance;
      const { ctx, config } = chart;

      ctx.fillStyle = "black";
      ctx.fillRect(0, 0, chart.width, chart.height);
    },
  });
};

async function chartBuilder(warriors) {
  // Builds a bar chart with an array of
  // market listings from cnft.io

  let chart_price = [];
  let chart_listing = [];
  let chart_asset = [];
  let chart_color = [];

  warriors.forEach((asset) => {
    // parses price data and listing data
    chart_price.push(asset.price / 1000000);
    chart_listing.push(asset.asset.type + "\n#" + asset.asset.id);
    if (asset.market_name == "jpg") {
      chart_color.push("#4287f5");
    }
    if (asset.market_name == "cnft") {
      chart_color.push("#42f5ef");
    }
    chart_asset.push(asset);
  });

  const canvas = new CanvasRenderService(
    config.chart.floor_chart_width,
    config.chart.floor_chart_height,
    chartCallback
  );

  const configuration = {
    type: "bar",
    data: {
      labels: chart_listing,
      datasets: [
        {
          data: chart_price,
          asset: chart_asset,
          backgroundColor: chart_color,
        },
        {
          label: "cnft",
          backgroundColor: "#42f5ef",
        },
        {
          label: "jpg",
          backgroundColor: "#4287f5",
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

	return { floor_price: warriors[0].price / 1000000, attatchment: attatchment };
}

module.exports = { chartBuilder };
