const Discord = require("discord.js");
const { once } = require("events");
const messageToEdit = {};
const selectMenu = require('../selectmenu/rpgSelectorMain.js');

const newRpgChar = require('../rpg/newRpgChar.js');
const charManager = require('../rpg/charManager.js');
const charSkills = require('../rpg/charSkills.js');
const huntSystem = require('../rpg/huntSystem.js');
const missionConclusion = require('../rpg/missionConclusion.js');

let embed = new Discord.EmbedBuilder()
    .setTitle(`Sistema de RPG`)
    .setDescription('Bem-vindo ao sistema de RPG, selecione uma opção.')
    .setThumbnail('https://cdn.discordapp.com/attachments/1075204944140963850/1078162891951308840/2619285.png')
    .setColor('#98ecec')

let embedMissions = new Discord.EmbedBuilder(embed)
    .setDescription(`Selecione o tipo de conteúdo que você deseja realizar.`)
    .setColor('#98ecec')
    .setThumbnail('https://cdn.discordapp.com/attachments/1075204944140963850/1079239612666494996/443-4430203_crossed-swords-black-and-white-png-transparent-png-removebg-preview.png');

const actionRow = new Discord.ActionRowBuilder().addComponents(new Discord.StringSelectMenuBuilder(selectMenu[0]));

const manageActionRow = new Discord.ActionRowBuilder().addComponents(new Discord.StringSelectMenuBuilder(selectMenu[1]));

const missionsActionRow = new Discord.ActionRowBuilder().addComponents(new Discord.StringSelectMenuBuilder(selectMenu[2]));

const huntsActionRow = new Discord.ActionRowBuilder().addComponents(new Discord.StringSelectMenuBuilder(selectMenu[3]));

module.exports =  {
    name: 'rpg',
    async execute(client, message, args) {

        const filter = (i) => i.user.id === message.author.id;
        let msg = await message.reply({ embeds: [embed], components: [actionRow] });
        const collector = msg.createMessageComponentCollector({ filter, time: (10 * 60000)})
        collector.on('collect', async i => {
            if (i.isButton()) return i.deferUpdate();
            if (i.values[0] === 'charManager') {
                await charManager(message, msg, client);
                i.deferUpdate();
            }
            if (i.values[0] === 'returnRow') {
                msg.edit({ embeds: [embed], components: [actionRow] });
                i.deferUpdate();
            }
            if (i.values[0] === 'charSkills') {
                await charSkills(message, msg, client);
                i.deferUpdate();
            }
            if (i.values[0] === 'newRpgChar') {
                await newRpgChar(message, msg, client);
                i.deferUpdate();
            }
            if (i.values[0] === 'startMission') {
                msg.edit({ embeds: [embedMissions], components: [missionsActionRow] });
                i.deferUpdate();
            }
            if (i.values[0] === 'missionHunt') {
                msg.edit({ embeds: [embedMissions], components: [huntsActionRow] });
                i.deferUpdate();
            }
            if (i.values[0] === 'returnRowMissions') {
                msg.edit({ embeds: [embedMissions], components: [missionsActionRow] });
                i.deferUpdate();
            }
            if (i.values[0] === 'huntForest-begin') {
                hunt = 'huntForest-begin';
                await huntSystem(message, msg, client, hunt);
                i.deferUpdate();
            }
            if (i.values[0] === 'missionResult') {
                await missionConclusion(message, msg, client);
                i.deferUpdate();
            }
            collector.resetTimer();
        });

        collector.on('end', collected => {

            return;
        });

        
    }
}