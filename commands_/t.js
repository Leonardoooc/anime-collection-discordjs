const Discord = require("discord.js");
const { SlashCommandBuilder } = require('@discordjs/builders');
const trades = {};

module.exports =  {
    data: new SlashCommandBuilder()
        .setName('t')
        .setDescription('t')
        .addUserOption(option => option.setName('mention').setDescription('user').setRequired(true)),
    async execute(interaction, client) {
        return;
        let user = interaction.options.getUser('mention');
        if (!user) return interaction.reply({ content: 'Usuário inválido. '});
        if (user.id === `${interaction.user.id}`) return interaction.reply({ content: 'Você não pode se mencionar. '});
        try {
            var connection = require('../database/connect.js');
            var sqlCheckIfExist = `SELECT * FROM inventory WHERE userID = ${user.id}`;
            const checkExists = await connection.query(sqlCheckIfExist);
            if (checkExists[0].length == 0) return interaction.reply({ content: 'Usuário mencionado sem personagens registrados.' });

            if (trades[user.id]) return interaction.reply({ content: 'Usuário já envolvido em uma troca no momento.' });
            
            for (const tradeId in trades) {
                const trade = trades[tradeId];
                if (trade.partner === interaction.user.id) {
                    return interaction.reply({ content: 'Você já está envolvido em uma troca no momento.'});
                }
            }

            trades[interaction.user.id] = {
                partner: user.id,
                status: 'sent',
                acceptStatus: 'no',
                chat: interaction.channel.id,
                lastUpdate: Date.now(),
                tInteraction: [],
                tEmbed: [],
                chars: '',
                host: '',
                guest: '',
                isHost: true,
                charIDs: [],
                globalIDs: []
            };
            trades[user.id] = {
                partner: interaction.user.id,
                status: 'pending',
                acceptStatus: 'no',
                chat: interaction.channel.id,
                lastUpdate: Date.now(),
                tInteraction: [],
                tEmbed: [],
                chars: '',
                host: '',
                guest: '',
                isHost: false,
                charIDs: [],
                globalIDs: []
            };


            interaction.reply({ content: `Uma solicitação de troca foi enviada de ${interaction.user} para ${user}, utilize /tac ou /tref`});
        }  catch (error) {
            console.error(error);
        }
    },
    trades
}