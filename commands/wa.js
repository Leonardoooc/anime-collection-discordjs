const Discord = require("discord.js");

module.exports =  {
    name: 'wa',
    aliases: ['wishlistadd', 'wishadd'],
    async execute(client, message, args) {
        let input = args[0];
        let rarity = args[1];
        if (rarity !== undefined) {
            if (typeof rarity !== 'number' && isNaN(rarity)) return message.reply({ content: 'Raridade inválida, utilize de 1 a 5.' });
            if (rarity < 1 || rarity > 5) return message.reply({ content: 'Raridade inválida, utilize de 1 a 5.' });
        }
        try {
            var connection = require('../database/connect.js');
            var sqlSearch;
            let checkResults;
            let charName;
            let formatation = '`';

            const checkQuery = `SELECT * FROM user WHERE userID = ?`;
            const checkValues = [message.author.id];
            const checkUser = await connection.query(checkQuery, checkValues);
      
            if (checkUser.length == 0) {
                let embed = new Discord.EmbedBuilder()
                    .setTitle(`Novo usuário no ThiefGami`)
                    .setColor('#FFA500')
                    .setDescription('Inicie no ThiefGami utilizando o comando START');
                return message.reply({ embeds: [embed]});
            }
      

            //checa se foi dado ID ou nome para procurar de acordo
            if (Number.isInteger(parseInt(input))) {
                sqlSearch = `SELECT * FROM characters WHERE charID = ${parseInt(input)}`;
                checkResults = await connection.query(sqlSearch);
                if (checkResults[0].length == 0) {
                    return message.reply({ content: 'Nome ou ID incorreto.' });
                }
                charName = checkResults[0][0].name;
            } else {
                sqlSearch = `SELECT * FROM characters WHERE LOWER(name) = LOWER('${input}')`;
                checkResults = await connection.query(sqlSearch);
                if (checkResults[0].length == 0) return message.reply({ content: 'Nome ou ID incorreto.' });
                charName = checkResults[0][0].name;
                if (checkResults[0].length > 1) return message.reply({ content: `Há mais de um personagem com o nome ${formatation}${charName}${formatation}, por favor utilize seu ID.` });
            }

            //checa se esse personagem já tem wish seu, se tiver ele remove, se não adiciona
            var sqlCheckIfWished = `SELECT * FROM wishlist WHERE userID = ${message.author.id} AND charID = ${checkResults[0][0].charID}`;
            const checkIfWished = await connection.query(sqlCheckIfWished);
            if (checkIfWished[0].length > 0) {
                var sqlRemoveWish = `DELETE FROM wishlist WHERE userID = ${message.author.id} AND charID = ${checkResults[0][0].charID}`;
                const removeWish = await connection.query(sqlRemoveWish);
                return message.reply({ content: `Personagem ${formatation}${charName}${formatation} removido da sua wishlist.` });
            }
            if (rarity !== undefined) var sqlInsertWish = `INSERT INTO wishlist (rarity, charID, userID) VALUES (${rarity}, ${checkResults[0][0].charID}, ${message.author.id})`;
                else var sqlInsertWish = `INSERT INTO wishlist (charID, userID) VALUES (${checkResults[0][0].charID}, ${message.author.id})`;
            const insertWish = await connection.query(sqlInsertWish);

            message.reply({ content: `Personagem ${formatation}${charName}${formatation} adicionado a wishlist.` });

        } catch (error) {
            console.error(error);
        }
    }
}