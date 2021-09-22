// Imports
require("dotenv").config();
const BOT_TOKEN = process.env["BOT_TOKEN"];
const fs = require("fs");
const { Client, Collection, Intents } = require("discord.js");

// Client Setup
const client = new Client({ intents: [Intents.FLAGS.GUILDS] });

// Creating command collection
client.commands = new Collection();
const commandFiles = fs
  .readdirSync("./commands")
  .filter((file) => file.endsWith(".js"));

// For all command files deploy each one
for (const file of commandFiles) {
  const command = require(`./commands/${file}`);
  client.commands.set(command.data.name, command);
}

// Ready to go
client.once("ready", () => {
  client.user.setActivity("/help");
  console.log("Ready!");
});

// Interaction endpoint
client.on("interactionCreate", async (interaction) => {
  if (!interaction.isCommand()) return;

  // Get command details from collection
  const command = client.commands.get(interaction.commandName);

  if (!command) return;

  try {
    // Execute logic from command body
    await command.execute(interaction);
  } catch (error) {
    console.error(error);
    await interaction.reply({
      content: "There was an error while executing this command!",
      ephemeral: true,
    });
  }
});

// Login for the bot
client.login(BOT_TOKEN);
