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
      .setColor("#000000")
      .setDescription("https://github.com/isuryanarayanan/CardanoWarriorBot")
      .setTitle("Commands")
      .setURL("https://cardanowarriorbot.herokuapp.com/")
      .setFooter("bot by !suryan");

    help_embed.addField(
      "Exploring warrior's",
      "1) `/search #id` returns an embed with the details of the warrior \n2) `/search #id,#id,#id` returns 3 warriors "
    );
    help_embed.addField(
      "Floor price",
      "To find the floor quick use `/floor` command and use the options as filters\n While using item_query you can use commas to seperate multiple items"
    );
    help_embed.addField(
      "Donate",
      "addr1qy4hyssptf7k8jgfpgndu0uulqaz94v7krvgagjxyra3k5fsfda49hjutl24g5f9ulvutmqf5mlzm8mzntlxyrqkuddstmyuu3"
    );
    await interaction.reply(
      interaction.user.username + " use / commands to access the bot"
    );
    await interaction.editReply({ embeds: [help_embed] });
  },
};
/* Main */
