const Discord = require("discord.js");
const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports =  {
    data: new SlashCommandBuilder()
        .setName('adminaddseries')
        .setDescription('adminAddSeries')
        .addStringOption(option => option.setName('inputname').setDescription('name').setRequired(true)),
    async execute(interaction, client) {
        let inputName = interaction.options.getString('inputname');
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
        try {
            var connection = require('../database/connect.js');
            const insertQuery = `INSERT INTO series (name) VALUES (?)`;
            const insertValues = [inputName];
            const validate = await connection.query(insertQuery, insertValues);
            interaction.reply({ content: `Série -> ID (${validate[0].insertId}) e Nome (${inputName}) adicionada com sucesso` });
            console.log(`Série -> ID (${validate[0].insertId}) e Nome (${inputName}) adicionada com sucesso`);

        } catch (error) {
            console.error(error);
        }
    }
}