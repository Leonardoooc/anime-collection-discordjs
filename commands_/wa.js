const Discord = require("discord.js");
const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports =  {
    data: new SlashCommandBuilder()
        .setName('wa')
        .setDescription('wa')
        .addStringOption(option => option.setName('input').setDescription('id/name').setRequired(true))
        .addStringOption(option => option.setName('rarity').setDescription('rarity')),
    async execute(interaction, client) {
        return;
        let input = interaction.options.getString('input');
        let rarity = interaction.options.getString('rarity');
        if (rarity !== null) {
            if (typeof rarity !== 'number' && isNaN(rarity)) return interaction.reply({ content: 'Raridade inválida, utilize de 1 a 5.' });
            if (rarity < 1 || rarity > 5) return interaction.reply({ content: 'Raridade inválida, utilize de 1 a 5.' });
        }
        try {
            var connection = require('../database/connect.js');
            var sqlSearch;
            let checkResults;
            let charName;
            let formatation = '`';

            const checkQuery = `SELECT * FROM user WHERE userID = ?`;
            const checkValues = [interaction.user.id];
            const checkUser = await connection.query(checkQuery, checkValues);
      
            if (checkUser.length == 0) {
                let embed = new Discord.EmbedBuilder()
                    .setTitle(`Novo usuário no ThiefGami`)
                    .setColor('#FFA500')
                    .setDescription('Inicie no ThiefGami utilizando o comando START');
                return interaction.reply({ embeds: [embed]});
            }
      

            //checa se foi dado ID ou nome para procurar de acordo
            if (Number.isInteger(parseInt(input))) {
                sqlSearch = `SELECT * FROM characters WHERE charID = ${parseInt(input)}`;
                checkResults = await connection.query(sqlSearch);
                if (checkResults[0].length == 0) {
                    return interaction.reply({ content: 'Nome ou ID incorreto.' });
                }
                charName = checkResults[0][0].name;
            } else {
                sqlSearch = `SELECT * FROM characters WHERE LOWER(name) = LOWER('${input}')`;
                checkResults = await connection.query(sqlSearch);
                if (checkResults[0].length == 0) return interaction.reply({ content: 'Nome ou ID incorreto.' });
                charName = checkResults[0][0].name;
                if (checkResults[0].length > 1) return interaction.reply({ content: `Há mais de um personagem com o nome ${formatation}${charName}${formatation}, por favor utilize seu ID.` });
            }

            //checa se esse personagem já tem wish seu, se tiver ele remove, se não adiciona
            var sqlCheckIfWished = `SELECT * FROM wishlist WHERE userID = ${interaction.user.id} AND charID = ${checkResults[0][0].charID}`;
            const checkIfWished = await connection.query(sqlCheckIfWished);
            if (checkIfWished[0].length > 0) {
                var sqlRemoveWish = `DELETE FROM wishlist WHERE userID = ${interaction.user.id} AND charID = ${checkResults[0][0].charID}`;
                const removeWish = await connection.query(sqlRemoveWish);
                return interaction.reply({ content: `Personagem ${formatation}${charName}${formatation} removido da sua wishlist.` });
            }
            if (rarity !== null) var sqlInsertWish = `INSERT INTO wishlist (rarity, charID, userID) VALUES (${rarity}, ${checkResults[0][0].charID}, ${interaction.user.id})`;
                else var sqlInsertWish = `INSERT INTO wishlist (charID, userID) VALUES (${checkResults[0][0].charID}, ${interaction.user.id})`;
            const insertWish = await connection.query(sqlInsertWish);

            interaction.reply({ content: `Personagem ${formatation}${charName}${formatation} adicionado a wishlist.` });

        } catch (error) {
            console.error(error);
        }
    }
}