
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const { MessageActionRow, MessageButton, MessageEmbed } = require('discord.js');
const { token } = require('./config.json');
const rest = new REST({ version: '9' }).setToken(token);
const Discord = require('discord.js');
const fs = require('fs');
const client = require('./bot.js');
const clientId = '982126798601060352';
const guildIds = ['601466842346815488', '1075204411523088394'];

module.exports = {
    slashHandlerExecute(client) {
        const commands = [];
        const commandFiles = fs.readdirSync('./commands_').filter(file => file.endsWith('.js'));
        for (const file of commandFiles) {
            const command = require(`./commands_/${file}`);
            commands.push(command.data.toJSON());
        }

        for (const file of commandFiles) {

            const command = require(`./commands_/${file}`);
            
            client.commands2.set(command.data.name, command);
        }
        for (guildId of guildIds) {

            
            (async () => {
                try {
                    var startTime = performance.now();
                    await rest.put(
                        Routes.applicationGuildCommands(clientId, guildId),
                        { body: commands },
                    );
                    var endTime = performance.now();
                    var tempo = endTime-startTime;
                    console.log(`Foram carregados ${client.commands2.size} slash commands em ${tempo.toFixed(2)}ms`);
                } catch (error) {
                    console.error(error);
                }
            })();
        }
        client.on('interactionCreate', async interaction => {
            if (!interaction.isCommand()) return;
        
            const command = client.commands2.get(interaction.commandName);
        
            if (!command) return;
        
            try {
                await command.execute(interaction, client);
            } catch (error) {
                console.error(error);
                await interaction.reply({ content: 'Erro na execução', ephemeral: true });
            }
        });
    }
}