const Discord = require("discord.js");

module.exports =  {
    name: 'w',
    aliases: ['wishlist'],
    async execute(client, message, args) {
        let input = args[0];

        if (input !== undefined) {
            if (typeof input !== 'number' && isNaN(input)) return message.reply({ content: 'Forneça um ID válido.' });
            if (input.toString().length !== 18) return message.reply({ content: 'Forneça um ID válido.' });
        }
        
        try {
            var connection = require('../database/connect.js');
            if (input === undefined) var sqlSearchWish = `SELECT * FROM wishlist WHERE userID = ${message.author.id}`;
                else var sqlSearchWish = `SELECT * FROM wishlist WHERE userID = ${input}`;
            const searchWish = await connection.query(sqlSearchWish);
            if (searchWish[0].length == 0) return message.reply({ content: 'Não há nenhum Wish registrado em personagens.' });
            
            //procura o ID dos char e nome
            let charList = [];
            let promises = [];
            let rarity = [];
            let charID = [];
            for (i=0;i<searchWish[0].length;i++) {
                var sqlCharName = `SELECT name FROM characters WHERE charID = ${searchWish[0][i].charID}`;
                if (searchWish[0][i].rarity === null) rarity.push(' ');
                    else rarity.push(searchWish[0][i].rarity);
                charID.push(searchWish[0][i].charID);
                promises.push(connection.query(sqlCharName)
                    .then(results => {
                        charList.push(results[0][0].name);
                    })
                    .catch(error => {
                        throw error;
                }));
            }
            await Promise.all(promises);


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


            let rarityName;
            const itemsPerPage = 10;

            let start = 0;
            let end = itemsPerPage;

            const embeds = [];

            let formatation = '`';

            while (start < charList.length) {
                const currentPageItems = charList.slice(start, end);
                const currentPageRarity = rarity.slice(start, end);
                const currentPageId = charID.slice(start, end);


                let description = '';
                for (let i = 0; i < currentPageItems.length; i++) {
                    if (currentPageRarity[i] === 1) rarityName = "[D]";
                    if (currentPageRarity[i] === 2) rarityName = "[C]";  
                    if (currentPageRarity[i] === 3) rarityName = "[B]";
                    if (currentPageRarity[i] === 4) rarityName = "[A]";
                    if (currentPageRarity[i] === 5) rarityName = "[S]";
                    if (currentPageRarity[i] === ' ') rarityName = '';
                    description += `${rarityName} ${formatation}${currentPageItems[i]}${formatation} (${currentPageId[i]})\n`;
                }

                const currentPageEmbed = new Discord.EmbedBuilder()
                    .setTitle(`Wishlist: ${searchWish[0][0].userID}`)
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