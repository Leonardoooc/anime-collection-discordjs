const Discord = require("discord.js");

module.exports =  {
    name: 'l',
    aliases: ['list'],
    async execute(client, message, args) {
        let input = args.slice(0).join(" ");
        try {
            var connection = require('../database/connect.js');
            let final;

            //infinitas variáveis caso existam
            if (input !== undefined) {
                const queryArgs = input.split(' ');
                const queryObject = {};
                let currentKey = null;
                let currentValue = [];
                for (let i = 0; i < queryArgs.length; i++) {
                const arg = queryArgs[i];
                if (arg.startsWith('-')) {
                    if (currentKey) {
                    queryObject[currentKey] = currentValue.join(' ');
                    }
                    currentKey = arg.substr(1);
                    currentValue = [];
                } else {
                    currentValue.push(arg);
                }
                }
                if (currentKey) {
                queryObject[currentKey] = currentValue.join(' ');
                }

                // Construir a consulta SQL com base no objeto
                let sql = 'SELECT * FROM inventory WHERE 1';
                if (queryObject.hasOwnProperty('user')) {
                    sql += ` AND userID = ${queryObject.user}`;
                } else {
                    sql += ` AND userID = ${message.author.id}`;
                }
                if (queryObject.hasOwnProperty('favorite')) {
                    sql += ` AND favorite = '${queryObject.favorite}'`;
                }
                if (queryObject.hasOwnProperty('series')) {
                    if (Number.isInteger(parseInt(queryObject.series))) {
                        
                        // se a série foi dada com um ID, procura pelo ID
                        var sqlSeriesSearch = `SELECT * FROM characters WHERE seriesID = ${queryObject.series}`
                        const searchSeries = await connection.query(sqlSeriesSearch);
                        if (searchSeries[0].length == 0) return message.reply({ content: 'Nenhum personagem encontrado com essa série.' });
                        let charIDList = [];
                        for (i=0;i<searchSeries[0].length;i++) {
                            charIDList.push(searchSeries[0][i].charID);
                        }
                        sql += ` AND charID IN (${charIDList.join(', ')})`;
                        
                    } else {
                        
                        // se foi dada como nome, procura como Nome
                        var sqlSeriesSearch = `SELECT * FROM series WHERE name LIKE '%${queryObject.series}%'`
                        const searchSeries = await connection.query(sqlSeriesSearch);
                        if (searchSeries[0].length == 0) return message.reply({ content: 'Nenhum personagem encontrado com essa série.' });
                        var sqlSeriesFS = `SELECT * FROM characters WHERE seriesID = ${searchSeries[0][0].seriesID}`
                        const searchSeriesFS = await connection.query(sqlSeriesFS);
                        let charIDList = [];
                        for(i=0;i<searchSeriesFS[0].length;i++) {
                            charIDList.push(searchSeriesFS[0][i].charID);
                        }
                        sql += ` AND charID IN (${charIDList.join(', ')})`;
                        
                    }
                }
                if (queryObject.hasOwnProperty('name')) {
                    if (Number.isInteger(parseInt(queryObject.name))) {
                        sql += ` AND charID = ${queryObject.name}`;
                    } else {
                        
                        // se foi procurado como NOME o personagem
                        var sqlSearchNames = `SELECT * FROM characters WHERE name LIKE ('%${queryObject.name}%')`;
                        const searchNames = await connection.query(sqlSearchNames);
                        let charNameList = [];
                        if (searchNames[0].length == 0) return message.reply({ content: 'Nenhum personagem encontrado com esse nome.' });
                        for (i=0;i<searchNames[0].length;i++) {
                            charNameList.push(searchNames[0][i].charID);
                        }
                        sql += ` AND charID IN (${charNameList.join(', ')})`;
                       
                    }
                }
                if (queryObject.hasOwnProperty('type')) {
                    sql += ` AND rarity = '${queryObject.type}'`;
                }
                if (queryObject.hasOwnProperty('wishlist')) {
                    var sqlWishes;
                    if (queryObject.wishlist === '') {
                        var sqlWishes = `SELECT * FROM wishlist WHERE userID = ${message.author.id}`
                    } else {
                        var sqlWishes = `SELECT * FROM wishlist WHERE userID = ${queryObject.wishlist}`
                    }
                    
                    //procura os personagens que tem na lista de wishes
                    const wishesSearch = await connection.query(sqlWishes);
                    if (wishesSearch[0].length == 0) message.reply({ content: 'Nenhum wish encontrado.' });
                    let wishesList = [];
                    for (i=0;i<wishesSearch[0].length;i++) {
                        wishesList.push(wishesSearch[0][i].charID);
                    }
                    sql += ` AND charID IN (${wishesList.join(', ')})`
                    
                }
                sql += ' ORDER BY localID';
                final = await connection.query(sql);
                if (final[0].length == 0) return message.reply({ content: 'Nenhum resultado encontrado para a busca. '});
            } else {
                var sqlSearch = "SELECT * FROM inventory WHERE userID = ? ORDER BY localID";
                var checkValues = [message.author.id];
                final = await connection.query(sqlSearch, checkValues);
                if (final[0].length == 0) return message.reply({ content: 'Nenhum resultado encontrado para a busca. '});
            }

            if (final[0].length == 0) {
                let embed = new Discord.EmbedBuilder()
                    .setTitle(`Novo usuário no ThiefGami`)
                    .setColor('#FFA500')
                    .setDescription('Inicie no ThiefGami utilizando o comando START');
                message.reply({ embeds: [embed]});
                return;
            } else {
                let charList = [];
                let promises = [];
                let localID = [];
                let rarity = [];
                let favorites = [];

                // puxa as infos dos personagens, nome, ids etc..
                for (i=0;i<final[0].length;i++) {
                    var sqlCharName = `SELECT name FROM characters WHERE charID = ${final[0][i].charID}`;
                    localID.push(final[0][i].localID);
                    rarity.push(final[0][i].rarity);
                    if (final[0][i].favorite === null) {
                        favorites.push(client.guilds.cache.get('601466842346815488').emojis.cache.find(emoji => emoji.name === 'invis'));
                    } else {
                        favorites.push(final[0][i].favorite);
                    }
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
                    const currentPageId = localID.slice(start, end);
                    const currentPageRarity = rarity.slice(start, end);
                    const currentPageFavorite = favorites.slice(start, end);
    

                    let description = '';
                    for (let i = 0; i < currentPageItems.length; i++) {
                        if (currentPageRarity[i] === 1) rarityName = "D";
                        if (currentPageRarity[i] === 2)rarityName = "C";  
                        if (currentPageRarity[i] === 3) rarityName = "B";
                        if (currentPageRarity[i] === 4) rarityName = "A";
                        if (currentPageRarity[i] === 5) rarityName = "S";
                        description += `${formatation}${currentPageId[i]}${formatation} ${currentPageFavorite[i]} [${rarityName}] ${formatation}${currentPageItems[i]}${formatation}\n`;
                    }

                    const currentPageEmbed = new Discord.EmbedBuilder()
                        .setTitle(`${message.author.username} - Lista de Personagens`)
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

            }
        } catch (error) {
            console.error(error);
        }
    }
}