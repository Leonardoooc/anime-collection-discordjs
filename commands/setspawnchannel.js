const Discord = require("discord.js");
const { spawns } = require ('../spawnConfig.js');

module.exports =  {
    name: 'setspawnchannel',
    async execute(client, message, args) {
        if (!message.member.permissions.has('ADMINISTRATOR')) return message.reply({ content: 'Sem permissão. '});
        try {
            var connection = require('../database/connect.js');
            var sqlChecker = `SELECT * FROM spawnchannel WHERE serverID = ${message.guild.id}`;
            const channelSetter = await connection.query(sqlChecker);
            if (channelSetter[0].length == 0) {
                var sqlNewServer = `INSERT INTO spawnchannel (serverID, channelID) VALUES (${message.guild.id}, ${message.channel.id})`;
                const newServer = await connection.query(sqlNewServer);
                spawns[message.guild.id] = {
                    spawnChannel: message.channel.id,
                    active: false,
                    lastSpawnTime: 0,
                    rarity: 0,
                    totalName: '',
                    picture: 0,
                    charID: 0,
                    messageToEdit: [],
                    embed: []
                }
                message.reply({ content: 'Canal de spawn setado com sucesso.' });
            } else {
                var sqlSetNewChannel = `UPDATE spawnchannel SET channelID = ${message.channel.id} WHERE serverID = ${message.guild.id}`;
                const setNewChannel = await connection.query(sqlSetNewChannel);
                spawns[message.guild.id].spawnChannel = message.channel.id;
                message.reply({ content: 'Novo canal de spawn setado com sucesso. '});
            }
        } catch (error) {
            console.error(error);
        }
    }
}