const Discord = require("discord.js");
const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports =  {
    data: new SlashCommandBuilder()
        .setName('inv')
        .setDescription('inv'),
    async execute(interaction, client) {
        return;
        try {
            var connection = require('../database/connect.js');
            var sqlSearchCoins = `SELECT * FROM user WHERE userID = ${interaction.user.id}`;
            const searchCoins = await connection.query(sqlSearchCoins);
            if (searchCoins[0].length == 0) {
                let embed = new Discord.EmbedBuilder()
                    .setTitle(`Novo usuário no ThiefGami`)
                    .setColor('#FFA500')
                    .setDescription('Inicie no ThiefGami utilizando o comando START');
                return interaction.reply({ embeds: [embed]});
            }

            //busca as infos de coins, qauntidade de personagens e claims únicos
            var sqlSearchChars = `SELECT * FROM inventory WHERE userID = ${interaction.user.id}`;
            const searchChars = await connection.query(sqlSearchChars);
            var sqlCountUnique = `SELECT COUNT(DISTINCT charID) as unq FROM inventory WHERE userID = ${interaction.user.id}`;
            const countUnique = await connection.query(sqlCountUnique);
            let embedInv = new Discord.EmbedBuilder()
                .setTitle(`${interaction.user.username}`)
                .setColor('DarkAqua')
                .addFields(
                    { name: 'Coins', value: `${searchCoins[0][0].coins}`, inline: true },
                    { name: 'Total de Personagens', value: `${searchChars[0].length}`, inline: true },
                    { name: 'Personagens únicos', value: `${countUnique[0][0].unq}`, inline: true },
                )
            interaction.reply({ embeds: [embedInv] });

        } catch (error) {
            console.error(error);
        }
    }
}