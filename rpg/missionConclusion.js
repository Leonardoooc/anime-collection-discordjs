const Discord = require("discord.js");
const { once } = require("events");
const { connect } = require("../database/connect");
const selectMenu = require('../selectmenu/rpgSelectorMain.js');

const actionRow = new Discord.ActionRowBuilder().addComponents(new Discord.StringSelectMenuBuilder(selectMenu[0]));

let embed = new Discord.EmbedBuilder()
    .setTitle(`Sistema de RPG`)
    .setDescription('Bem-vindo ao sistema de RPG, selecione uma opção.')
    .setThumbnail('https://cdn.discordapp.com/attachments/1075204944140963850/1078162891951308840/2619285.png')
    .setColor('#98ecec')

let embedErrorNotMission = new Discord.EmbedBuilder(embed)
    .setDescription('Não há nenhuma missão ativa no momento.')
    .setColor('Red')

module.exports = async function missionConclusion(message, msg, client) {
    let hunt;
    try {
        var connection = require('../database/connect.js');
        const sqlCheckMission = await connection.query(`SELECT * FROM missions WHERE userID = ${message.author.id}`);
        if (sqlCheckMission[0].length == 0) return msg.edit({ embeds: [embedErrorNotMission], components: [actionRow] });

        const now = Math.floor(Date.now() / 1000);
        const diff = sqlCheckMission[0][0].duration - now;

        const seconds = diff;
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);
        let formatation = '`'
        let embedErrorTimeLeft = new Discord.EmbedBuilder(embed)
            .setDescription(`Faltam ${formatation}${days} dias, ${hours % 24} horas, ${minutes % 60} minutos e ${seconds % 60} segundos${formatation} até que a missão seja finalizada.`)
            .setColor('Red');
        if (sqlCheckMission[0][0].duration > now) return msg.edit({ embeds: [embedErrorTimeLeft], components: [actionRow] });
        hunt = sqlCheckMission[0][0].type;
    } catch (e) {
        console.log(e);
    }

    const getChar = await connection.query(`SELECT * FROM inventory WHERE userID = ${message.author.id} AND active = 1`);

    if (hunt === 'huntForest-begin') {

        let statusMultiplier;
        let powerbase = getChar[0][0].basepower;
        let monsterPower;
        let monsterLevel;
        let monsterHp;
        let monsterDef;
        let monsterAtk;

        let rarity = getChar[0][0].rarity;

        switch(rarity) {
            case 1:
                if (Math.random() < 0.7) {
                    monsterHp = Math.floor(Math.random() * (750 - 400 + 1) + 400);
                    monsterDef = Math.floor(Math.random() * (100 - 50 + 1) + 50);
                    monsterAtk = Math.floor(Math.random() * (80 - 50 + 1) + 50);
                    monsterPower = Math.floor(Math.random() * (60 - 40 + 1) + 40);
                    monsterLevel = 1;
                } else {
                    monsterHp = Math.floor(Math.random() * (850 - 750 + 1) + 750);
                    monsterDef = Math.floor(Math.random() * (130 - 100 + 1) + 100);
                    monsterAtk = Math.floor(Math.random() * (110 - 80 + 1) + 80);
                    monsterPower = Math.floor(Math.random() * (85 - 60 + 1) + 60);
                    monsterLevel = Math.floor(Math.random() * (5 - 1 + 1)) + 1;
                }
                break;
            case 2:
                break;
            default:
                break;
        }
        

        let monster = {
            level: monsterLevel,
            power: monsterPower,
            hp: monsterHp,
            def: monsterDef,
            atk: monsterAtk,
            name: 'Slime'
        }
        console.log(monster);

        let level = getChar[0][0].level;
        let basehp = getChar[0][0].basehp;
        let basedef = getChar[0][0].basedef;
        let baseatk = getChar[0][0].baseatk;

        powerbase = Math.floor((1 + (level - 1) * 0.01) * powerbase);
        basehp = Math.floor((1 + (level - 1) * 0.01) * basehp);
        basedef = Math.floor((1 + (level - 1) * 0.01) * basedef);
        baseatk = Math.floor((1 + (level - 1) * 0.01) * baseatk);
        
        let finalExperience = Math.floor(Math.random() * (50 - 30 + 1)) + 30;
        if (level > 5 && level < 10) {
            finalExperience = finalExperience/2;
        } if (level > 9) {
            finalExperience = finalExperience/5;
        }
        finalExperience = Math.round(finalExperience);

        let failChance = Math.floor(Math.random() * 100 + 1);
        let isPowered = 0;

        if (level >= monster.level) isPowered++;
        if (powerbase >= monster.power) isPowered++;
        if (basehp >= monster.hp) isPowered++;
        if (basedef >= monster.atk) isPowered++;
        if (baseatk >= monster.def) isPowered++;
        
        let state;
        
        if (isPowered == 0) {
            if (failChance > 5) state = 'failed';
            else state = 'sucess';
        }
        if (isPowered == 1) {
            if (failChance > 20) state = 'failed';
            else state = 'sucess';
        }
        if (isPowered == 2) {
            if (failChance > 40) state = 'failed';
            else state = 'sucess';
        }
        if (isPowered == 3) {
            if (failChance > 75) state = 'failed';
            else state = 'sucess';
        }
        if (isPowered == 4) {
            if (failChance > 90) state = 'failed' 
            else state = 'sucess';
        }
        if (isPowered == 5) {
            state = 'sucess';
        }

        console.log(isPowered);

        let embedSucessfull = new Discord.EmbedBuilder()
            .setDescription(`Hunt concluída com sucesso, detalhes da hunt:\n\nVocê derrotou: ${monster.name}\nExperiência obtida: ${finalExperience}`)
            .setColor('Green')
        let embedFailed = new Discord.EmbedBuilder()
            .setDescription(`A hunt falhou, detalhes da hunt:\n\nVocê batalhou contra: ${monster.name}`)
            .setColor('Red')

        if (state === 'failed') {
            msg.edit({ embeds: [embedFailed], components: [actionRow] });
        }
        if (state === 'sucess') {
            msg.edit({ embeds: [embedSucessfull], components: [actionRow] });
        }

        await connection.query(`DELETE FROM missions WHERE userID = ${message.author.id}`);
        

    }
}