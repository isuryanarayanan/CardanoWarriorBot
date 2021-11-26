require("dotenv").config();

/*
 * How the #floor channel works is that the bot
 * stores a channel id in the system variables, this channel
 * id can be the channel which is created to show the floor
 * information and on the first execution the bot will call
 * this module, and the module will forever execute within the
 * time interval which is 10 mins based on discord API limits.
 *
 * What the module does is look for if the message id is
 * stored in the system variables or not, if not it will
 * look through all the messages in the channel for a flag.
 * This flag is also stored in the system variables.
 *
 * On finding a message with a flag it will load that message
 * id onto the variable. If there is no message then the bot will
 * send a message to the channel with the flag.
 *
 * Once the message id is stored and available to the bot, it will
 * on each iteration send an embed containing the floor information
 * to that channel.
 *
 */

// loading variables to state
const GUILD_ID = process.env["DEV_GUILD_ID"];
const CLIENT_ID = process.env["DEV_CLIENT_ID"];
const FLOOR_CHANNEL_ID = process.env["DEV_FLOOR_CHANNEL_ID"];
const FLOOR_CHANNEL_MESSAGE_ID = process.env["DEV_FLOOR_CHANNEL_MESSAGE_ID"];
const FLOOR_CHANNEL_MESSAGE_TIMER =
  process.env["DEV_FLOOR_CHANNEL_MESSAGE_TIMER"];
const FLOOR_CHANNEL_MESSAGE_FLAG =
  process.env["DEV_FLOOR_CHANNEL_MESSAGE_FLAG"];

// Helper functions
const { crawlCNFT, findFloor } = require("../services/cnft.js");
const { MessageEmbed } = require("discord.js");

async function updateMessage(message) {
  // Update the floor embed with new data
  const floor_embed = new MessageEmbed();
  var prices = {};

  // Creating the embed
  floor_embed
    .setColor("#0099ff")
    .setDescription(
      "Floor information for cardanowarriors - update every 10 mins."
    )
    .setTitle("Current Floor data")
    .setURL("https://cardanowarriors.io")
    .setTimestamp()
    .setFooter("Bot by !suryan | Last updated ");

  // Updating the floor price for each class of warriors

  prices.common = findFloor([{ name: "warrior_rarity", value: "Common" }]).then(
    (data) => {
      floor_embed.addField("Common", data[0].price / 1000000 + " ADA", true);
      message.edit({ embeds: [floor_embed] });
    }
  );

  prices.uncommon = findFloor([
    { name: "warrior_rarity", value: "Uncommon" },
  ]).then((data) => {
    floor_embed.addField("Uncommon", data[0].price / 1000000 + " ADA", true);
    message.edit({ embeds: [floor_embed] });
  });

  prices.rare = findFloor([{ name: "warrior_rarity", value: "Rare" }]).then(
    (data) => {
      floor_embed.addField("Rare", data[0].price / 1000000 + " ADA", true);
      message.edit({ embeds: [floor_embed] });
    }
  );

  prices.epic = findFloor([{ name: "warrior_rarity", value: "Epic" }]).then(
    (data) => {
      floor_embed.addField("Epic", data[0].price / 1000000 + " ADA", true);
      message.edit({ embeds: [floor_embed] });
    }
  );

  prices.legendary = findFloor([
    { name: "warrior_rarity", value: "Legendary" },
  ]).then((data) => {
    floor_embed.addField("Legendary", data[0].price / 1000000 + " ADA", true);
    message.edit({ embeds: [floor_embed] });
  });

  prices.mythical = findFloor([
    { name: "warrior_rarity", value: "Mythical" },
  ]).then((data) => {
    floor_embed.addField("Mythical", data[0].price / 1000000 + " ADA", true);
    message.edit({ embeds: [floor_embed] });
  });

	// Editing the message to show new embed
  message.edit({ embeds: [floor_embed] });
}

async function findMessage(channel) {
  // Finding the message
  let message = undefined;

  if (FLOOR_CHANNEL_MESSAGE_ID != 0) {
    // If the message id is in the variables
    // load that and use it to send embed
    await channel.messages
      .fetch(FLOOR_CHANNEL_MESSAGE_ID)
      .then((data) => {
        message = data;
      })
      .catch((err) => {
        if (err.message == "Unknown Message") {
          console.log("message not found");
        }
      });
  } else {
    // Look through all the messages for a flag
    // and load that message with the flag as
    // the message
    await channel.messages.fetch().then((data) => {
      data.forEach((e) => {
        if (
          e.author.id == CLIENT_ID &&
          e.content == FLOOR_CHANNEL_MESSAGE_FLAG
        ) {
          message = e;
        }
      });
    });
  }

  if (!message) {
    // If no message is found through
    // variables and the channel, send a message
    // with the flag and load it into the system
    // variables and call the function again.
    message = await channel.send(FLOOR_CHANNEL_MESSAGE_FLAG);
  }

  return message;
}

function floorChannel(client) {

  var server = client.guilds.cache.get(GUILD_ID);
  var channel = server.channels.cache.get(FLOOR_CHANNEL_ID);
  var message = undefined;

  if (channel) {

		channel.edit({ name: `floor` }, "basic update");

    setInterval(async () => {

      const floor_price = await crawlCNFT({ page: 1 }).then((data) => {
        // Gets the floor price for updating the channel name
        return Math.floor(JSON.parse(data.response).results[0].price / 1000000);
      });

      // Updating the channel name
      channel
				.edit({ name: `floor - ${floor_price}` }, "Floor update")
        .catch(console.error);

      // Finding the message in the channel with the flag
      // or creating it if not found, anyways returning a
      // message id.
      message = await findMessage(channel);

      if (message) {
        // If the message id is returned successfully update
        // the message with real-time floor information
        updateMessage(message);
      }
    }, FLOOR_CHANNEL_MESSAGE_TIMER);
  }
}

module.exports = { floorChannel };
