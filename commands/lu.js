const Discord = require("discord.js");

module.exports =  {
    name: 'lu',
    aliases: ['lookup'],
    async execute(client, message, args) {
        let input = args.slice(0).join(" ");
        try {

            //procura o nome pelo LU
            var connection = require('../database/connect.js');
            var sqlSearch = `SELECT * FROM characters WHERE name LIKE '%${input}%'`;
            const checkResult = await connection.query(sqlSearch);
            if (checkResult[0].length == 0) return message.reply({ content: 'Nenhum personagem encontrado.' });
            let names = [];
            let charID = [];
            
            for (i=0;i<checkResult[0].length;i++) {
                names.push(checkResult[0][i].name);
                charID.push(checkResult[0][i].charID);
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
                    .setTitle(`Pesquisa de Personagens`)
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