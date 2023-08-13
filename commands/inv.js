const Discord = require("discord.js");

module.exports =  {
    name: 'inv',
    aliases: ['inventory'],
    async execute(client, message, args) {
        try {
            var connection = require('../database/connect.js');
            var sqlSearchCoins = `SELECT * FROM user WHERE userID = ${message.author.id}`;
            const searchCoins = await connection.query(sqlSearchCoins);
            if (searchCoins[0].length == 0) {
                let embed = new Discord.EmbedBuilder()
                    .setTitle(`Novo usuário no ThiefGami`)
                    .setColor('#FFA500')
                    .setDescription('Inicie no ThiefGami utilizando o comando START');
                return message.reply({ embeds: [embed]});
            }

            //busca as infos de coins, qauntidade de personagens e claims únicos
            var sqlSearchChars = `SELECT * FROM inventory WHERE userID = ${message.author.id}`;
            const searchChars = await connection.query(sqlSearchChars);
            var sqlCountUnique = `SELECT COUNT(DISTINCT charID) as unq FROM inventory WHERE userID = ${message.author.id}`;
            const countUnique = await connection.query(sqlCountUnique);
            let embedInv = new Discord.EmbedBuilder()
                .setTitle(`${message.author.username}`)
                .setColor('DarkAqua')
                .addFields(
                    { name: 'Coins', value: `${searchCoins[0][0].coins}`, inline: true },
                    { name: 'Total de Personagens', value: `${searchChars[0].length}`, inline: true },
                    { name: 'Personagens únicos', value: `${countUnique[0][0].unq}`, inline: true },
                )
            let msg = await message.reply({ embeds: [embedInv] });

        } catch (error) {
            console.error(error);
        }
    }
}