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
/* Setup */

/* Helper functions */
function hexIt(str) {
  // Returns hex encoded value of string
  str = "CardanoWarrior" + str;
  var hex = "";
  for (var i = 0; i < str.length; i++) {
    hex += "" + str.charCodeAt(i).toString(16);
  }
  return hex;
}

function arrayRemove(arr, value) {
  // Removes value from array
  return arr.filter(function (ele) {
    return ele != value;
  });
}

function parseTagsFromString(str) {
  // takes a string and parse it into query tags
  var splittedStr = str.split(",");
  var verifiedTags = [];
  splittedStr.forEach((e) => {
    if (!isNaN(e)) {
      verifiedTags.push(parseInt(e));
    }
  });
  verifiedTags.forEach((e) => {
    if (e < 1 || e > 9999) {
      verifiedTags = arrayRemove(verifiedTags, e);
    }
  });

  return verifiedTags;
}
/* Helper functions */

/* CNFT.io scanner */
function getCNFTListing(id, page) {
  // Detects a listing for a certain warrior id on a listing page
  let xhr = new XMLHttpRequest();
  let promise = new Promise((resolve, reject) => {
    xhr.open("POST", endpoints.cnftListings);
    var params =
      "search=Cardano+Warrior+#" +
      id +
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
/* CNFT.io scanner */

/* Cardano Warrior explorer */
function getAssets(tag, tags, interaction) {
  // Returns a promise which will on resolving
  // will provide a discord message with an embed
  // containing a warrior information
  const warrior_embed = new MessageEmbed();
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

  promise.then(async (cnft_warrior) => {
    // Logic after getting data from blockchain
    var response = JSON.parse(cnft_warrior.response);

    // Embed details
    warrior_embed
      .setColor("#0099ff")
      .setDescription(
        "crawling cnft.io for CardanoWarrior#" + tag + " listing..."
      )
      .setTitle(
        response.onchain_metadata.name +
          " - " +
          response.onchain_metadata.type +
          " - " +
          response.onchain_metadata.rarity
      )
      .setURL("https://cardanowarriors.io")
      .setImage(
        "https://ipfs.blockfrost.dev/ipfs/" +
          response.onchain_metadata.image.slice(5)
      )
      .setTimestamp()
      .setFooter(
        "used by " + interaction.user.username,
        interaction.user.displayAvatarURL({ dynamic: true })
      );

    // Items of the warrior
    var items = [];
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

    // Traits of the warrior
    var traits = [];
    warrior_embed.addField("\u200B", "\u200B", false);
    response.onchain_metadata.traits.forEach((e) => {
      traits.push({ name: "Trait", value: e, inline: true });
    });
    traits.forEach((e) => {
      warrior_embed.addFields(e);
    });

    // Sending the embed
    await interaction.channel
      .send({ embeds: [warrior_embed] })
      .then(async (msg) => {
        await getCNFTListing(tag, 1).then(async (cnft_data) => {
          // Crawling CNFT.io and updating the embed
          var listings = JSON.parse(cnft_data.response);
          var page = 1;
          var warrior = undefined;

          while (listings.assets.length != 0) {
            listings.assets.forEach((listed) => {
              if (listed.metadata.name == "Cardano Warrior #" + tag) {
                warrior = listed;
                listings.assets = [];
              }
            });

            if (warrior == undefined) {
              page++;
              listings = await getCNFTListing(tag, page).then((data) => {
                return JSON.parse(data.response);
              });
            }
          }

          if (warrior != undefined) {
            console.log("warrior found");
            warrior_embed.setDescription(
              warrior.metadata["name"] +
                " listed for " +
                warrior.price / 1000000 +
                " here " +
                "https://cnft.io/token.php?id=" +
                warrior.id
            );
            msg.edit({ embeds: [warrior_embed] });
          } else {
            warrior_embed.setDescription(
              "No active listing found for CardanoWarrior#" + tag
            );
            msg.edit({ embeds: [warrior_embed] });
          }
        });
      });
  });

  return promise;
}
/* Cardano Warrior explorer */

/* Main */
module.exports = {
  data: new SlashCommandBuilder()
    .setName("search")
    .setDescription("Enter Cardano Warrior Id")
    .addStringOption((options) =>
      options
        .setName("warrior_id")
        .setDescription("1 - 9999 use commas to seperate multiple id's")
        .setRequired(true)
    ),
  async execute(interaction) {
    const input = interaction.options.getString("warrior_id");

    var tags = parseTagsFromString(input);

    if (tags.length == 0) {
      await interaction.reply("what?");
    } else {
      await interaction.reply("Querying for CardanoWarrior#" + tags);
      tags.forEach(async (tag) => {
        await getAssets(tag, tags, interaction);
      });
    }
  },
};
/* Main */
