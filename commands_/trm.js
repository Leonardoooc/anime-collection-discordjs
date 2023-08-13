const Discord = require("discord.js");
const { SlashCommandBuilder } = require('@discordjs/builders');
const { trades } = require ('./t.js');

module.exports =  {
    data: new SlashCommandBuilder()
        .setName('trm')
        .setDescription('trm')
        .addStringOption(option => option.setName('ids').setDescription('input').setRequired(true)),
    async execute(interaction, client) {
        return;
        let input = interaction.options.getString('ids');
        const inputIds = input.split(' ');
        if (trades[interaction.user.id] && trades[interaction.user.id].status !== 'trading') {
            return interaction.reply({ content: 'Você não está em uma troca no momento. '});
        } else if (trades[interaction.user.id] && trades[interaction.user.id].status === 'trading') {
            //verificação fudida pra se algm tiver aceito e trocar personagem, tirar o aceito e continuar a trade
            if (trades[interaction.user.id].acceptStatus === 'accepted' || trades[trades[interaction.user.id].partner].acceptStatus === 'accepted') {
                trades[interaction.user.id].acceptStatus = 'no';
                trades[trades[interaction.user.id].partner].acceptStatus = 'no';
                let tEmbed = trades[interaction.user.id].tEmbed
                let nDescription = tEmbed.data.description;
                let partnerID = trades[interaction.user.id].partner;
                if (nDescription.includes(`${interaction.user.id}> ✅`)) {
                    nDescription = nDescription.replace(`${interaction.user.id}> ✅`, `${interaction.user.id}>`);
                } else if (nDescription.includes(`${partnerID}> ✅`)) {
                    nDescription = nDescription.replace(`${partnerID}> ✅`, `${partnerID}>`);
                }
                let embedNew = new Discord.EmbedBuilder(tEmbed)
                    .setDescription(nDescription)
                let newIt = trades[interaction.user.id].tInteraction.editReply({ embeds: [embedNew] });
                trades[interaction.user.id].tEmbed = embedNew;
                trades[trades[interaction.user.id].partner].tEmbed = embedNew;
            }
            if (trades[interaction.user.id].acceptStatus === 'ending' || trades[trades[interaction.user.id].partner].acceptStatus === 'ending') {
                return interaction.reply({ content: 'Finalizando troca, aguarde.' });
            }

            const values = Object.values(inputIds);

            const isDuplicated = values.some((value, index) => values.indexOf(value) !== index);
            if (isDuplicated) return interaction.reply({ content: 'Você só pode remover o ID uma vez.' });

            let inTradeValues = trades[interaction.user.id].charIDs;
            let globalIDvalues = trades[interaction.user.id].globalIDs;
            if (inTradeValues.length == 0) return interaction.reply({ content: 'Não há personagens para remover. '}); 

            if (values.every(value => inTradeValues.includes(value))) {
                try {
                    var connection = require('../database/connect.js');
                    let globalIDs = [];
                    let rarities = [];
                    let localIDs = [];
                    let charIDs = [];

                    let existingInventory = await connection.query(`SELECT localID, globalID, rarity, charID FROM inventory WHERE userID = ${interaction.user.id}`);
                    existingInventory = existingInventory[0].reduce((acc, item) => {
                        acc[item.localID] = item;
                        return acc;
                    }, {});


                    //pegando localIds, globalids, raridades e charid
                    for (i=0;i<inputIds.length;i++) {
                        if (typeof inputIds[i] !== 'number' && isNaN(inputIds[i])) return interaction.reply({ content: 'LocalID inválido.' });
                        if (!existingInventory[inputIds[i]]) return interaction.reply({ content: 'LocalID inválido.' });
                        globalIDs.push(existingInventory[inputIds[i]].globalID);
                        rarities.push(existingInventory[inputIds[i]].rarity);
                        localIDs.push(existingInventory[inputIds[i]].localID);
                        charIDs.push(existingInventory[inputIds[i]].charID);
                    }

                    let charList = [];
                    let promises = [];
                    let description = '';
                    let rarityName;
    
                    
        
                    //busca os nomes
                    for (i=0;i<rarities.length;i++) {
                        var sqlCharName = `SELECT name FROM characters WHERE charID = ${charIDs[i]}`;
                        promises.push(connection.query(sqlCharName)
                            .then(results => {
                                charList.push(results[0][0].name);
                            })
                            .catch(error => {
                                throw error;
                        }));
                    }
                    await Promise.all(promises);

                    let formatation = '`'


                    //seta os personagens na embed de troca
                    let charsInTradeList = trades[interaction.user.id].chars;
                    for (i=0;i<charList.length;i++) {
                        if (rarities[i] == 1) rarityName = '[Comum]';
                        if (rarities[i] == 2) rarityName = '[Incomum]';
                        if (rarities[i] == 3) rarityName = '[Raro]';
                        if (rarities[i] == 4) rarityName = '[Épico]';
                        if (rarities[i] == 5) rarityName = '[Lendário]';
                        charsInTradeList = charsInTradeList.replace(`${formatation}${localIDs[i]}${formatation} ${rarityName} ${charList[i]}\n`, ``);
                        if (charsInTradeList.length < 4) charsInTradeList = 'Nenhum';
                    }

                    //remove os globalID e localID da troca
                    for (let i = 0; i < inputIds.length; i++) {
                        const index = inTradeValues.indexOf(inputIds[i]);
                        const index2 = globalIDvalues.indexOf(globalIDs[i]);
                        if (index !== -1) {
                          inTradeValues.splice(index, 1);
                        }
                        if (index2 !== -1) {
                            globalIDvalues.splice(index2, 1);
                        }
                    }

                    trades[interaction.user.id].charIDs = inTradeValues;
                    trades[interaction.user.id].globalIDs = globalIDvalues;
                    
                    let tEmbed = trades[interaction.user.id].tEmbed
                    let nDescription = tEmbed.data.description;
                    if (trades[interaction.user.id].isHost) {
                        nDescription = `${trades[interaction.user.id].host}${charsInTradeList}\n${trades[interaction.user.id].guest}${trades[trades[interaction.user.id].partner].chars}`;
                    } else {
                        nDescription = `${trades[interaction.user.id].host}${trades[trades[interaction.user.id].partner].chars}\n${trades[interaction.user.id].guest}${charsInTradeList}`;
                    }
                    
                    let newEmbed = new Discord.EmbedBuilder(tEmbed)
                        .setDescription(nDescription)
                    
                    let newIt = trades[interaction.user.id].tInteraction.editReply({ embeds: [newEmbed] });

                    trades[interaction.user.id].chars = charsInTradeList;
                    trades[interaction.user.id].tEmbed = newEmbed;
                    trades[trades[interaction.user.id].partner].tEmbed = newEmbed;
                
                    interaction.reply({ content: 'Personagens removidos da troca com sucesso. '});
                } catch (error) {
                    console.error(error);
                }
                
            } else {
                return interaction.reply({ content: 'Algum ID não está presente na troca.' });
            }

        }
        
    }
}