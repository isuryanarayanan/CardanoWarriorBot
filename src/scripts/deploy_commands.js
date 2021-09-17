const { SlashCommandBuilder } = require("@discordjs/builders");
const { REST } = require("@discordjs/rest");
const { Routes } = require("discord-api-types/v9");
const { CLIENT_ID, GUILD_ID, BOT_TOKEN} = require("../config.json");

const commands = [
  new SlashCommandBuilder()
    .setName("pang")
    .setDescription("Replies with pong!"),
  new SlashCommandBuilder()
    .setName("serverer")
    .setDescription("Replies with server info!"),
  new SlashCommandBuilder()
    .setName("userer")
    .setDescription("Replies with user info!"),
].map((command) => command.toJSON());

const rest = new REST({ version: "9" }).setToken(BOT_TOKEN);

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
