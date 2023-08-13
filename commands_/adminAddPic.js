const Discord = require("discord.js");
const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports =  {
    data: new SlashCommandBuilder()
        .setName('adminaddpic')
        .setDescription('adminAddPic')
        .addStringOption(option => option.setName('type').setDescription('type').setRequired(true))
        .addStringOption(option => option.setName('url').setDescription('url').setRequired(true))
        .addStringOption(option => option.setName('charid').setDescription('charid').setRequired(true)),
    async execute(interaction, client) {
        let type = interaction.options.getString('type');
        let url = interaction.options.getString('url');
        let charID = interaction.options.getString('charid');
        const roleDatabase = '1075204497556635728';
        let guildId = client.guilds.cache.get('1075204411523088394');
        let state = false;
        let member = await guildId.members.fetch(interaction.user.id).then(member => {
            if (!member) return interaction.reply({ content: 'Sem permissão.'});
            if (member.roles.cache.has(roleDatabase)) {
                state = true;
            } else {
                state = false;
            } 
        });
        if (!state) return interaction.reply({ content: 'Sem permissão. '});
        if (typeof charID !== 'number' && isNaN(charID)) return interaction.reply({ content: 'CharID inválido.' });
        try {
            var connection = require('../database/connect.js');

            const checkQuery = `SELECT * FROM characters WHERE charID = ?`;
            const checkValues = [charID];
            const checkResults = await connection.query(checkQuery, checkValues);
            
            if (checkResults[0].length == 0) {
                return interaction.reply({ content: 'charID inválido.' });
            }


            const insertQuery = `INSERT INTO pictures (type, link, charID) VALUES (?, ?, ?)`;
            const insertValues = [type, url, charID];
            const validate = await connection.query(insertQuery, insertValues);
            interaction.reply({ content: `Imagem -> ID (${validate[0].insertId}), Tipo (${type}) e Personagem (${charID}) adicionado com sucesso` });
            console.log(`Imagem -> ID (${validate[0].insertId}), Tipo (${type}) e Personagem (${charID}) adicionado com sucesso` );

        } catch (error) {
            console.error(error);
        }
    }
}