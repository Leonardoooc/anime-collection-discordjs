const Discord = require("discord.js");
const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports =  {
    data: new SlashCommandBuilder()
        .setName('adminaddchar')
        .setDescription('adminAddChar')
        .addStringOption(option => option.setName('inputname').setDescription('name').setRequired(true))
        .addStringOption(option => option.setName('seriesid').setDescription('seriesid').setRequired(true)),
    async execute(interaction, client) {
        let inputName = interaction.options.getString('inputname');
        let seriesID = interaction.options.getString('seriesid');
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
        if (typeof seriesID !== 'number' && isNaN(seriesID)) return interaction.reply({ content: 'SeriesID inválido.' });
        try {
            var connection = require('../database/connect.js');

            const checkQuery = `SELECT * FROM series WHERE seriesID = ?`;
            const checkValues = [seriesID];
            const checkResults = await connection.query(checkQuery, checkValues);
            
            if (checkResults[0].length == 0) {
                return interaction.reply({ content: 'SeriesID inválido.' });
            }


            const insertQuery = `INSERT INTO characters (name, seriesID) VALUES (?, ?)`;
            const insertValues = [inputName, seriesID];
            const validate = await connection.query(insertQuery, insertValues);
            interaction.reply({ content: `Personagem -> ID (${validate[0].insertId}), Nome (${inputName}) e Série (${seriesID}) adicionado com sucesso` });
            console.log(`Personagem -> ID (${validate[0].insertId}), Nome (${inputName}) e Série (${seriesID}) adicionado com sucesso` );

        } catch (error) {
            console.error(error);
        }
    }
}