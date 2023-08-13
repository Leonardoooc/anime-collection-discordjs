const Discord = require('discord.js');
const spawns = {};

module.exports = {

    async initSpawns(client) {
        try {
            var connection = require('./database/connect.js');
            var sqlGetServers = `SELECT * FROM spawnchannel`;
            const getServers = await connection.query(sqlGetServers);
            for(i=0;i<getServers[0].length;i++) {
                spawns[getServers[0][i].serverID] = {
                    spawnChannel: getServers[0][i].channelID,
                    active: false,
                    lastSpawnTime: 0,
                    rarity: 0,
                    rarityName: '',
                    totalName: '',
                    picture: 0,
                    charID: 0,
                    messageToEdit: [],
                    embed: []
                }
            }
            console.log(`${getServers[0].length} servidores para spawn carregados com sucesso.`);

        } catch (error) {
            console.error(error);
        }
    },
    spawns
}