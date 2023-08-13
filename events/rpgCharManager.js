const Discord = require("discord.js");
const { messageToEdit } = require('../commands/rpg.js')

module.exports = {
    name: 'interactionCreate',
    async execute(interaction, client) {
        if (!interaction.isButton()) return;
        if (interaction.customId === 'characterButton') {
            //messageToEdit[interaction.user.id]._message.edit({ content: 'ok' });

        }
    }
}