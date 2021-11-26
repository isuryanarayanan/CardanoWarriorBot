/*
 * The points command have only 1 parameter, that is the address.
 * Address passed in can be of 2 types, wallet address starting with 'addr'
 * or a stake address starting with 'stake', either way the wallet address is parsed and 
 * the stake address is used to calculate the warrior points inside that wallet.Using the
 * blockfrost api from blockfrost.js module we find all the warrior class and add the associating
 * warrior points to the total and return it as an edit onto the interaction.
 */
const { SlashCommandBuilder } = require("@discordjs/builders");
const { MessageEmbed } = require("discord.js");
const { crawlCNFT } = require("../services/cnft.js");
const { hexDecodeIt } = require("../services/misc.js");
const {
  getWalletDetails,
  getStakeWalletDetails,
  getBlockfrostAsset,
} = require("../services/blockfrost.js");
const config = require("../config.json");

// I use the multicoin address validator package to verify if an address is valid.
var WAValidator = require("multicoin-address-validator");

async function sendWalletReport(stake_addr, interaction) {
	// Stake address is used to get all assets in the wallet.
	// From all the assets CardanoWarrior assets are parsed out. 

  var assets = [];
  var asset_count = 0;
  var cardanowarriors = [];
  var points = 0;
  var page = 1;
  var last_page = false;

  while (!last_page) {
    await getStakeWalletDetails(stake_addr, page).then(async (data) => {
      var response = JSON.parse(data.response);
      if (response.status_code >= 400) {
        last_page = true;
        await interaction.editReply("Something wrong with that address");
        return;
      } else {
				// Assets are pushed into the asset array and the page is incremented
				// by 1 until the assets length is less that 100 which means its the last page
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

	// Parse out assets which are starting with the cardano warrior policy id.
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
			// Calculate warrior points and add it to the total points 
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

			// Once the very last asset is used for calculating the points
			// send the channel message containing the points
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
			// If the given address is wallet address load stake address using blockfrost API
      getWalletDetails(input).then(async (data) => {
        if (JSON.parse(data.response).status_code >= 400) {
          await interaction.editReply(
            "Your wallet has trouble loading the stake address. If you have your stake address or another address pls enter that."
          );
        } else {
					// Send wallet report using the stake address retrieved
          sendWalletReport(
            JSON.parse(data.response).stake_address,
            interaction
          );
        }
      });
    } else if (input.startsWith("stake")) {
			// Send the wallet report using the given stake address
      sendWalletReport(input, interaction);
    } else {
      await interaction.editReply(
        "Nice try bud, give me a valid address next time :angry:"
      );
    }
  },
};
