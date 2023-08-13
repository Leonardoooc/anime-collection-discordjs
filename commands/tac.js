const Discord = require("discord.js");
const { trades } = require ('./t.js');

module.exports =  {
    name: 'tac',
    aliases: ['tradeaccept'],
    async execute(client, message, args) {
        if (trades[message.author.id] && trades[message.author.id].status === 'sent') {
            return message.reply({ content: 'Você não pode aceitar uma solicitação de troca que você mesmo enviou.' });
        } else if (trades[message.author.id] && trades[message.author.id].status === 'pending') {
            if (trades[message.author.id].chat !== message.channel.id) {
                return message.reply({ content: `Você só pode aceitar uma troca no mesmo canal que ela foi enviada <#${trades[message.author.id].chat}>` });
            }
            
            let id1 = trades[message.author.id].partner;
            let id2 = message.author.id;

            let embedTroca = new Discord.EmbedBuilder()
                .setTitle(`Troca de Personagens`)
                .setDescription(`**Host:** <@${id1}>\nNenhum\n\n**Convidado:** <@${id2}>\nNenhum`)
                .setColor('DarkGold')
                .setFooter({ text: `Status: Adicionando personagens.` })
            let chars1 = `Nenhum`;
            let host = `**Host:** <@${id1}>\n`;
            let guest = `**Convidado:** <@${id2}>\n`;
            let msgTroca = await message.reply({ embeds: [embedTroca] });

            trades[message.author.id].tInteraction = msgTroca;
            trades[trades[message.author.id].partner].tInteraction = msgTroca;

            trades[message.author.id].tEmbed = embedTroca;
            trades[trades[message.author.id].partner].tEmbed = embedTroca;

            trades[message.author.id].status = 'trading';
            trades[trades[message.author.id].partner].status = 'trading';

            trades[message.author.id].chars = chars1;
            trades[trades[message.author.id].partner].chars = chars1;

            trades[message.author.id].host = host;
            trades[trades[message.author.id].partner].host = host;

            trades[message.author.id].guest = guest;
            trades[trades[message.author.id].partner].guest = guest;

        } else {
            message.reply({ content: 'Não há nenhuma solicitação de troca para aceitar.' });
        }
    }
}