const Discord = require("discord.js");
const { trades } = require ('./t.js');

module.exports =  {
    name: 'trm',
    aliases: ['traderemove'],
    async execute(client, message, args) {
        let input = args.slice(0).join(" ");
        const inputIds = input.split(' ');
        if (trades[message.author.id] && trades[message.author.id].status !== 'trading') {
            return message.reply({ content: 'Você não está em uma troca no momento. '});
        } else if (trades[message.author.id] && trades[message.author.id].status === 'trading') {
            //security in trade system
            if (trades[message.author.id].acceptStatus === 'accepted' || trades[trades[message.author.id].partner].acceptStatus === 'accepted') {
                trades[message.author.id].acceptStatus = 'no';
                trades[trades[message.author.id].partner].acceptStatus = 'no';
                let tEmbed = trades[message.author.id].tEmbed
                let nDescription = tEmbed.data.description;
                let partnerID = trades[message.author.id].partner;
                if (nDescription.includes(`${message.author.id}> ✅`)) {
                    nDescription = nDescription.replace(`${message.author.id}> ✅`, `${message.author.id}>`);
                } else if (nDescription.includes(`${partnerID}> ✅`)) {
                    nDescription = nDescription.replace(`${partnerID}> ✅`, `${partnerID}>`);
                }
                let embedNew = new Discord.EmbedBuilder(tEmbed)
                    .setDescription(nDescription)
                let newIt = trades[message.author.id].tInteraction.edit({ embeds: [embedNew] });
                trades[message.author.id].tEmbed = embedNew;
                trades[trades[message.author.id].partner].tEmbed = embedNew;
            }
            if (trades[message.author.id].acceptStatus === 'ending' || trades[trades[message.author.id].partner].acceptStatus === 'ending') {
                return message.reply({ content: 'Finalizando troca, aguarde.' });
            }

            const values = Object.values(inputIds);

            const isDuplicated = values.some((value, index) => values.indexOf(value) !== index);
            if (isDuplicated) return message.reply({ content: 'Você só pode remover o ID uma vez.' });

            let inTradeValues = trades[message.author.id].charIDs;
            let globalIDvalues = trades[message.author.id].globalIDs;
            if (inTradeValues.length == 0) return message.reply({ content: 'Não há personagens para remover. '}); 

            if (values.every(value => inTradeValues.includes(value))) {
                try {
                    var connection = require('../database/connect.js');
                    let globalIDs = [];
                    let rarities = [];
                    let localIDs = [];
                    let charIDs = [];

                    let existingInventory = await connection.query(`SELECT localID, globalID, rarity, charID FROM inventory WHERE userID = ${message.author.id}`);
                    existingInventory = existingInventory[0].reduce((acc, item) => {
                        acc[item.localID] = item;
                        return acc;
                    }, {});


                    //pegando localIds, globalids, raridades e charid
                    for (i=0;i<inputIds.length;i++) {
                        if (typeof inputIds[i] !== 'number' && isNaN(inputIds[i])) return message.reply({ content: 'LocalID inválido.' });
                        if (!existingInventory[inputIds[i]]) return message.reply({ content: 'LocalID inválido.' });
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
                    let charsInTradeList = trades[message.author.id].chars;
                    for (i=0;i<charList.length;i++) {
                        if (rarities[i] == 1) rarityName = '[D]';
                        if (rarities[i] == 2) rarityName = '[C]';
                        if (rarities[i] == 3) rarityName = '[B]';
                        if (rarities[i] == 4) rarityName = '[A]';
                        if (rarities[i] == 5) rarityName = '[S]';
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

                    trades[message.author.id].charIDs = inTradeValues;
                    trades[message.author.id].globalIDs = globalIDvalues;
                    
                    let tEmbed = trades[message.author.id].tEmbed
                    let nDescription = tEmbed.data.description;
                    if (trades[message.author.id].isHost) {
                        nDescription = `${trades[message.author.id].host}${charsInTradeList}\n${trades[message.author.id].guest}${trades[trades[message.author.id].partner].chars}`;
                    } else {
                        nDescription = `${trades[message.author.id].host}${trades[trades[message.author.id].partner].chars}\n${trades[message.author.id].guest}${charsInTradeList}`;
                    }
                    
                    let newEmbed = new Discord.EmbedBuilder(tEmbed)
                        .setDescription(nDescription)
                    
                    let newIt = trades[message.author.id].tInteraction.edit({ embeds: [newEmbed] });

                    trades[message.author.id].chars = charsInTradeList;
                    trades[message.author.id].tEmbed = newEmbed;
                    trades[trades[message.author.id].partner].tEmbed = newEmbed;
                
                    message.reply({ content: 'Personagens removidos da troca com sucesso. '});
                } catch (error) {
                    console.error(error);
                }
                
            } else {
                return message.reply({ content: 'Algum ID não está presente na troca.' });
            }

        }
    }
}