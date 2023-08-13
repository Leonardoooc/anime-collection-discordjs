const Discord = require("discord.js");
const { trades } = require ('./t.js');

module.exports =  {
    name: 'tref',
    aliases: ['traderefuse'],
    async execute(client, message, args) {
        if (trades[message.author.id] && trades[message.author.id].status !== 'trading') {
            message.reply({ content: `Troca entre o <@${trades[message.author.id].partner}> e ${message.author} cancelada.` });
            let partnerID = trades[message.author.id].partner;
            delete trades[message.author.id];
            delete trades[partnerID];            
        } else {
            message.reply({ content: 'Não há nenhuma trade para recusar, ou ela está em andamento (utilize /tab para cancelar). '});
        }
    }
}