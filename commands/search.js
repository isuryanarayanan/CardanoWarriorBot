/* Imports */
const { SlashCommandBuilder } = require("@discordjs/builders");
const { MessageEmbed } = require("discord.js");
const { crawlCNFT } = require("../services/cnft.js");
const { getBlockfrostAsset } = require("../services/blockfrost.js");
const { arrayRemove, parseTagsFromString } = require("../services/misc.js");
/* Imports */

/* Setup */
var finish = false;
var users = {};
var timeout = 0;
var timelimit = 30000;
/* Setup */

function userLimitTest(userId) {
  if (users[userId]) {
    if (-1 * (users[userId].lastUsed - Date.now()) < timelimit) {
      timeout = -1 * (users[userId].lastUsed - Date.now());
      return false;
    }
  } else {
    users[userId] = { id: userId, lastUsed: Date.now() };
  }
  return true;
}

/* Cardano Warrior explorer */
async function getAssets(tag, tags, interaction) {
	// Sends an embed containing information about,
	// a cardano warrior with the given id
	const warrior_embed = new MessageEmbed();

  await getBlockfrostAsset(tag).then(async (cnft_warrior) => {
		// Using the blockfrost api the bot takes the tag that
		// is given here, and returns a promise which on resolving
		// gives the information about a warrior.

    var response = JSON.parse(cnft_warrior.response);

		// Creating the embed based on the warrior data
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
      .setThumbnail(
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
    var common_items = "";
    var uncommon_items = "";
    var rare_items = "";
    var epic_items = "";
    var legendary_items = "";
    var mythical_items = "";
    warrior_embed.addField(
      "Items",
      response.onchain_metadata.items.length.toString(),
      false
    );
    response.onchain_metadata.items.forEach((e) => {
      if (e.rarity == "Common") {
        common_items = common_items + "\n" + e.name;
      }
      if (mythical_items != "") {
        uncommon_items = uncommon_items + "\n" + e.name;
      }
      if (e.rarity == "Rare") {
        rare_items = rare_items + "\n" + e.name;
      }
      if (e.rarity == "Epic") {
        epic_items = epic_items + "\n" + e.name;
      }
      if (e.rarity == "Legendary") {
        legendary_items = legendary_items + "\n" + e.name;
      }
      if (e.rarity == "Mythical") {
        mythical_items = mythical_items + "\n" + e.name;
      }
      items.push({ name: e.name, value: e.rarity, inline: true });
    });
    if (common_items != "") {
      warrior_embed.addField("Common", common_items, (inline = true));
    }
    if (uncommon_items != "") {
      warrior_embed.addField("Uncommon", uncommon_items, (inline = true));
    }
    if (rare_items != "") {
      warrior_embed.addField("Rare", rare_items, (inline = true));
    }
    if (epic_items != "") {
      warrior_embed.addField("Epic", epic_items, (inline = true));
    }
    if (legendary_items != "") {
      warrior_embed.addField("Legendary", legendary_items, (inline = true));
    }
    if (mythical_items != "") {
      warrior_embed.addField("Mythical", mythical_items, (inline = true));
    }

    // Traits of the warrior
    var traits = [];
    var traits_reply = "";
    response.onchain_metadata.traits.forEach((e) => {
      traits.push(e);
    });
    var trait_count = 0;
    traits.forEach((e) => {
      trait_count++;
      if (trait_count == traits.length) {
        traits_reply = traits_reply + ("" + e + ". ");
      } else {
        traits_reply = traits_reply + ("" + e + ", ");
      }
    });
    warrior_embed.addField("Traits", traits_reply);

    // Sending the embed
    await interaction.channel
      .send({ embeds: [warrior_embed] })
      .then(async (msg) => {
        await crawlCNFT({ page: 1, search: tag }).then(async (cnft_data) => {
          // Crawling CNFT.io and updating the embed after sending
          var listings = JSON.parse(cnft_data.response);
          var page = 1;
          var warrior = undefined;

          while (listings.results.length != 0) {
            listings.results.forEach((listed) => {
              if (listed.asset.metadata.name == "Cardano Warrior #" + tag) {
                warrior = listed;
                listings.assets = [];
              }
            });

            if (warrior == undefined) {
              page++;
              listings = await crawlCNFT({ page: page, search: tag }).then(
                (data) => {
                  return JSON.parse(data.response);
                }
              );
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
		// Tests user rate limits
    if (userLimitTest(interaction.user.id)) {
      users[interaction.user.id].lastUsed = Date.now();
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
    } else {
      await interaction.reply(
        "Ayo chill !! ||wait for " +
          (timelimit - timeout) / 1000 +
          " seconds||",
        (hidden = true)
      );
    }
  },
};
/* Main */
