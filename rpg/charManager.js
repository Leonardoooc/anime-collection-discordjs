const Discord = require("discord.js");
const { once } = require("events");
const selectMenu = require('../selectmenu/rpgSelectorMain.js');


            
let embedConfig = new Discord.EmbedBuilder()
    .setTitle(`Sistema de RPG - Gerenciamento de Personagens`)
    .setThumbnail('https://cdn.discordapp.com/attachments/1075204944140963850/1078173269145960449/settings-icon.png')
    .setColor('#98ecec')

const actionRow = new Discord.ActionRowBuilder()
    .addComponents(new Discord.StringSelectMenuBuilder(selectMenu[0]))

const manageActionRow = new Discord.ActionRowBuilder().addComponents(new Discord.StringSelectMenuBuilder(selectMenu[1]))

module.exports = async function charManager(message, msg, client) {
    let embedConfig_;
    try {
        var connection = require('../database/connect.js');
        let sqlSearch = `SELECT * FROM inventory WHERE userID = ${message.author.id} AND active = 1`;
        const sql = await connection.query(sqlSearch);
        if (sql[0].length == 0) {
            embedConfig_ = new Discord.EmbedBuilder(embedConfig).setDescription('Sem personagens ativos no sistema de RPG, selecione a opção "🧩" para ativar um personagem.').setColor('Red')
            
            await msg.edit({ embeds: [embedConfig_], components: [manageActionRow] });
            
        } else {

            let emojiToDisplay;
            let element = sql[0][0].element;
            let thumb;

            switch(element) {
                case 'water':
                    emojiToDisplay = client.emojis.cache.find(emoji => emoji.name === "water_element");
                    thumb = 'https://cdn.discordapp.com/attachments/1075204944140963850/1079148725886267563/4781554.png';
                    break;
                case 'wind':
                    emojiToDisplay = client.emojis.cache.find(emoji => emoji.name === "wind_element");
                    thumb = 'https://cdn.discordapp.com/attachments/1075204944140963850/1079148725479415920/1164978.png';
                    break;
                case 'fire':
                    emojiToDisplay = client.emojis.cache.find(emoji => emoji.name === "fire_element");
                    thumb = 'https://cdn.discordapp.com/attachments/1075204944140963850/1079148725668155552/1200px-FireIcon.svg.png';
                    break;
                case 'light':
                    emojiToDisplay = client.emojis.cache.find(emoji => emoji.name === "light_element");
                    thumb = 'https://cdn.discordapp.com/attachments/1075204944140963850/1079148724799938561/sun-rays-png-9.png';
                    break;
                case 'dark':
                    emojiToDisplay = client.emojis.cache.find(emoji => emoji.name === "dark_element");
                    thumb = 'https://cdn.discordapp.com/attachments/1075204944140963850/1079148725303259206/1024px-Pokemon_Dark_Type_Icon.svg.png';
                    break;
                default:
                    break;
            }

            const sqlPic = await connection.query(`SELECT * FROM pictures WHERE picID = (SELECT picID FROM inventory WHERE globalID = ${sql[0][0].globalID})`);
            const sqlName = await connection.query(`SELECT * FROM characters WHERE charID = (SELECT charID FROM inventory WHERE globalID = ${sql[0][0].globalID})`);
            embedConfig_ = new Discord.EmbedBuilder(embedConfig)
                .setDescription(`Nome: ${sqlName[0][0].name}\nElemento: ${emojiToDisplay}\nLevel: ${sql[0][0].level} ⚖️\n\nPoder: ${sql[0][0].basepower} 🐲\nHP: ${sql[0][0].basehp} ❤️\nDef: ${sql[0][0].basedef} 🛡️\nAtk: ${sql[0][0].baseatk} 🗡️`)
                .setImage(`${sqlPic[0][0].link}`)
                .setThumbnail(thumb)
            msg.edit({ embeds: [embedConfig_], components: [manageActionRow] });
        }     

    } catch(e) {
        console.log(e);
    }
}