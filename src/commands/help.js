/* Imports */
const { SlashCommandBuilder } = require("@discordjs/builders");
/* Imports */

/* Main */
module.exports = {
  data: new SlashCommandBuilder()
    .setName("help")
    .setDescription("How to use the bot"),
  async execute(interaction) {
    var reply =
      "To search use `/search warrior_id`\nTo get floor price use `/floor list or chart`";
    await interaction.reply(reply);
  },
};
/* Main */
