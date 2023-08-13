const Discord = require("discord.js");

module.exports =  {
    name: 'i',
    aliases: ['info'],
    async execute(client, message, args) {
        let input = args.slice(0).join(" ");
        try {
            var sqlSearch;
            if (Number.isInteger(parseInt(input))) {
                sqlSearch = `SELECT * FROM characters WHERE charID = ${parseInt(input)}`;
            } else {
                sqlSearch = `SELECT * FROM characters WHERE name LIKE '%${input}%'`;
            }
            var connection = require('../database/connect.js');
            const checkResults = await connection.query(sqlSearch);
            
            if (checkResults[0].length == 0) {
                return message.reply({ content: 'Nome ou ID incorreto.' });
            }
            
            //procura nome da série do personagem
            var sqlSeries = `SELECT * FROM series WHERE seriesID = ${checkResults[0][0].seriesID}`;
            const series = await connection.query(sqlSeries);
            let seriesName = series[0][0].name;
            let seriesID = series[0][0].seriesID;

            //procura quantidade de wishes
            var sqlWishlistCount = `SELECT COUNT(*) as count FROM wishlist WHERE charID = ${checkResults[0][0].charID}`;
            const wishlistCount = await connection.query(sqlWishlistCount);

            let wishlist = wishlistCount[0][0].count;

            let embed = new Discord.EmbedBuilder()
                .setTitle(`${checkResults[0][0].name}`)
                .setDescription(`ID: ${checkResults[0][0].charID}\nSérie: (${seriesID}) ${seriesName}`)

            const [picResults] = await connection.query(`SELECT picID, link FROM pictures WHERE charID = ${checkResults[0][0].charID}`);
            /*const randomIndexPic = Math.floor(Math.random() * picResults.length);
            picID = picResults[randomIndexPic].picID;
            const picUrl = picResults[randomIndexPic].link;*/


            // sistema de paginação
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


            const itemsPerPage = 1;

            let start = 0;
            let end = itemsPerPage;

            const embeds = [];

            while (start < picResults.length) {
                const currentPagePics = picResults.slice(start, end);

                const currentPageEmbed = new Discord.EmbedBuilder()
                    .setTitle(`${checkResults[0][0].name}`)
                    .setDescription(`ID: ${checkResults[0][0].charID}\nSérie: (${seriesID}) ${seriesName}\nWishlist: ${wishlist}`)
                    .setImage(currentPagePics[0].link)

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


            //interaction.reply({ embeds: [embed] });

        } catch (error) {
            console.error(error);
        }
    }
}