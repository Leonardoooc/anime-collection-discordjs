const Discord = require("discord.js");
const executingUsers = {};
const { once } = require('events');
const { trades } = require ('./t.js');

module.exports =  {
    name: 'sc',
    aliases: ['serieschar'],
    async execute(client, message, args) {
        let input = args.slice(0).join(" ");
        try {
            var connection = require('../database/connect.js');
            var sqlSearch;
            let checkResults;
            let seriesName;

            //procura série eplo ID
            if (Number.isInteger(parseInt(input))) {
                sqlSearch = `SELECT * FROM characters WHERE seriesID = ${parseInt(input)}`;
                checkResults = await connection.query(sqlSearch);
                if (checkResults[0].length == 0) {
                    return message.reply({ content: 'Nome ou ID incorreto.' });
                }
                var sqlGetName = `SELECT * FROM series WHERE seriesID = ${checkResults[0][0].seriesID}`
                const getSeriesName = await connection.query(sqlGetName);
                if (getSeriesName[0].length == 0) return message.reply({ content: 'Nome ou ID incorreto.' });
                seriesName = getSeriesName[0][0].name;
            } else {
                //procura série pelo nome
                sqlSearch = `SELECT * FROM series WHERE name LIKE '%${input}%'`;
                const getChars = await connection.query(sqlSearch);
                if (getChars[0].length == 0) return message.reply({ content: 'Nome ou ID incorreto.' });
                seriesName = getChars[0][0].name;
                var sqlGetName = `SELECT * FROM characters WHERE seriesID = ${getChars[0][0].seriesID}`
                checkResults = await connection.query(sqlGetName);
                
            }

            if (checkResults[0].length == 0) {
                return message.reply({ content: 'Nome ou ID incorreto.' });
            }

            let names = [];
            let charID = [];
            //procura nome dos personagens daquela série
            for (i=0;i<checkResults[0].length;i++) {
                names.push(checkResults[0][i].name);
                charID.push(checkResults[0][i].charID);
            }

            //sistema de paginação
            const paginationEmbed = require('discordjs-v14-pagination-msg');

            const firstPageButton = new Discord.ButtonBuilder()
                .setCustomId('first')
                .setEmoji('1029435230668476476')
                .setStyle(Discord.ButtonStyle.Primary);

            const previousPageButton = new Discord.ButtonBuilder()
                .setCustomId('previous')
                .setEmoji('1029435199462834207')
                .setStyle(Discord.ButtonStyle.Primary);

            const nextPageButton = new Discord.ButtonBuilder()
                .setCustomId('next')
                .setEmoji('1029435213157240892')
                .setStyle(Discord.ButtonStyle.Primary);

            const lastPageButton = new Discord.ButtonBuilder()
                .setCustomId('last')
                .setEmoji('1029435238948032582')
                .setStyle(Discord.ButtonStyle.Primary);

            const buttons = [ firstPageButton, previousPageButton, nextPageButton, lastPageButton ];


            const itemsPerPage = 10;

            let start = 0;
            let end = itemsPerPage;

            const embeds = [];

            while (start < names.length) {
                const currentPageItems = names.slice(start, end);
                const currentPageId = charID.slice(start, end);

                let description = '';
                for (let i = 0; i < currentPageItems.length; i++) {
                    description += `(${currentPageId[i]}) - ${currentPageItems[i]}\n`;
                }

                const currentPageEmbed = new Discord.EmbedBuilder()
                    .setTitle(`(${checkResults[0][0].seriesID}) ${seriesName}`)
                    .setDescription(description);

                embeds.push(currentPageEmbed);

                start = end;
                end += itemsPerPage;
            }

            if (embeds.length > 1) {
                const pagination = paginationEmbed(
                    message, // The interaction object
                    embeds, // Your array of embeds
                    buttons, // Your array of buttons
                    300000, // (Optional) The timeout for the embed in ms, defaults to 60000 (1 minute)
                    'Página {current}/{total}' // (Optional) The text to display in the footer, defaults to 'Page {current}/{total}'
                );
            } else {
                message.reply({ embeds: embeds });
            }


            
        } catch (error) {
            console.error(error);
        }
    }
}