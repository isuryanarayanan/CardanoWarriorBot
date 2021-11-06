// Imports
require("dotenv").config();
const fs = require("fs");
const { REST } = require("@discordjs/rest");
const { Routes } = require("discord-api-types/v9");

// Development Bot to the development server
const CLIENT_ID = process.env["DEV_CLIENT_ID"];
const GUILD_ID = process.env["DEV_GUILD_ID"];
const BOT_TOKEN = process.env["DEV_BOT_TOKEN"];

// Deployment Bot to the development server
//const CLIENT_ID = process.env["DEP_CLIENT_ID"];
//const GUILD_ID = process.env["DEV_GUILD_ID"];
//const BOT_TOKEN = process.env["DEP_BOT_TOKEN"];


// Deployment Bot to Deployment server
//const CLIENT_ID = process.env["DEP_CLIENT_ID"];
//const GUILD_ID = process.env["DEP_GUILD_ID"];
//const BOT_TOKEN = process.env["DEP_BOT_TOKEN"];


// Setup
const commands = [];

// Read command files
const commandFiles = fs
  .readdirSync("./commands")
  .filter((file) => file.endsWith(".js"));

// For each command file push it to commands array
for (const file of commandFiles) {
  const command = require(`./commands/${file}`);
  commands.push(command.data.toJSON());
}

const rest = new REST({ version: "9" }).setToken(BOT_TOKEN);

// Deploy commands to guild
(async () => {
  try {
    await rest.put(Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID), {
      body: commands,
    });

    console.log("Successfully registered application commands.");
  } catch (error) {
    console.error(error);
  }
})();
