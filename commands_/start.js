const Discord = require("discord.js");
const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports =  {
    data: new SlashCommandBuilder()
        .setName('start')
        .setDescription('start'),
    async execute(interaction, client) {
        return;

        //registra novo usuário, checando se ele já é registrado
        try {
            var connection = require('../database/connect.js');
            let results = await connection.query(`SELECT * FROM user WHERE userID = ?`, [interaction.user.id]);
            if (results[0].length > 0) {
                let embed = new Discord.EmbedBuilder()
                    .setTitle(`Você já utiliza o ThiefGami`)
                    .setColor('#FF0000')
                    .setDescription('Uma mensagem muito top aqui');
                interaction.reply({ embeds: [embed]});
            } else {
                await connection.query(`INSERT INTO user (userID, joined, coins) VALUES (?, ?, ?)`, [interaction.user.id, '2023-01-01', 15]);
                console.log("Novo usuário registrado: ", interaction.user.id);
                let embed = new Discord.EmbedBuilder()
                    .setTitle(`Bem-vindo ao ThiefGami`)
                    .setColor('#00FF00')
                    .setDescription('Uma mensagem muito top aqui');
                interaction.reply({ embeds: [embed]});
            }
        } catch (error) {
            console.error(error);
        }
    }
}