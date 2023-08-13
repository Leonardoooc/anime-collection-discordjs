const Discord = require("discord.js");
const { SlashCommandBuilder } = require('@discordjs/builders');
const { trades } = require ('./t.js');

module.exports =  {
    data: new SlashCommandBuilder()
        .setName('tab')
        .setDescription('tab'),
    async execute(interaction, client) {
        return;
        if (trades[interaction.user.id] && trades[interaction.user.id].status !== 'trading') {
            return interaction.reply({ content: 'Não há nenhuma troca em andamento para cancelar, caso seja convidado de uma troca, utilize /tref para recusar.'});
        } else if (trades[interaction.user.id] && trades[interaction.user.id].status === 'trading') {
            let partnerID = trades[interaction.user.id].partner;
            
            interaction.reply({ content: `Troca entre <@${partnerID}> e ${interaction.user} cancelada.` });

            let tEmbed = trades[interaction.user.id].tEmbed
            let nDescription = tEmbed.data.description;
            if (nDescription.includes(`${interaction.user.id}> ✅`)) {
                nDescription = nDescription.replace(`${interaction.user.id}> ✅`, `${interaction.user.id}> ❌`);
            } else {
                nDescription = nDescription.replace(`${interaction.user.id}>`, `${interaction.user.id}> ❌`);
            }
            
            let embedNew = new Discord.EmbedBuilder(tEmbed)
                .setColor('DarkRed')
                .setDescription(nDescription)
                .setFooter({ text: 'Status: Cancelado. '});
            let newIt = trades[interaction.user.id].tInteraction.editReply({ embeds: [embedNew] });
            


            delete trades[partnerID];
            delete trades[interaction.user.id];

        } else {
            return interaction.reply({ content: 'Não há nenhuma troca para cancelar, caso seja convidado de uma troca, utilize /tref para recusar.' });
        }
    }
}