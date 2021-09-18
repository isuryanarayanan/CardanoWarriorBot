const { SlashCommandBuilder } = require("@discordjs/builders");
const { project_id } = require("../config.json");

var XMLHttpRequest = require("xhr2");

var endpoints = {
  getAssets: "https://cardano-mainnet.blockfrost.io/api/v0/assets",
};

function hexIt(str) {
  str = "CardanoWarrior" + str;
  var hex = "";
  for (var i = 0; i < str.length; i++) {
    hex += "" + str.charCodeAt(i).toString(16);
  }
  return hex;
}

function getAssets(tag) {
  let xhr = new XMLHttpRequest();
  let promise = new Promise((resolve, reject) => {
    xhr.open(
      "GET",
      endpoints.getAssets +
        "/8f80ebfaf62a8c33ae2adf047572604c74db8bc1daba2b43f9a65635" +
        hexIt(tag)
    );
    xhr.setRequestHeader("Content-Type", "Application/json");
    xhr.setRequestHeader("project_id", project_id);
    xhr.onload = () => {
      resolve(xhr);
    };
    xhr.onerror = () => {
      reject(xhr);
    };
    xhr.send(JSON.stringify(tag));
  });
  promise.then((data) => {
    console.log(data.response);
  });
  return promise;
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName("search")
    .setDescription("Enter Cardano Warrior Id")
    .addIntegerOption((options) =>
      options.setName("input").setDescription("1 - 9999").setRequired(true)
    ),
  async execute(interaction) {
    const tag = interaction.options.getInteger("input");
    if (tag < 1 || tag > 9999) {
      return interaction.reply({
        content: "Warrior Id should be valid",
        ephemeral: true,
      });
    } else {
      await getAssets(tag).then((data) => {
        interaction.reply(JSON.stringify(data.response));
      });
    }
  },
};
