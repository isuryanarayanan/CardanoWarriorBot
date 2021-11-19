/* Imports */
const { SlashCommandBuilder } = require("@discordjs/builders");
const { MessageEmbed } = require("discord.js");
const { crawlCNFT } = require("../services/cnft.js");
const { hexDecodeIt } = require("../services/misc.js");
const config = require("../config.json");
const {
  getWalletDetails,
  getStakeWalletDetails,
  getBlockfrostAsset,
} = require("../services/blockfrost.js");
var WAValidator = require("multicoin-address-validator");
/* Imports */

async function sendWalletReport(stake_addr, interaction) {
  var assets = [];
  var cardanowarriors = [];
  var points = 0;
  var page = 1;
  var last_page = false;
  var asset_count = 0;

  while (!last_page) {
    await getStakeWalletDetails(stake_addr, page).then(async (data) => {
      var response = JSON.parse(data.response);
      if (response.status_code >= 400) {
        last_page = true;
        await interaction.editReply("Something wrong with that address");
        return;
      } else {
        response.forEach((e) => {
          assets.push(e);
        });
        page = page + 1;
        if (response.length < 100) {
          last_page = true;
        }
      }
    });
  }

  assets.forEach((e) => {
    if (
      e.unit.startsWith(
        "8f80ebfaf62a8c33ae2adf047572604c74db8bc1daba2b43f9a65635"
      )
    ) {
      cardanowarriors.push(e.unit);
    }
  });

  await cardanowarriors.forEach(async (e) => {
    var tag = hexDecodeIt(
      e.replace("8f80ebfaf62a8c33ae2adf047572604c74db8bc1daba2b43f9a65635", "")
    );

    getBlockfrostAsset(tag.replace("CardanoWarrior", "")).then(async (data) => {
      var response = JSON.parse(data.response);
      if (response.onchain_metadata.rarity == "Common") {
        points = points + config.warrior_points["Common"];
      } else if (response.onchain_metadata.rarity == "Uncommon") {
        points = points + config.warrior_points["Uncommon"];
      } else if (response.onchain_metadata.rarity == "Rare") {
        points = points + config.warrior_points["Rare"];
      } else if (response.onchain_metadata.rarity == "Epic") {
        points = points + config.warrior_points["Epic"];
      } else if (response.onchain_metadata.rarity == "Legendary") {
        points = points + config.warrior_points["Legendary"];
      } else if (response.onchain_metadata.rarity == "Mythical") {
        points = points + config.warrior_points["Mythical"];
      }

      if (asset_count == cardanowarriors.length - 1) {
        await interaction.editReply(
          "You Have " +
            points / 10 +
            " warrior points from " +
            cardanowarriors.length +
            " warriors"
        );
      } else {
        asset_count++;
      }
    });
  });
}

/* Main */
module.exports = {
  data: new SlashCommandBuilder()
    .setName("points")
    .setDescription("Warrior points calculator")
    .addStringOption((options) =>
      options
        .setName("address")
        .setDescription("Your wallet address or stake address")
        .setRequired(true)
    ),
  async execute(interaction) {
    const input = interaction.options.getString("address");
    await interaction.reply("Hmm... let me see.");

    if (input.startsWith("addr") && WAValidator.validate(input, "ada")) {
      getWalletDetails(input).then(async (data) => {
        if (JSON.parse(data.response).status_code >= 400) {
          await interaction.editReply(
            "Your wallet has trouble loading the stake address. If you have your stake address or another address pls enter that."
          );
        } else {
          sendWalletReport(
            JSON.parse(data.response).stake_address,
            interaction
          );
        }
      });
    } else if (input.startsWith("stake")) {
      sendWalletReport(input, interaction);
    } else {
      await interaction.editReply(
        "Nice try bud, give me a valid address next time :angry:"
      );
    }
  },
};
/* Main */
