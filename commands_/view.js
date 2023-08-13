const Discord = require("discord.js");
const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports =  {
    data: new SlashCommandBuilder()
        .setName('view')
        .setDescription('view')
        .addStringOption(option => option.setName('id').setDescription('localid').setRequired(true)),
    async execute(interaction, client) {
        return;
        let localID = interaction.options.getString('id');
        if (typeof localID !== 'number' && isNaN(localID)) return interaction.reply({ content: 'LocalID inválido.' });
        try {
            var connection = require('../database/connect.js');
            const checkQuery = `SELECT * FROM inventory WHERE userID = ? AND localID = ?`;
            const checkValues = [interaction.user.id, localID];
            const checkResults = await connection.query(checkQuery, checkValues);
            
            if (checkResults[0].length == 0) {
              return interaction.reply({ content: 'LocalID inválido.' });
            }


            //procura pic
            var sqlPicture = `SELECT link FROM pictures WHERE picID = ${checkResults[0][0].picID}`;
            const url = await connection.query(sqlPicture);

            //procura o nome do char
            var sqlName = `SELECT * FROM characters WHERE charID = ${checkResults[0][0].charID}`;
            const name = await connection.query(sqlName);

            //procura a série
            var sqlSeries = `SELECT * FROM series WHERE seriesID = ${name[0][0].seriesID}`;
            const series = await connection.query(sqlSeries);
            let rarityName;
            let color;

            if (checkResults[0][0].rarity === 1) rarityName = "Comum", color = 'Grey';
            if (checkResults[0][0].rarity === 2)rarityName = "Incomum", color = 'Green';  
            if (checkResults[0][0].rarity === 3) rarityName = "Raro", color = 'Orange';
            if (checkResults[0][0].rarity === 4) rarityName = "Épico", color = 'Red';
            if (checkResults[0][0].rarity === 5) rarityName = "Lendário", color = 'Aqua';

            let favorite;
            //procura o favorito se tiver
            if (checkResults[0][0].favorite !== null) {
                favorite = checkResults[0][0].favorite;
            } else {
                favorite = 'Nenhum';
            }

            let embed = new Discord.EmbedBuilder()
                .setTitle(`${name[0][0].name}`)
                .setDescription(`Categoria: ${favorite}\nLocalID: ${checkResults[0][0].localID}\nGlobalID: ${checkResults[0][0].globalID}\nWaifuID: ${checkResults[0][0].charID}\nRaridade: ${rarityName}\n\nSérie: (${series[0][0].seriesID}) ${series[0][0].name}`)
                .setColor(color)
                .setImage(url[0][0].link)
            interaction.reply({ embeds: [embed] });

        } catch (error) {
            console.error(error);
        }
    }
}