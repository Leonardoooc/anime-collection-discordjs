const Discord = require("discord.js");
const trades = {};

module.exports =  {
    name: 't',
    aliases: ['trade'],
    async execute(client, message, args) {
        let user = message.mentions.users.first();
        if (!user) return message.reply({ content: 'Usuário inválido. '});
        if (user.id === `${message.author.id}`) return message.reply({ content: 'Você não pode se mencionar. '});
        try {
            var connection = require('../database/connect.js');
            var sqlCheckIfExist = `SELECT * FROM inventory WHERE userID = ${user.id}`;
            const checkExists = await connection.query(sqlCheckIfExist);
            if (checkExists[0].length == 0) return message.reply({ content: 'Usuário mencionado sem personagens registrados.' });

            if (trades[user.id]) return message.reply({ content: 'Usuário já envolvido em uma troca no momento.' });
            
            for (const tradeId in trades) {
                const trade = trades[tradeId];
                if (trade.partner === message.author.id) {
                    return message.reply({ content: 'Você já está envolvido em uma troca no momento.'});
                }
            }

            trades[message.author.id] = {
                partner: user.id,
                status: 'sent',
                acceptStatus: 'no',
                chat: message.channel.id,
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
                partner: message.author.id,
                status: 'pending',
                acceptStatus: 'no',
                chat: message.channel.id,
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


            message.reply({ content: `Uma solicitação de troca foi enviada de ${message.author} para ${user}, utilize /tac ou /tref`});
        }  catch (error) {
            console.error(error);
        }
    },
    trades
}