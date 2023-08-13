const Discord = require("discord.js");
const { once } = require("events");
const selectMenu = require('../selectmenu/rpgSelectorMain.js');

const actionRow = new Discord.ActionRowBuilder()
    .addComponents(new Discord.StringSelectMenuBuilder(selectMenu[0]))

const manageActionRow = new Discord.ActionRowBuilder().addComponents(new Discord.StringSelectMenuBuilder(selectMenu[1]))

let embed = new Discord.EmbedBuilder()
    .setTitle(`Sistema de RPG`)
    .setDescription('Bem-vindo ao sistema de RPG, selecione uma opção.')
    .setThumbnail('https://cdn.discordapp.com/attachments/1075204944140963850/1078162891951308840/2619285.png')
    .setColor('Random')

let embedNewChar = new Discord.EmbedBuilder(embed)
    .setDescription(`Na sua próxima mensagem, digite o LocalID do personagem que você quer ativar no sistema de RPG.`)
    .setColor('Orange')

let embedError = new Discord.EmbedBuilder(embed)
    .setDescription(`LocalID não válido, selecione a opção novamente para continuar.`)
    .setColor('Red')

let embedErrorExist = new Discord.EmbedBuilder(embedError)
    .setDescription('Você já tem esse personagem ativo no sistema de RPG.')

let embedErrorInMission = new Discord.EmbedBuilder(embedError)
    .setDescription('Você não pode mudar o personagem ativo enquanto ele está em uma missão.')

module.exports = async function newRpgChar(message, msg, client) {
    msg.edit({ embeds: [embedNewChar] });
    const filterID = (m) => m.author.id === message.author.id
    const collectorID = message.channel.createMessageCollector({ filterID, max: 1, time: (1 * 60000) })
    msg.edit({ components: [] });
    collectorID.on('collect', async y => {
        let localID = y.content;
        if (typeof localID !== 'number' && isNaN(localID)) return msg.edit({ embeds: [embedError], components: [manageActionRow] });
        try {
            var connection = require('../database/connect.js');
            const checkQuery = `SELECT * FROM inventory WHERE userID = ? AND localID = ?`;
            const checkValues = [message.author.id, localID];
            const checkResults = await connection.query(checkQuery, checkValues);
            
            if (checkResults[0].length == 0) {
              msg.edit({ embeds: [embedError], components: [manageActionRow] });
            } else {
                const sqlCheck = await connection.query(`SELECT * FROM inventory WHERE globalID = ${checkResults[0][0].globalID} AND active = 1`);
                if (sqlCheck[0].length != 0) msg.edit({ embeds: [embedErrorExist], components: [manageActionRow] });
                else {

                    const sqlCheckMission = await connection.query(`SELECT * FROM missions WHERE userID = ${message.author.id}`);
                    if (sqlCheckMission[0].length != 0) return msg.edit({ embeds: [embedErrorInMission], components: [manageActionRow] });
                    
                    await connection.query(`UPDATE inventory SET active = CASE WHEN userID = ${message.author.id} AND active = 1 THEN 0 WHEN globalID = ${checkResults[0][0].globalID} THEN 1 ELSE active END WHERE userID = ${message.author.id} OR globalID = ${checkResults[0][0].globalID}`);
                    let embedSucessfullSet = new Discord.EmbedBuilder(embed)
                        .setColor('DarkGreen')
                        .setDescription(`Personagem de ID ${localID} definido como ativo no sistema de RPG!`)
                    msg.edit({ embeds: [embedSucessfullSet], components: [actionRow] });
                    
                }

            }
        } catch(e) {
            console.log(e);
        }
    });
    collectorID.on('end', collected => {
        msg.edit({ components: [manageActionRow] });
        return;
    });
}
