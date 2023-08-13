const Discord = require("discord.js");
const { spawns } = require('../spawnConfig.js');

module.exports = {
    name: 'messageCreate',
    async execute(message, client) {
        if (message.author.bot || message.channel.type === "dm") return;

		if (!spawns[message.guild.id]) return;

		let updateTime = Date.now();
		if (updateTime - spawns[message.guild.id].lastSpawnTime >= 3 * 60 * 1000) {
			spawns[message.guild.id].lastSpawnTime = Date.now();
			let totalName;
			let rarity;
			let rarityName;
			let color;
			let picID;
			let charID;
			
            const spawnChannel = client.channels.cache.get(spawns[message.guild.id].spawnChannel);
        
            // definir raridade
            let rarityManager = Math.floor(Math.random() * 10000);
            if (rarityManager <= 5000) rarity = 1, rarityName = "D", color = 'Grey';
            if (rarityManager > 5000 && rarityManager <= 9000) rarity = 2, rarityName = "C", color = 'Green';  
            if (rarityManager > 9000 && rarityManager <= 9500) rarity = 3, rarityName = "B", color = 'Orange';
            if (rarityManager > 9500 && rarityManager <= 9900) rarity = 4, rarityName = "A", color = 'Red';
            if (rarityManager > 9900) rarity = 5, rarityName = "S", color = 'Aqua';
            
            //pesquisa personagens
            try {
				var connection = require('../database/connect.js');
                const [results] = await connection.query("SELECT charID, name FROM characters WHERE charID > 0");
                const randomIndex = Math.floor(Math.random() * results.length);
                charID = results[randomIndex].charID;
                totalName = results[randomIndex].name;
                
                //pesquisa uma picture do personagem
                const [picResults] = await connection.query(`SELECT picID, link FROM pictures WHERE charID = ${charID}`);
                const randomIndexPic = Math.floor(Math.random() * picResults.length);
                picID = picResults[randomIndexPic].picID;
                const picUrl = picResults[randomIndexPic].link;
                //console.log(totalName, picUrl);
                //console.log(randomID, randomIDPic);
    
                //aparecer apenas iniciais
                const names = totalName.split(" ");
                let initials = "";
                for (const name of names) {
                    initials += name[0].toUpperCase() + ". ";
                }
    
                let embed = new Discord.EmbedBuilder()
                    .setTitle(`Um novo personagem apareceu!`)
                    .setDescription(`Iniciais: **${initials}**\nRaridade: ${rarityName}\n\nUtilize o comando /claim <nome> para obter o personagem.`)
                    .setColor(color)
                    .setImage(`${picUrl}`);
                let msg = await spawnChannel.send({ embeds: [embed] });

				//setting arrays
				spawns[message.guild.id].active = true;
				spawns[message.guild.id].rarity = rarity;
				spawns[message.guild.id].totalName = totalName;
				spawns[message.guild.id].picture = picID;
				spawns[message.guild.id].charID = charID;
				spawns[message.guild.id].rarityName = rarityName;
				spawns[message.guild.id].embed = embed;
				spawns[message.guild.id].messageToEdit = msg;

            } catch (error) {
                console.error(error);
            }

		} else {
			return;
		}

    }
}
