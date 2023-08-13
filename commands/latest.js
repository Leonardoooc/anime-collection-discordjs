const Discord = require("discord.js");

module.exports =  {
    name: 'latest',
    async execute(client, message, args) {
        try {
            var connection = require('../database/connect.js');
            const checkQuery = `SELECT * FROM inventory WHERE userID = ? AND localID = (SELECT MAX(localID) as max FROM inventory WHERE userID = ?)`;
            const checkValues = [message.author.id, message.author.id];
            const checkResults = await connection.query(checkQuery, checkValues);

            if (checkResults[0].length == 0) return message.reply({ content: 'Não há nenhum personagem registrado em sua conta.' });

            //busca a imagem
            var sqlPicture = `SELECT link FROM pictures WHERE picID = ${checkResults[0][0].picID}`;
            const url = await connection.query(sqlPicture);
        
            //busca o nome
            var sqlName = `SELECT * FROM characters WHERE charID = ${checkResults[0][0].charID}`;
            const name = await connection.query(sqlName);

            //busca a série
            var sqlSeries = `SELECT * FROM series WHERE seriesID = ${name[0][0].seriesID}`;
            const series = await connection.query(sqlSeries);

            let favorite;

            //busca o emoji cadastrado se tiver
            if (checkResults[0][0].favorite !== null) {
                favorite = checkResults[0][0].favorite;
            } else {
                favorite = 'Nenhum';
            }

            let rarityName;
            let color;

            if (checkResults[0][0].rarity === 1) rarityName = "D", color = 'Grey';
            if (checkResults[0][0].rarity === 2) rarityName = "C", color = 'Green';  
            if (checkResults[0][0].rarity === 3) rarityName = "B", color = 'Orange';
            if (checkResults[0][0].rarity === 4) rarityName = "A", color = 'Red';
            if (checkResults[0][0].rarity === 5) rarityName = "S", color = 'Aqua';

            let embed = new Discord.EmbedBuilder()
                .setTitle(`${name[0][0].name}`)
                .setDescription(`Categoria: ${favorite}\nLocalID: ${checkResults[0][0].localID}\nGlobalID: ${checkResults[0][0].globalID}\nWaifuID: ${checkResults[0][0].charID}\nRaridade: ${rarityName}\n\nSérie: (${series[0][0].seriesID}) ${series[0][0].name}`)
                .setColor(color)
                .setImage(url[0][0].link)
            message.reply({ embeds: [embed] });

        } catch (error) {
            console.error(error);
        }
    }
}