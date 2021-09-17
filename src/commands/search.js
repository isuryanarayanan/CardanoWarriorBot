const { SlashCommandBuilder } = require("@discordjs/builders");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("search")
    .setDescription("Enter Cardano Warrior Id")
    .addIntegerOption((options) =>
      options.setName("input").setDescription("1 - 9999").setRequired(true)
    ),
  async execute(interaction) {
    const tag = interaction.options.getInteger("input");
    if (tag < 1 || tag > 9999) {
      return interaction.reply({
        content: "Warrior Id should be valid",
        ephemeral: true,
      });
    } else {
      await interaction.reply("Here you go");
    }
  },
};
