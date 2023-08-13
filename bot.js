const Discord = require('discord.js');
var startTime = performance.now();
const fs = require('fs');
const client = new Discord.Client({intents: [
    Discord.GatewayIntentBits.DirectMessages,
    Discord.GatewayIntentBits.Guilds,
    Discord.GatewayIntentBits.GuildBans,
    Discord.GatewayIntentBits.GuildMessages,
    Discord.GatewayIntentBits.GuildMembers,
    Discord.GatewayIntentBits.MessageContent,
],
partials: [Discord.Partials.Channel],
});
const config = require("./config.json");
var port = process.env.PORT || 8080;
console.log("Inicializado na porta: " + port);
var express = require('express');
var app = express();
app.listen(port);



async function initMySQL() {
    const { mysqlConnection } = require('./database/connect.js');
    await mysqlConnection();
    const { initSpawns } = require('./spawnConfig.js');
    await initSpawns(client);
}
initMySQL();

client.on("ready", () => {
    client.user.setPresence({
        activities: [{ name: 'Thiefgami', type: Discord.ActivityType.Watching }],
        status: 'dnd',
    });
});

client.commands = new Discord.Collection();

const { commandHandlerExecute } = require('./commandHandler.js');
commandHandlerExecute(client);

const eventFiles = fs.readdirSync('./events').filter(file => file.endsWith('.js'));

for (const file of eventFiles) {
	const event = require(`./events/${file}`);
	if (event.once) {
		client.once(event.name, (...args) => event.execute(...args, client));
	} else {
		client.on(event.name, (...args) => event.execute(...args, client));
	}
}


client.commands2 = new Discord.Collection();
const { slashHandlerExecute } = require('./slashHandler.js');
slashHandlerExecute(client);


process.on('unhandledRejection', error => {
	console.error('Unhandled promise rejection:', error);
});

try {
    client.login(config.token);
    var endTime = performance.now();
    var time = endTime-startTime
    console.log(`Conexão com o discord finalizada em ${time.toFixed(2)}ms`);
} catch {
    console.log("Erro ao iniciar o bot.");
}
