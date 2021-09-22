/* Imports */
const { SlashCommandBuilder } = require("@discordjs/builders");
const { MessageEmbed } = require("discord.js");
/* Imports */

/* Main */
module.exports = {
  data: new SlashCommandBuilder()
    .setName("help")
    .setDescription("How to use the bot"),
  async execute(interaction) {
    const help_embed = new MessageEmbed();
    help_embed
      .setColor("#0099ff")
      .setDescription(
        "To search use `/search warrior_id`\nTo get floor price use `/floor `"
      )
      .setTitle("Commands")
      .setURL("https://cardanowarriorbot.herokuapp.com/")
      .setFooter("bot by !suryan");

    await interaction.reply(
      interaction.user.username + " use / commands to access the bot"
    );
    await interaction.editReply({ embeds: [help_embed] });
  },
};
/* Main */
