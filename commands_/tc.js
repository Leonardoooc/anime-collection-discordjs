const Discord = require("discord.js");
const { SlashCommandBuilder } = require('@discordjs/builders');
const { trades } = require ('./t.js');

module.exports =  {
    data: new SlashCommandBuilder()
        .setName('tc')
        .setDescription('tc'),
    async execute(interaction, client) {
        return;
        if (trades[interaction.user.id] && trades[interaction.user.id].status !== 'trading') {
            return interaction.reply({ content: 'Você não está em uma troca no momento. '});
        } else if (trades[interaction.user.id] && trades[interaction.user.id].status === 'trading') {
            if (trades[interaction.user.id].charIDs.length == 0 && trades[trades[interaction.user.id].partner].charIDs.length == 0) {
                return interaction.reply({ content: 'Você não pode aceitar uma troca que não envolve nenhum personagem. '});
            }
            if (trades[trades[interaction.user.id].partner].acceptStatus === 'accepted') {
                trades[interaction.user.id].acceptStatus = 'ending';
                trades[trades[interaction.user.id].partner].acceptStatus = 'ending';

                //parte Executor
                try {
                    var connection = require('../database/connect.js');

                    //executor sent chars
                    let charIDs = trades[interaction.user.id].charIDs;
                    let globalIDs = trades[interaction.user.id].globalIDs;
                    let partnerID = trades[interaction.user.id].partner;
                    
                    for (i=0;i<globalIDs.length;i++) {
                        var sqlCheckMaxId = `SELECT MAX(localID) as max from inventory WHERE userID = ${partnerID}`;
                        const maxID = await connection.query(sqlCheckMaxId);
                        let idToPut;
                        if (maxID[0][0].max == null) {
                            idToPut = 0;
                        } else {
                            idToPut = maxID[0][0].max + 1;
                        }
                        var sqlChangeOwner = `UPDATE inventory SET userID = ${partnerID}, localID = ${idToPut}, favorite = NULL WHERE globalID = ${globalIDs[i]}`;
                        await connection.query(sqlChangeOwner);
                        for (j=0;j<charIDs.length;j++) {
                            if (charIDs[j] > charIDs[i]) charIDs[j] = charIDs[j]-1;
                        }
                        var sqlSequentialID = `UPDATE inventory SET localID = localID - 1 WHERE localID > ${charIDs[i]} AND userID = ${interaction.user.id}`;
                        await connection.query(sqlSequentialID);
                    }

                    //other part sent chars
                    charIDs = trades[partnerID].charIDs;
                    globalIDs = trades[partnerID].globalIDs;
                    newPartnerID = trades[partnerID].partner;

                    for (i=0;i<globalIDs.length;i++) {
                        var sqlCheckMaxId = `SELECT MAX(localID) as max from inventory WHERE userID = ${newPartnerID}`;
                        const maxID = await connection.query(sqlCheckMaxId);
                        let idToPut;
                        
                        if (maxID[0][0].max == null) {
                            idToPut = 0;
                        } else {
                            idToPut = maxID[0][0].max + 1;
                        }
                        
                        var sqlChangeOwner = `UPDATE inventory SET userID = ${newPartnerID}, localID = ${idToPut}, favorite = NULL WHERE globalID = ${globalIDs[i]}`;
                        await connection.query(sqlChangeOwner);
                        for (j=0;j<charIDs.length;j++) {
                            if (charIDs[j] > charIDs[i]) charIDs[j] = charIDs[j]-1;
                        }
                        var sqlSequentialID = `UPDATE inventory SET localID = localID - 1 WHERE localID > ${charIDs[i]} AND userID = ${partnerID}`;
                        await connection.query(sqlSequentialID);
                    }

                    let tEmbed = trades[interaction.user.id].tEmbed;
                    let nDescription = tEmbed.data.description;
                    
                    nDescription = nDescription.replace(`${interaction.user.id}>`, `${interaction.user.id}> ✅`);
                    
                    
                    let embedNew = new Discord.EmbedBuilder(tEmbed)
                        .setDescription(nDescription)
                        .setColor('Green')
                        .setFooter({ text: 'Status: Troca concluída com sucesso.'});
                    trades[interaction.user.id].tInteraction.editReply({ embeds: [embedNew] });

                    interaction.reply({ content: `Troca entre <@${partnerID}> e ${interaction.user} concluída com sucesso.` });

                    delete trades[interaction.user.id];
                    delete trades[partnerID];
                    
                } catch (error) {
                    console.error(error);
                }
                
            } else if (trades[interaction.user.id].acceptStatus === 'no') {
                trades[interaction.user.id].acceptStatus = 'accepted';
                let tEmbed = trades[interaction.user.id].tEmbed;
                let nDescription = tEmbed.data.description;
                
                nDescription = nDescription.replace(`${interaction.user.id}>`, `${interaction.user.id}> ✅`);
                
                
                let embedNew = new Discord.EmbedBuilder(tEmbed)
                    .setDescription(nDescription)
                trades[interaction.user.id].tInteraction.editReply({ embeds: [embedNew] });

                trades[interaction.user.id].tEmbed = embedNew;
                trades[trades[interaction.user.id].partner].tEmbed = embedNew;

                interaction.reply({ content: 'Troca confirmada, aguardando a outra parte. '});
            } else {
                interaction.reply({ content: 'Concluindo troca, aguarde...' });
            }
        } else {
            interaction.reply({ content: 'Não há nenhuma troca para aceitar.' });
        }

    }
}