/* Imports */
const { SlashCommandBuilder } = require("@discordjs/builders");
const { project_id } = require("../config.json");
const { MessageEmbed } = require("discord.js");
/* Imports */

/* Setup */
var FormData = require("form-data");
var XMLHttpRequest = require("xhr2");
var finish = false;
var endpoints = {
  cnftListings: "https://api.cnft.io/market/listings/",
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
    .setDescription("Finds floor price for CardanoWarrior NFT's"),
  async execute(interaction) {
		var price = []
		var listing = []
    await FindFloor().then(async (data) => {
      var response = JSON.parse(data.response);
      await response.assets.forEach((e) => {
				price.push(e.price)
				listing.push(e.id)
				// Make chart


      });
      await interaction.reply(":)");
    });
  },
};
/* Main */
