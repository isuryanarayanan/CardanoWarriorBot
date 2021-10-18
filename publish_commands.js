// Imports
require("dotenv").config();
const fs = require("fs");
const { REST } = require("@discordjs/rest");
const { Routes } = require("discord-api-types/v9");
// DEV
const CLIENT_ID = process.env["CLIENT_ID"];
const GUILD_ID = process.env["GUILD_ID"];
const BOT_TOKEN = process.env["BOT_TOKEN"];

// DEV MAIN BOT
//const CLIENT_ID = process.env["CLIENT_ID3"];
//const GUILD_ID = process.env["GUILD_ID3"];
//const BOT_TOKEN = process.env["BOT_TOKEN3"];


// MAIN
//const CLIENT_ID = process.env["CLIENT_ID2"];
//const GUILD_ID = process.env["GUILD_ID2"];
//const BOT_TOKEN = process.env["BOT_TOKEN2"];


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
