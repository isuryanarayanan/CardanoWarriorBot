/*
 *
 * What happens in the floor command.
 *
 * When a user summons the bot through the floor command
 * there are is a filter list that is being passed from 
 * the client. For a normal summon with no filters the 
 * list will look like this '[]', but on adding filters
 * the filter list will contain the filter information.
 *
 * So what the floor command logic does is it parses these 
 * filters and crawls cnft.io's listing API to find listings
 * for CardanoWarriors that matches the filters provided.
 *
 * When the filter list has for exmaple, 
 * [
 * 	{ name: 'items_number', type: 'STRING', value: '7' },
 * 	{ name: 'items_query', type: 'STRING', value: [ 'cross shield' ] }
 * ]
 *
 * the bot will be crawling for listings which match these 
 * requirements. On finding a match it will add the listing to a
 * chart and send it over as an embed.
 *
 *
 */
const { SlashCommandBuilder } = require("@discordjs/builders");
const { findFloor } = require("../markets/market.js");
const { arrayRemove } = require("../services/misc.js");
const { chartBuilder } = require("../services/chart.js");

// Loading rarity information
const rarities_json = require("../rarities.json");
const warrior_classes = rarities_json.warrior_classes;
const item_classes = rarities_json.item_classes;
const warrior_rarities = rarities_json.warrior_rarity;

// The options menu for the command includes the parameters
// warrior_rarity | Rarity of Warriors.
// warrior_class  | Class of Warriors.
// items_number   | Number of items on the Warrior.
// items_query    | Item name.
module.exports = {
  data: new SlashCommandBuilder()
    .setName("floor")
    .setDescription("Finds floor price for CardanoWarrior NFT's")
    .addStringOption((options) =>
      options
        .setName("items_number")
        .setDescription("9/8/7/6/5/4/3/2/1/0 items")
        .addChoice("9 item", "9")
        .addChoice("8 item", "8")
        .addChoice("7 item", "7")
        .addChoice("6 item", "6")
        .addChoice("5 item", "5")
        .addChoice("4 item", "4")
        .addChoice("3 item", "3")
        .addChoice("2 item", "2")
        .addChoice("1 item", "1")
        .addChoice("0 item", "0")
    )
    .addStringOption((options) =>
      options
        .setName("items_query")
        .setDescription("green hat,emerald armor,cross shield ...")
    )
    .addStringOption((options) =>
      options
        .setName("warrior_class")
        .setDescription("guardian,assassin,ent,dark knight...")
    )
    .addStringOption((options) =>
      options
        .setName("warrior_rarity")
        .setDescription("common/uncommon/rare/epic/legendary/mythical")
        .addChoice("Common", "Common")
        .addChoice("Uncommon", "Uncommon")
        .addChoice("Rare", "Rare")
        .addChoice("Epic", "Epic")
        .addChoice("Legendary", "Legendary")
        .addChoice("Mythical", "Mythical")
    ),
  async execute(interaction) {
    await interaction.reply("looking through cardania...");
    let warrior_options = interaction.options._hoistedOptions;

		// Collision means the state when bot the command for
		// warrior rarity and warrior class is given so collision 
		// checks for if the class is inside the rarity that is also 
		// selected.

    let collision = false;
    let test_class = true;
    let test_item = true;
    let filters = "";

    let rarity_select = null;
    let class_select = null;
    let number_select = null;
    let item_query_select = null;

    try {
      number_select = warrior_options
        .filter((e) => e.name === "items_number")[0]
        .value.toLowerCase();
      filters = filters + number_select + " items / ";
    } catch (err) {}

    try {
      rarity_select = warrior_options
        .filter((e) => e.name === "warrior_rarity")[0]
        .value.toLowerCase();
      filters = filters + rarity_select + " / ";
    } catch (err) {}

    try {
      class_select = warrior_options
        .filter((e) => e.name === "warrior_class")[0]
        .value.toLowerCase();
      filters = filters + class_select + " / ";
      if (class_select && !warrior_classes.includes(class_select)) {
        test_class = false;
      }
    } catch (err) {}

    try {
			// On the item query filter multiple items can be 
			// queried using commas, here each item is parsed into
			// format for the bot to understand.
			item_query_select = warrior_options
        .filter((e) => e.name === "items_query")[0]
        .value.toLowerCase();

      item_query_select = item_query_select.split(",");
      await item_query_select.forEach((query) => {
        if (
          query &&
          !item_classes.filter((e) => e[0].toLowerCase() === query).length > 0
        ) {
          if (item_query_select.length <= 1) {
            test_item = false;
          }
          item_query_select = arrayRemove(item_query_select, query);
        }
      });
      warrior_options.forEach((e) => {
        if (e.name == "items_query") {
          e.value = item_query_select;
        }
      });
      filters = filters + item_query_select + " / ";
    } catch (err) {}

    // Collision detection of class and rarity filter
    if (rarity_select && class_select) {
      if (!warrior_rarities[rarity_select].includes(class_select)) {
        collision = true;
      }
    }

    // If all test pass then continue
    if (!collision && test_class && test_item) {
			// Finding the floor listings
      let warriors = await findFloor(warrior_options);

      if (warriors.length != 0) {
				// Builds and send chart of the listings
        let chart = await chartBuilder(warriors);
        await interaction.editReply(filters + "floor is " + chart.floor_price);
        await interaction.editReply({ files: [chart.attatchment] });
      } else {
        await interaction.editReply("No listings found, so the floor is lava");
      }
    } else {
      await interaction.editReply("Your query is invalid");
    }
  },
};
