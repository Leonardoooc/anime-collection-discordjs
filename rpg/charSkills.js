const Discord = require("discord.js");
const { once } = require("events");
const selectMenu = require('../selectmenu/rpgSelectorMain.js');

const actionRow = new Discord.ActionRowBuilder()
    .addComponents(new Discord.StringSelectMenuBuilder(selectMenu[0]));

const manageActionRow = new Discord.ActionRowBuilder().addComponents(new Discord.StringSelectMenuBuilder(selectMenu[1]))

module.exports = async function charSkills(message, msg, client) {
    try {
        var connection = require('../database/connect.js');
        const sqlSkills = await connection.query(`SELECT * FROM skills WHERE skillID = 1`);
        let embedSkills = new Discord.EmbedBuilder()
            .setDescription(`Nome: ${sqlSkills[0][0].name}\nPoder: ${sqlSkills[0][0].powerbase}\nElemento: ${sqlSkills[0][0].element}`)
        msg.edit({ embeds: [embedSkills], components: [manageActionRow] });
    } catch(e) {
        console.log(e);
    }
}