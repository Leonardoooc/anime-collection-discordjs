const Discord = require("discord.js");
const { trades } = require ('./t.js');

module.exports =  {
    name: 'tab',
    aliases: ['tradeabort'],
    async execute(client, message, args) {
        if (trades[message.author.id] && trades[message.author.id].status !== 'trading') {
            return message.reply({ content: 'Não há nenhuma troca em andamento para cancelar, caso seja convidado de uma troca, utilize /tref para recusar.'});
        } else if (trades[message.author.id] && trades[message.author.id].status === 'trading') {
            let partnerID = trades[message.author.id].partner;
            
            message.reply({ content: `Troca entre <@${partnerID}> e ${message.author} cancelada.` });

            let tEmbed = trades[message.author.id].tEmbed
            let nDescription = tEmbed.data.description;
            if (nDescription.includes(`${message.author.id}> ✅`)) {
                nDescription = nDescription.replace(`${message.author.id}> ✅`, `${message.author.id}> ❌`);
            } else {
                nDescription = nDescription.replace(`${message.author.id}>`, `${message.author.id}> ❌`);
            }
            
            let embedNew = new Discord.EmbedBuilder(tEmbed)
                .setColor('DarkRed')
                .setDescription(nDescription)
                .setFooter({ text: 'Status: Cancelado. '});
            let newIt = trades[message.author.id].tInteraction.edit({ embeds: [embedNew] });
            


            delete trades[partnerID];
            delete trades[message.author.id];

        } else {
            return message.reply({ content: 'Não há nenhuma troca para cancelar, caso seja convidado de uma troca, utilize /tref para recusar.' });
        }
    }
}