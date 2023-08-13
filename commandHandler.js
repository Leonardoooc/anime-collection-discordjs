const fs = require('fs');
const config = require("./config.json");
var startTime = performance.now();

module.exports = {
    commandHandlerExecute(client) {
        const commandFolders = fs.readdirSync('./commands');
        for (const folder of commandFolders) {
            const commandFiles = fs.readdirSync(`./commands`).filter(file => file.endsWith('.js'));
            for (const file of commandFiles) {
                const command = require(`./commands/${file}`);
                client.commands.set(command.name, command);
            }
        }

        client.on('messageCreate', async message => {
            if (message.author.bot || message.channel.type === "dm") return;

            const prefixes = [config.prefix, config.prefix2];
            const prefix = prefixes.find(p => message.content.startsWith(p));

            if (!prefix) return;

            const args = message.content.slice(prefix.length).trim().split(/ +/);
            const commandName = args.shift().toLowerCase();
            const command = client.commands.get(commandName) || client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));

            if (!command) return;

            try {
                await command.execute(client, message, args);
            } catch (error) {
                console.log(error);
            }
        });
        var endTime = performance.now();
        var tempo = endTime-startTime;
        console.log(`Foram carregados ${client.commands.size} normal commands em ${tempo.toFixed(2)}ms`);
    }
}