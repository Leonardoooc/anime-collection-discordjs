const Discord = require("discord.js");
const { SlashCommandBuilder } = require('@discordjs/builders');
const { trades } = require ('./t.js');

module.exports =  {
    data: new SlashCommandBuilder()
        .setName('tac')
        .setDescription('tac'),
    async execute(interaction, client) {
        return;
        if (trades[interaction.user.id] && trades[interaction.user.id].status === 'sent') {
            return interaction.reply({ content: 'Você não pode aceitar uma solicitação de troca que você mesmo enviou.' });
        } else if (trades[interaction.user.id] && trades[interaction.user.id].status === 'pending') {
            if (trades[interaction.user.id].chat !== interaction.channel.id) {
                return interaction.reply({ content: `Você só pode aceitar uma troca no mesmo canal que ela foi enviada <#${trades[interaction.user.id].chat}>` });
            }
            
            let id1 = trades[interaction.user.id].partner;
            let id2 = interaction.user.id;

            let embedTroca = new Discord.EmbedBuilder()
                .setTitle(`Troca de Personagens`)
                .setDescription(`**Host:** <@${id1}>\nNenhum\n\n**Convidado:** <@${id2}>\nNenhum`)
                .setColor('DarkGold')
                .setFooter({ text: `Status: Adicionando personagens.` })
            let chars1 = `Nenhum`;
            let host = `**Host:** <@${id1}>\n`;
            let guest = `**Convidado:** <@${id2}>\n`;
            let msgTroca = await interaction.reply({ embeds: [embedTroca] });

            trades[interaction.user.id].tInteraction = interaction;
            trades[trades[interaction.user.id].partner].tInteraction = interaction;

            trades[interaction.user.id].tEmbed = embedTroca;
            trades[trades[interaction.user.id].partner].tEmbed = embedTroca;

            trades[interaction.user.id].status = 'trading';
            trades[trades[interaction.user.id].partner].status = 'trading';

            trades[interaction.user.id].chars = chars1;
            trades[trades[interaction.user.id].partner].chars = chars1;

            trades[interaction.user.id].host = host;
            trades[trades[interaction.user.id].partner].host = host;

            trades[interaction.user.id].guest = guest;
            trades[trades[interaction.user.id].partner].guest = guest;

        } else {
            interaction.reply({ content: 'Não há nenhuma solicitação de troca para aceitar.' });
        }
    }
}