const Discord = require("discord.js");
let localID;
const { spawns } = require('../spawnConfig.js');


module.exports =  {
    name: 'claim',
    async execute(client, message, args) {
        let inputName = args.slice(0).join(" ");
        try {
            var connection = require('../database/connect.js');
            const checkQuery = `SELECT * FROM user WHERE userID = ?`;
            const checkValues = [message.author.id];
            const checkResults = await connection.query(checkQuery, checkValues);
      
            //check if is registered
            if (checkResults[0].length == 0) {
                let embed = new Discord.EmbedBuilder()
                  .setTitle(`Novo usuário no ThiefGami`)
                  .setColor('#FFA500')
                  .setDescription('Inicie no ThiefGami utilizando o comando START');
                return message.reply({ embeds: [embed]});
            }

            if (!spawns[message.guild.id]) return;

            if (message.channel.id != spawns[message.guild.id].spawnChannel) return;
      
            if (!spawns[message.guild.id].active) return message.reply({ content: 'Não há nenhum personagem para claimar no momento.' });
      
            if (inputName.toLowerCase() === spawns[message.guild.id].totalName.toLowerCase()) {
                spawns[message.guild.id].active = false;

              //claimar o personagem
              message.reply({ content: `Você obteve: **[${spawns[message.guild.id].rarityName}] ${spawns[message.guild.id].totalName}** com sucesso!`});
              let msg = spawns[message.guild.id].messageToEdit;
              let descriptionNew = spawns[message.guild.id].embed.data.description;
              let picture = spawns[message.guild.id].embed.data.image.url;
              descriptionNew += `\n\nObtido por ${message.author}`;

              let embedNew = new Discord.EmbedBuilder(spawns[message.guild.id].embed)
                  .setDescription(descriptionNew)
                  .setImage(`${picture}`);
              
              spawns[message.guild.id].messageToEdit.edit({ embeds: [embedNew] });
      

              //adicionar o personagem ao inventário
              const searchQuery = `SELECT * FROM inventory WHERE userID = ?`;
              const searchQueryValues = [message.author.id];
              const searchResults = await connection.query(searchQuery, searchQueryValues);
              if (searchResults[0].length == 0) {
                  localID = 0;
              } else {
                  const newLocalIDQuery = `SELECT MAX(localID) as max FROM inventory WHERE userID = ${message.author.id}`
                  const newLocalIDResults = await connection.query(newLocalIDQuery);
                  localID = newLocalIDResults[0][0].max + 1;
              }

              //rpg system
              let element = Math.floor(Math.random() * 5) + 1;
              let emojiToDisplay;
              switch(element) {
                  case 1:
                      element = 'water';
                      emojiToDisplay = client.emojis.cache.find(emoji => emoji.name === "water_element");
                      break;
                  case 2:
                      element = 'wind';
                      emojiToDisplay = client.emojis.cache.find(emoji => emoji.name === "wind_element");
                      break;
                  case 3:
                      element = 'fire';
                      emojiToDisplay = client.emojis.cache.find(emoji => emoji.name === "fire_element");
                      break;
                  case 4:
                      element = 'light';
                      emojiToDisplay = client.emojis.cache.find(emoji => emoji.name === "light_element");
                      break;
                  case 5:
                      element = 'dark';
                      emojiToDisplay = client.emojis.cache.find(emoji => emoji.name === "dark_element");
                      break;
                  default:
                      element = 'fire'
                      break;
              }
              let powerbase = Math.floor(Math.random() * (80 - 40 + 1)) + 40;
              if (spawns[message.guild.id].rarity === 2) powerbase = powerbase*1.2;
              if (spawns[message.guild.id].rarity === 3) powerbase = powerbase*1.4;
              if (spawns[message.guild.id].rarity === 4) powerbase += 20;
              if (spawns[message.guild.id].rarity === 4) powerbase = powerbase*1.7;
              if (spawns[message.guild.id].rarity === 5) powerbase += 40;
              if (spawns[message.guild.id].rarity === 5) powerbase = powerbase*2.2;

              let multiplier = Math.floor(Math.random() * (1000 - 700 + 1)) + 700;
              let basehp;
              if (powerbase < 60) basehp = (powerbase/75)*multiplier;
              else basehp = (powerbase/95)*multiplier;

              
              let multiplier_ = Math.floor(Math.random() * (15 - 10 + 1)) + 10;
              let basedef;
              let baseatk;
              let multiplier__ = Math.random() * (1.2 - 1.0) + 1.0;
              if (spawns[message.guild.id].rarity === 4 || spawns[message.guild.id].rarity === 5) {
                  basedef = ((powerbase)*(multiplier_)*1.2)/10;
                  baseatk = (basedef*1.1)*multiplier__;
              } else {
                  basedef = ((powerbase)*(multiplier_))/10;
                  baseatk = (basedef)*multiplier__;
              }

              const insertQuery = `INSERT INTO inventory (localID, rarity, charID, userID, picID, level, experience, basepower, basehp, basedef, baseatk, element) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
              const insertValues = [localID, spawns[message.guild.id].rarity, spawns[message.guild.id].charID, message.author.id, spawns[message.guild.id].picture, 1, 0, powerbase, basehp.toFixed(2), basedef.toFixed(2), baseatk.toFixed(2), element];
              const inserted = await connection.query(insertQuery, insertValues);
              return;
            } else {
              return message.reply({ content: 'Nome errado.' });
            }
          } catch (error) {
              console.error(error);
          }
    }
}