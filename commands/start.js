const Discord = require("discord.js");

module.exports =  {
    name: 'start',
    async execute(client, message, args) {
        try {
            var connection = require('../database/connect.js');
            let results = await connection.query(`SELECT * FROM user WHERE userID = ?`, [message.author.id]);
            if (results[0].length > 0) {
                let embed = new Discord.EmbedBuilder()
                    .setTitle(`Você já utiliza o ThiefGami`)
                    .setColor('#FF0000')
                    .setDescription('Uma mensagem muito top aqui');
                message.reply({ embeds: [embed]});
            } else {
                await connection.query(`INSERT INTO user (userID, joined, coins) VALUES (?, ?, ?)`, [message.author.id, '2023-01-01', 15]);
                console.log("Novo usuário registrado: ", message.author.id);
                let embed = new Discord.EmbedBuilder()
                    .setTitle(`Bem-vindo ao ThiefGami`)
                    .setColor('#00FF00')
                    .setDescription('Uma mensagem muito top aqui');
                message.reply({ embeds: [embed]});
            }
        } catch (error) {
            console.error(error);
        }
    }
}
