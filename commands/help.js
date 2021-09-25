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
        "This bot is purely free to use, the source for this project is available at https://github.com/isuryanarayanan/CardanoWarriorBot feel free to contribute <3"
      )
      .setTitle("Commands")
      .setURL("https://cardanowarriorbot.herokuapp.com/")
      .setFooter("bot by !suryan");

    help_embed.addField(
      "Exploring warrior's",
      "Using the `/search` command to find cardano warriors. This command takes 2 types of inputs, \n1) `/search #id` returns an embed with the details of the warrior \n2) `/search #id,#id,#id` returns 3 warriors "
    );
    help_embed.addField(
      "Floor price",
      "using the `/floor` will return a floor chart"
    );
    await interaction.reply(
      interaction.user.username + " use / commands to access the bot"
    );
    await interaction.editReply({ embeds: [help_embed] });
  },
};
/* Main */
