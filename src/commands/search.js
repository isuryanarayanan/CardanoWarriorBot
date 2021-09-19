// Imports
const { SlashCommandBuilder } = require("@discordjs/builders");
const { project_id } = require("../config.json");
const { MessageEmbed } = require("discord.js");
var FormData = require("form-data");

// Setup and helper functions
var XMLHttpRequest = require("xhr2");

var endpoints = {
  getAssets: "https://cardano-mainnet.blockfrost.io/api/v0/assets",
  cnftListings: "https://api.cnft.io/market/listings/",
};

function hexIt(str) {
  // Returns hex encoded value of string
  str = "CardanoWarrior" + str;
  var hex = "";
  for (var i = 0; i < str.length; i++) {
    hex += "" + str.charCodeAt(i).toString(16);
  }
  return hex;
}

function getAssets(tag) {
  // Returns a promise containing information about the asset from the cardano blockchain
  // uses blockfrost API

  // Setup
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
  return promise;
}
function arrayRemove(arr, value) {
  return arr.filter(function (ele) {
    return ele != value;
  });
}
function parseTagsFromString(str) {
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

function getCNFTListing(id, page) {
  let xhr = new XMLHttpRequest();
  let promise = new Promise((resolve, reject) => {
    xhr.open("POST", endpoints.cnftListings);
    var params =
      "search=Cardano+Warrior+#" +
      id +
      "&sort=price&order=asc&page=" +
      page +
      "&verified=true&project=Cardano+Warriors";
    xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    //xhr.setRequestHeader("project_id", project_id);
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

module.exports = {
  data: new SlashCommandBuilder()
    .setName("search")
    .setDescription("Enter Cardano Warrior Id")
    .addStringOption((options) =>
      options
        .setName("input")
        .setDescription("1 - 9999,1-9999")
        .setRequired(true)
    ),
  async execute(interaction) {
    // On command execute this logic

    var reply = "";
    const tag = interaction.options.getString("input");

    var tags = parseTagsFromString(tag);
    if (tags.length == 0) {
      return interaction.reply({
        content: "Warrior Id should be valid",
        ephemeral: true,
      });
    }
    var embeds = [];
    await tags.forEach(async (e) => {
      await getAssets(e).then(async (data) => {
        var listed_warrior = getCNFTListing(e, "all").then(async (data) => {
          await interaction.channel.send(
            "Scanning CNFT.io for listing (wait)..."
          );
          var listings = JSON.parse(data.response);
          var search_status = "";
          var page = 1;
          var warrior = "No active listing found.";
          while (listings.assets.length != 0) {
            search_status = page + "-" + listings.found;
            page++;
            listings.assets.forEach((listed) => {
              if (listed.metadata.name == "Cardano Warrior #" + e) {
                warrior = listed;
              }
            });

            if (warrior != "No active listing found.") {
              listings.assets = [];
            }
            listings = await getCNFTListing(e, page).then((data) => {
              return JSON.parse(data.response);
            });
          }
          if (warrior != "No active listing found.") {
						console.log(interaction.channel.messages)
            await interaction.channel.send(
              warrior.metadata["name"] +
                " listed for " +
                warrior.price / 1000000 +
                " here " +
                "https://cnft.io/token.php?id=" +
                warrior.id
            );
          } else {
            await interaction.channel.send("No active listing found.");
          }
          return warrior;
        });

        // Reply to command with rendered data from the blockchain
        const response = JSON.parse(data.response);

        var items = [];
        var traits = [];

        // Message embed
        const warrior_embed = new MessageEmbed()
          .setColor("#0099ff")
          .setTitle(
            response.onchain_metadata.type +
              " - " +
              response.onchain_metadata.rarity
          )
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

        // Items of the warrior
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
        warrior_embed.addField("\u200B", "\u200B", false);
        response.onchain_metadata.traits.forEach((e) => {
          traits.push({ name: "Trait", value: e, inline: true });
        });
        traits.forEach((e) => {
          warrior_embed.addFields(e);
        });
        embeds.push(warrior_embed);
        if (embeds.length == tags.length) {
          await embeds.forEach(async (e) => {
            await interaction.channel.send({ embeds: [e] });
          });
          await interaction.reply("Querying for CardanoWarrior#"+e);
        }
      });
    });
  },
};
