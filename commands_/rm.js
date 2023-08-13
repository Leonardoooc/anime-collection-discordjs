const Discord = require("discord.js");
const { SlashCommandBuilder, EmbedBuilder } = require('@discordjs/builders');
const executingUsers = {};
const { once } = require('events');
const { trades } = require ('./t.js');

module.exports =  {
    data: new SlashCommandBuilder()
        .setName('rm')
        .setDescription('rm')
        .addStringOption(option => option.setName('ids').setDescription('LocalIDs').setRequired(true)),
    async execute(interaction, client) {
        return;
        let input = interaction.options.getString('ids');
        const inputIds = input.split(' ');

        //verificação inicial de trade
        if (trades[interaction.user.id]) {
            if (trades[interaction.user.id].status === 'trading') {
                return interaction.reply({ content: 'Você não pode remover personagens enquanto realiza uma troca.' });
            }
        }
        for (const tradeId in trades) {
            const trade = trades[tradeId];
            if (trade.partner === interaction.user.id && trade.status === 'trading') {
                return interaction.reply({ content: 'Você não pode remover personagens enquanto realiza uma troca.'});
            }
        }

        //verifica se o usuario ja n ta fazendo outro comando de remove no momento
        if (executingUsers[interaction.user.id]) return interaction.reply({ content: 'Você já tem um comando de remove em andamento. '});
        //console.log(inputIds);
        //console.log(inputIds.join(', '));
        const values = Object.values(inputIds);

        //verifica se n tem nenhum ID duplicado
        const isDuplicated = values.some((value, index) => values.indexOf(value) !== index);
        if (isDuplicated) return interaction.reply({ content: 'Você só pode por o ID uma vez.' });
        if (inputIds.length >= 31) return interaction.reply({ content: 'Você só pode remover no máximo 30 personagens por vez.' });

        try {
            var connection = require('../database/connect.js');
            let globalIDs = [];
            let rarities = [];
            let localIDs = [];
            let charIDs = []

            //busca todo inventário e armazena
            let existingInventory = await connection.query(`SELECT localID, globalID, rarity, charID FROM inventory WHERE userID = ${interaction.user.id}`);
            existingInventory = existingInventory[0].reduce((acc, item) => {
                acc[item.localID] = item;
                return acc;
            }, {});

            //verifica todos ids, ver se são válidos e armazena as infos
            for (i=0;i<inputIds.length;i++) {
                if (typeof inputIds[i] !== 'number' && isNaN(inputIds[i])) return interaction.reply({ content: 'LocalID inválido.' });
                if (!existingInventory[inputIds[i]]) return interaction.reply({ content: 'LocalID inválido.' });
                globalIDs.push(existingInventory[inputIds[i]].globalID);
                rarities.push(existingInventory[inputIds[i]].rarity);
                localIDs.push(existingInventory[inputIds[i]].localID);
                charIDs.push(existingInventory[inputIds[i]].charID);
            }
            let value = 0;
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
            for (i=0;i<charList.length;i++) {
                if (rarities[i] == 1) value += 10, rarityName = '[Comum]';
                if (rarities[i] == 2) value += 30, rarityName = '[Incomum]';
                if (rarities[i] == 3) value += 70, rarityName = '[Raro]';
                if (rarities[i] == 4) value += 300, rarityName = '[Épico]';
                if (rarities[i] == 5) value += 5000, rarityName = '[Lendário]';
                description += `${rarityName} ${charList[i]}\n`;
            }


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

            executingUsers[interaction.user.id] = true;
            const msg = await interaction.reply({ embeds: [embed], components: [new Discord.ActionRowBuilder()
                .addComponents(buttons)] });


            //filtro dos botões
            const filter = (click) => click.user.id === interaction.user.id
            const collector = interaction.channel.createMessageComponentCollector({
                filter,
                max: 1,
                time: (1 * 60000)
            })
            const [collected, reason] = await once(collector, 'end')
            if (reason === 'limit') {
                if (collected.first().customId === 'confirm') {

                    //verificação se o usuário não entrou em uma trade
                    if (trades[interaction.user.id]) {
                        if (trades[interaction.user.id].status === 'trading') {
                            const updatedEmbed = new Discord.EmbedBuilder(embed)
                                .setColor('DarkRed')
                                .setFooter({ text: `Erro: Não é possível remover personagens enquanto estiver realizando uma troca. `});
                            buttons[0].setDisabled(true);
                            buttons[1].setDisabled(true);
                            await interaction.editReply({ embeds: [updatedEmbed], components: [ new Discord.ActionRowBuilder().addComponents(buttons)] });
                            collected.first().deferUpdate();
                            delete executingUsers[interaction.user.id];
                            return;
                        }
                    }
                    for (const tradeId in trades) {
                        const trade = trades[tradeId];
                        if (trade.partner === interaction.user.id && trade.status === 'trading') {
                            const updatedEmbed = new Discord.EmbedBuilder(embed)
                                .setColor('DarkRed')
                                .setFooter({ text: `Erro: Não é possível remover personagens enquanto estiver realizando uma troca. `});
                            buttons[0].setDisabled(true);
                            buttons[1].setDisabled(true);
                            await interaction.editReply({ embeds: [updatedEmbed], components: [ new Discord.ActionRowBuilder().addComponents(buttons)] });
                            collected.first().deferUpdate();
                            delete executingUsers[interaction.user.id];
                            return;
                        }
                    }
                    description = '';
                    for (i=0;i<charList.length;i++) {
                        if (rarities[i] == 1) rarityName = '[Comum]';
                        if (rarities[i] == 2) rarityName = '[Incomum]';
                        if (rarities[i] == 3) rarityName = '[Raro]';
                        if (rarities[i] == 4) rarityName = '[Épico]';
                        if (rarities[i] == 5) rarityName = '[Lendário]';
                        description += `~~${rarityName} ${charList[i]}~~\n`;
                    }
                    const updatedEmbed = new Discord.EmbedBuilder(embed)
                        .setColor('DarkGreen')
                        .setDescription(description)
                        .setFooter({ text: `Personagens removidos com sucesso por uma quantia de ${value} coins.`});
                    collected.first().deferUpdate();
                    buttons[0].setDisabled(true);
                    buttons[1].setDisabled(true);




                    //verificação final se não ocorreu uma trade
                    var sqlFinalCheck = `SELECT * FROM inventory WHERE globalID IN (${globalIDs.join(', ')}) AND userID = ${interaction.user.id}`;
                    const finalCheck = await connection.query(sqlFinalCheck);
                    if (finalCheck[0].length !== globalIDs.length) {
                        const updatedEmbed = new Discord.EmbedBuilder(embed)
                            .setColor('DarkRed')
                            .setFooter({ text: `Erro: Inconsistência de dados, impossível concluir remoção. `});
                        buttons[0].setDisabled(true);
                        buttons[1].setDisabled(true);
                        await interaction.editReply({ embeds: [updatedEmbed], components: [ new Discord.ActionRowBuilder().addComponents(buttons)] });
                        delete executingUsers[interaction.user.id];
                        return;
                    }


                    //remove os personagens do inventário e atualiza o LOCALID pra ficar sequencial novamente
                    for (i=0;i<globalIDs.length;i++) {
                        var sqlRemove = `DELETE FROM inventory WHERE globalID = ${globalIDs[i]}`;
                        await connection.query(sqlRemove);
                        for (j=0;j<localIDs.length;j++) {
                            if (localIDs[j] > localIDs[i]) localIDs[j] = localIDs[j]-1;
                        }
                        var sqlUpdate = `UPDATE inventory SET localID = localID - 1 WHERE localID > ${localIDs[i]} AND userID = ${interaction.user.id}`;
                        await connection.query(sqlUpdate);
                    }

                    //atualiza os coins

                    var sqlCoinUpdate = `UPDATE user SET coins = coins + ${value} WHERE userID = ${interaction.user.id}`;
                    const coinUpdate = await connection.query(sqlCoinUpdate);

                    await interaction.editReply({ embeds: [updatedEmbed], components: [ new Discord.ActionRowBuilder().addComponents(buttons)] });

                    delete executingUsers[interaction.user.id];

                } else if (collected.first().customId === 'cancel') {
                    collected.first().deferUpdate();
                    const updatedEmbed = new Discord.EmbedBuilder(embed)
                        .setColor('DarkRed')
                        .setFooter({ text: `Remoção dos personagens cancelada.`});
                    buttons[0].setDisabled(true);
                    buttons[1].setDisabled(true);
                    await interaction.editReply({ embeds: [updatedEmbed], components: [ new Discord.ActionRowBuilder().addComponents(buttons)] });
                    delete executingUsers[interaction.user.id];
                }
            } else if (reason === 'time') {
                buttons[0].setDisabled(true);
                buttons[1].setDisabled(true);
                const updatedEmbed = new Discord.EmbedBuilder(embed)
                    .setColor('DarkRed')
                    .setFooter({ text: `Remoção dos personagens cancelada por tempo esgotado.`});

                buttons[0].setDisabled(true);
                buttons[1].setDisabled(true);
                await interaction.editReply({ embeds: [updatedEmbed], components: [ new Discord.ActionRowBuilder().addComponents(buttons)] });
                delete executingUsers[interaction.user.id];
            }

            
        } catch (error) {
            console.error(error);
        }
    }
}