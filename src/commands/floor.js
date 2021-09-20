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
  getAssets: "https://cardano-mainnet.blockfrost.io/api/v0/assets",
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
  //.addStringOption((options) =>
  //options
  //.setName("type")
  //.setDescription("Select a warrior type to find floor")
  //.setRequired(true)
  //.addChoice("Common warrior", "type_common")
  //.addChoice("Uncommon warrior", "type_uncommon")
  //.addChoice("Rare warrior", "type_rare")
  //.addChoice("Epic warrior", "type_epic")
  //.addChoice("Legendary warrior", "type_legendary")
  //.addChoice("Mythical warrior", "type_mythical")
  //),
  async execute(interaction) {
    const input = interaction.options.getString("type");
    await FindFloor().then(async (data) => {
      var response = JSON.parse(data.response);
      var reply = "";
      await response.assets.forEach((e) => {
        reply =
          reply +
          "\n" +
          e.price / 1000000 +
          " https://cnft.io/token.php?id=" +
          e.id;
      });
      await interaction.reply(reply);
    });
  },
};
/* Main */
