const { SlashCommandBuilder } = require("@discordjs/builders");
const { project_id } = require("../config.json");
const { MessageEmbed } = require("discord.js");

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
    console.log(JSON.parse(data.response));
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
        const response = JSON.parse(data.response);
        var items = [];
        var traits = [];

        const warrior_embed = new MessageEmbed()
          .setColor("#0099ff")
          .setTitle(response.onchain_metadata.type + " - " + response.onchain_metadata.rarity)
          .setURL("https://cardanowarriors.io")
          .setDescription(response.onchain_metadata.name)
          .setImage(
            "https://ipfs.blockfrost.dev/ipfs/" +
              response.onchain_metadata.image.slice(5)
          )
          .setTimestamp()
          .setFooter(
            "used by " + interaction.user.username,
            interaction.user.displayAvatarURL({ dynamic: true })
          );
        warrior_embed.addField(
          "Items",
          response.onchain_metadata.items.length.toString(),
          false
        );
        response.onchain_metadata.items.forEach((e) => {
          items.push({ name: e.name, value: e.rarity, inline: true });
        });
        items.forEach((e) => {
          warrior_embed.addFields(e);
        });
				warrior_embed.addField(
				"\u200B",
				"\u200B",
				false
				);
        response.onchain_metadata.traits.forEach((e) => {
          traits.push({ name: "Trait", value: e, inline: true });
        });
        traits.forEach((e) => {
          warrior_embed.addFields(e);
        });
        interaction.reply({ embeds: [warrior_embed] });
      });
    }
  },
};
