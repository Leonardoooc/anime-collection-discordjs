const Discord = require("discord.js");
const { SlashCommandBuilder } = require('@discordjs/builders');
const { trades } = require ('./t.js');

module.exports =  {
    data: new SlashCommandBuilder()
        .setName('tref')
        .setDescription('tref'),
    async execute(interaction, client) {
        return;
        if (trades[interaction.user.id] && trades[interaction.user.id].status !== 'trading') {
            interaction.reply({ content: `Troca entre o <@${trades[interaction.user.id].partner}> e ${interaction.user} cancelada.` });
            let partnerID = trades[interaction.user.id].partner;
            delete trades[interaction.user.id];
            delete trades[partnerID];            
        } else {
            interaction.reply({ content: 'Não há nenhuma trade para recusar, ou ela está em andamento (utilize /tab para cancelar). '});
        }
    }
}