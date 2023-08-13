const Discord = require("discord.js");
const { once } = require("events");
const selectMenu = require('../selectmenu/rpgSelectorMain.js');

const actionRow = new Discord.ActionRowBuilder().addComponents(new Discord.StringSelectMenuBuilder(selectMenu[0]));

let embed = new Discord.EmbedBuilder()
    .setTitle(`Sistema de RPG`)
    .setDescription('Bem-vindo ao sistema de RPG, selecione uma opção.')
    .setThumbnail('https://cdn.discordapp.com/attachments/1075204944140963850/1078162891951308840/2619285.png')
    .setColor('#98ecec')

let embedErrorInMission = new Discord.EmbedBuilder(embed)
    .setDescription('O personagem está ativo em uma missão no momento.')
    .setColor('Red')

let embedErrorNotActive = new Discord.EmbedBuilder(embed)
    .setDescription(`Você não tem nenhum personagem ativo no sistema de RPG, ative um antes de começar uma missão.`)
    .setColor('Red')




module.exports = async function huntForestBegin(message, msg, client, hunt) {
    try {
        var connection = require('../database/connect.js');
        const sqlCheckMission = await connection.query(`SELECT * FROM missions WHERE userID = ${message.author.id}`);
        if (sqlCheckMission[0].length != 0) return msg.edit({ embeds: [embedErrorInMission], components: [actionRow] });
        const sqlCheckIfHave = await connection.query(`SELECT * FROM inventory WHERE userID = ${message.author.id} AND active = 1`);
        if (sqlCheckIfHave[0].length == 0) return msg.edit({ embeds: [embedErrorNotActive], components: [actionRow] });
    } catch (e) {
        console.log(e);
    }

    const now = Math.floor(Date.now() / 1000);
    const duration = now + 1800;

    const getChar = await connection.query(`SELECT * FROM inventory WHERE userID = ${message.author.id} AND active = 1`);

    const sqlRegister = await connection.query(`INSERT INTO missions (type, level, globalID, charID, userID, automatic, started, duration) values ('${hunt}', ${getChar[0][0].level}, ${getChar[0][0].globalID}, ${getChar[0][0].charID}, ${getChar[0][0].userID}, 1, ${now}, ${duration})`);


    const diff = duration - now;

    const seconds = diff;
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    let formatation = '`';
    let embedMissionSet = new Discord.EmbedBuilder(embed)
        .setDescription(`Missão ${hunt} iniciada com sucesso, tempo para conclusão: ${formatation}${hours % 24} horas, ${minutes % 60} minutos e ${seconds % 60} segundos${formatation}.`)
        .setColor('DarkGreen')
    msg.edit({ embeds: [embedMissionSet], components: [actionRow] });


}