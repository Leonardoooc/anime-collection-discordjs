const Discord = require("discord.js");
const { trades } = require ('./t.js');

module.exports =  {
    name: 'tc',
    aliases: ['tradeconfirm'],
    async execute(client, message, args) {
        if (trades[message.author.id] && trades[message.author.id].status !== 'trading') {
            return message.reply({ content: 'Você não está em uma troca no momento. '});
        } else if (trades[message.author.id] && trades[message.author.id].status === 'trading') {
            if (trades[message.author.id].charIDs.length == 0 && trades[trades[message.author.id].partner].charIDs.length == 0) {
                return message.reply({ content: 'Você não pode aceitar uma troca que não envolve nenhum personagem. '});
            }
            if (trades[trades[message.author.id].partner].acceptStatus === 'accepted') {
                trades[message.author.id].acceptStatus = 'ending';
                trades[trades[message.author.id].partner].acceptStatus = 'ending';

                //parte Executor
                try {
                    var connection = require('../database/connect.js');

                    //executor sent chars
                    let charIDs = trades[message.author.id].charIDs;
                    let globalIDs = trades[message.author.id].globalIDs;
                    let partnerID = trades[message.author.id].partner;
                    
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
                        var sqlSequentialID = `UPDATE inventory SET localID = localID - 1 WHERE localID > ${charIDs[i]} AND userID = ${message.author.id}`;
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

                    let tEmbed = trades[message.author.id].tEmbed;
                    let nDescription = tEmbed.data.description;
                    
                    nDescription = nDescription.replace(`${message.author.id}>`, `${message.author.id}> ✅`);
                    
                    
                    let embedNew = new Discord.EmbedBuilder(tEmbed)
                        .setDescription(nDescription)
                        .setColor('Green')
                        .setFooter({ text: 'Status: Troca concluída com sucesso.'});
                    trades[message.author.id].tInteraction.edit({ embeds: [embedNew] });

                    message.reply({ content: `Troca entre <@${partnerID}> e ${message.author} concluída com sucesso.` });

                    delete trades[message.author.id];
                    delete trades[partnerID];
                    
                } catch (error) {
                    console.error(error);
                }
                
            } else if (trades[message.author.id].acceptStatus === 'no') {
                trades[message.author.id].acceptStatus = 'accepted';
                let tEmbed = trades[message.author.id].tEmbed;
                let nDescription = tEmbed.data.description;
                
                nDescription = nDescription.replace(`${message.author.id}>`, `${message.author.id}> ✅`);
                
                
                let embedNew = new Discord.EmbedBuilder(tEmbed)
                    .setDescription(nDescription)
                trades[message.author.id].tInteraction.edit({ embeds: [embedNew] });

                trades[message.author.id].tEmbed = embedNew;
                trades[trades[message.author.id].partner].tEmbed = embedNew;

                message.reply({ content: 'Troca confirmada, aguardando a outra parte. '});
            } else {
                message.reply({ content: 'Concluindo troca, aguarde...' });
            }
        } else {
            message.reply({ content: 'Não há nenhuma troca para aceitar.' });
        }
    }
}