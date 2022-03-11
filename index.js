require("dotenv").config();

//const { floorChannel } = require("./channels/floor.js");
const { Client, Collection, Intents } = require("discord.js");
const client = new Client({ intents: [Intents.FLAGS.GUILDS] });
const fs = require("fs");

/*
 * All the necessary tokens and valuable keys
 * are stored in the local environment variables
 * each variable is named according to the bot
 * which its meant for. Since I use 2 bot's, 1 for
 * testing in the testing server and another as the
 * main deployment bot. There is two of each tokens
 * other than the blockfrost token.
 *
 * Naming for each variable starts with what bot it
 * belongs to. For ex, DEV_ means it is for development
 * bot and DEP_ means it is for deployment bot.
 */

const GUILD_ID = process.env["DEV_GUILD_ID"];
const BOT_TOKEN = process.env["DEV_BOT_TOKEN"];

// Creating command collection
// Each file under the commands folder
// with a .js extention will be deployed as a command
const commandFiles = fs
  .readdirSync("./commands")
  .filter((file) => file.endsWith(".js"));

client.commands = new Collection();

for (const file of commandFiles) {
  const command = require(`./commands/${file}`);
  client.commands.set(command.data.name, command);
}

client.once("ready", () => {
  client.user.setActivity("/help");

  // Used to deploy the #floor feature
  // where the floor data for each rarity is
  // show at a periodic interval
  //floorChannel(client);
});

client.on("interactionCreate", async (interaction) => {
  if (!interaction.isCommand()) return;

  const command = client.commands.get(interaction.commandName);

  if (!command) return;

  try {
    await command.execute(interaction);
  } catch (error) {
		console.log(error)
    await interaction.editReply("Uh. oh!");
  }
});

client.login(BOT_TOKEN);
