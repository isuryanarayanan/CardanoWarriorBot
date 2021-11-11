require("dotenv").config();
const GUILD_ID = process.env["DEV_GUILD_ID"];
const CLIENT_ID = process.env["DEV_CLIENT_ID"];
const FLOOR_CHANNEL_ID = process.env["DEV_FLOOR_CHANNEL_ID"];
const FLOOR_CHANNEL_MESSAGE_ID = process.env["DEV_FLOOR_CHANNEL_MESSAGE_ID"];
const FLOOR_CHANNEL_MESSAGE_TIMER = process.env["DEV_FLOOR_CHANNEL_MESSAGE_TIMER"];
const FLOOR_CHANNEL_MESSAGE_FLAG =
  process.env["DEV_FLOOR_CHANNEL_MESSAGE_FLAG"];
const { crawlCNFT, findFloor } = require("../services/cnft.js");
const { MessageEmbed } = require("discord.js");

async function updateMessage(message) {
  // Update the floor embed with new data
  const floor_embed = new MessageEmbed();
  floor_embed
    .setColor("#0099ff")
    .setDescription(
      "Floor information for cardanowarriors - update every 10 mins."
    )
    .setTitle("Current Floor data")
    .setURL("https://cardanowarriors.io")
    .setTimestamp()
    .setFooter("Bot by !suryan | Last updated ");
  var prices = {};
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
  // Check if FLOOR_CHANNEL_MESSAGE_ID is null or not
  // if null, then load it from environment variables
  // if no variable found then search through the channel for flag
  // if no flag is found then send a message with the flag

  var server = client.guilds.cache.get(GUILD_ID);
  var channel = server.channels.cache.get(FLOOR_CHANNEL_ID);
  var message = undefined;
  if (channel) {
    channel.edit({ name: `floor` }, "basic update");

    setInterval(async () => {
      // The floor channel setup
      const floor_price = await crawlCNFT({ page: 1 }).then((data) => {
        var resp = JSON.parse(data.response);
        return Math.floor(resp.results[0].price / 1000000);
      });
      channel
        .edit({ name: `floor - ${floor_price}` }, "Floor update")
        .catch(console.error);
      message = await findMessage(channel);
      if (message) {
        updateMessage(message);
      }
    }, FLOOR_CHANNEL_MESSAGE_TIMER);
  }
}



module.exports = { floorChannel };
