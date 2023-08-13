const Discord = require("discord.js");
const { once } = require('events');
const { trades } = require ('./t.js');
const { executingUsers } = require('./rm.js');

module.exports =  {
    name: 'rml',
    aliases: ['removelatest'],
    async execute(client, message, args) {
        if (trades[message.author.id]) {
            if (trades[message.author.id].status === 'trading') {
                return message.reply({ content: 'Você não pode remover personagens enquanto realiza uma troca.' });
            }
        }
        for (const tradeId in trades) {
            const trade = trades[tradeId];
            if (trade.partner === message.author.id && trade.status === 'trading') {
                return message.reply({ content: 'Você não pode remover personagens enquanto realiza uma troca.'});
            }
        }

        //verifica se o usuario ja n ta fazendo outro comando de remove no momento
        if (executingUsers[message.author.id]) return message.reply({ content: 'Você já tem um comando de remove em andamento. '});
        
        try {
            var connection = require('../database/connect.js');

            var sqlLatest = `SELECT * FROM inventory WHERE localID = (SELECT MAX(localID) as max FROM inventory WHERE userID = ${message.author.id}) AND userID = ${message.author.id}`;
            const latestChar = await connection.query(sqlLatest);
            if (latestChar[0].length == 0) return message.reply({ content: 'Você não tem personagens para remover. '});
            if (latestChar[0][0].active) return message.reply({ content: `O personagem está ativo no sistema de RPG.` });
            let globalID = latestChar[0][0].globalID;
            let rarity = latestChar[0][0].rarity;
            let localID = latestChar[0][0].localID;
            let charID = latestChar[0][0].charID;
            
            let value = 0;
            
            let rarityName;

            //busca os nomes
            
            var sqlCharName = `SELECT name FROM characters WHERE charID = ${charID}`;
            const charName = await connection.query(sqlCharName);
                
            let charList = charName[0][0].name;
                    
                    
            
            if (rarity == 1) value += 10, rarityName = '[D]';
            if (rarity == 2) value += 30, rarityName = '[C]';
            if (rarity == 3) value += 70, rarityName = '[B]';
            if (rarity == 4) value += 300, rarityName = '[A]';
            if (rarity == 5) value += 5000, rarityName = '[S]';
            description = `${rarityName} ${charList}`;
            


            //botões
            let embed = new Discord.EmbedBuilder()
                .setTitle(`Lista de Remoção`)
                .setDescription(description)
                .setColor('LightGrey')
                .setFooter({ text: `Valor: ${value} coins.` });

            const confirmButton = new Discord.ButtonBuilder()
                .setCustomId('confirm')
                .setLabel('Confirmar')
                .setStyle(Discord.ButtonStyle.Success);

            const cancelButton = new Discord.ButtonBuilder()
                .setCustomId('cancel')
                .setLabel('Cancelar')
                .setStyle(Discord.ButtonStyle.Danger);

            const buttons = [ confirmButton, cancelButton ];

            executingUsers[message.author.id] = true;
            let msg = await message.reply({ embeds: [embed], components: [new Discord.ActionRowBuilder()
                .addComponents(buttons)] });


            //filtro dos botões
            const filter = (click) => click.user.id === message.author.id
            const collector = message.channel.createMessageComponentCollector({
                filter,
                max: 1,
                time: (1 * 60000)
            })
            const [collected, reason] = await once(collector, 'end')
            if (reason === 'limit') {
                if (collected.first().customId === 'confirm') {

                    //verificação se o usuário não entrou em uma trade
                    if (trades[message.author.id]) {
                        if (trades[message.author.id].status === 'trading') {
                            const updatedEmbed = new Discord.EmbedBuilder(embed)
                                .setColor('DarkRed')
                                .setFooter({ text: `Erro: Não é possível remover personagens enquanto estiver realizando uma troca. `});
                            buttons[0].setDisabled(true);
                            buttons[1].setDisabled(true);
                            await msg.edit({ embeds: [updatedEmbed], components: [ new Discord.ActionRowBuilder().addComponents(buttons)] });
                            collected.first().deferUpdate();
                            delete executingUsers[message.author.id];
                            return;
                        }
                    }
                    for (const tradeId in trades) {
                        const trade = trades[tradeId];
                        if (trade.partner === message.author.id && trade.status === 'trading') {
                            const updatedEmbed = new Discord.EmbedBuilder(embed)
                                .setColor('DarkRed')
                                .setFooter({ text: `Erro: Não é possível remover personagens enquanto estiver realizando uma troca. `});
                            buttons[0].setDisabled(true);
                            buttons[1].setDisabled(true);
                            await msg.edit({ embeds: [updatedEmbed], components: [ new Discord.ActionRowBuilder().addComponents(buttons)] });
                            collected.first().deferUpdate();
                            delete executingUsers[message.author.id];
                            return;
                        }
                    }
                    description = '';
                    
                    if (rarity == 1) rarityName = '[D]';
                    if (rarity == 2) rarityName = '[C]';
                    if (rarity == 3) rarityName = '[B]';
                    if (rarity == 4) rarityName = '[A]';
                    if (rarity == 5) rarityName = '[S]';
                    description += `~~${rarityName} ${charList}~~`;
                    
                    const updatedEmbed = new Discord.EmbedBuilder(embed)
                        .setColor('DarkGreen')
                        .setDescription(description)
                        .setFooter({ text: `Personagem removido com sucesso por uma quantia de ${value} coins.`});
                    collected.first().deferUpdate();
                    buttons[0].setDisabled(true);
                    buttons[1].setDisabled(true);




                    //verificação final se não ocorreu uma trade
                    var sqlFinalCheck = `SELECT * FROM inventory WHERE globalID = ${globalID} AND userID = ${message.author.id}`;
                    const finalCheck = await connection.query(sqlFinalCheck);
                    if (finalCheck[0].length !== 1) {
                        const updatedEmbed = new Discord.EmbedBuilder(embed)
                            .setColor('DarkRed')
                            .setFooter({ text: `Erro: Inconsistência de dados, impossível concluir remoção. `});
                        buttons[0].setDisabled(true);
                        buttons[1].setDisabled(true);
                        await msg.edit({ embeds: [updatedEmbed], components: [ new Discord.ActionRowBuilder().addComponents(buttons)] });
                        delete executingUsers[message.author.id];
                        return;
                    }


                    //remove os personagens do inventário e atualiza o LOCALID pra ficar sequencial novamente
                    
                    var sqlRemove = `DELETE FROM inventory WHERE globalID = ${globalID}`;
                    await connection.query(sqlRemove);
                    var sqlUpdate = `UPDATE inventory SET localID = localID - 1 WHERE localID > ${localID} AND userID = ${message.author.id}`;
                    await connection.query(sqlUpdate);
                    

                    //atualiza os coins

                    var sqlCoinUpdate = `UPDATE user SET coins = coins + ${value} WHERE userID = ${message.author.id}`;
                    const coinUpdate = await connection.query(sqlCoinUpdate);

                    await msg.edit({ embeds: [updatedEmbed], components: [ new Discord.ActionRowBuilder().addComponents(buttons)] });

                    delete executingUsers[message.author.id];

                } else if (collected.first().customId === 'cancel') {
                    collected.first().deferUpdate();
                    const updatedEmbed = new Discord.EmbedBuilder(embed)
                        .setColor('DarkRed')
                        .setFooter({ text: `Remoção dos personagens cancelada.`});
                    buttons[0].setDisabled(true);
                    buttons[1].setDisabled(true);
                    await msg.edit({ embeds: [updatedEmbed], components: [ new Discord.ActionRowBuilder().addComponents(buttons)] });
                    delete executingUsers[message.author.id];
                }
            } else if (reason === 'time') {
                buttons[0].setDisabled(true);
                buttons[1].setDisabled(true);
                const updatedEmbed = new Discord.EmbedBuilder(embed)
                    .setColor('DarkRed')
                    .setFooter({ text: `Remoção dos personagens cancelada por tempo esgotado.`});

                buttons[0].setDisabled(true);
                buttons[1].setDisabled(true);
                await msg.edit({ embeds: [updatedEmbed], components: [ new Discord.ActionRowBuilder().addComponents(buttons)] });
                delete executingUsers[message.author.id];
            }

            
        } catch (error) {
            console.error(error);
        }
    }
}