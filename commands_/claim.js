const Discord = require("discord.js");
const { SlashCommandBuilder } = require('@discordjs/builders');
let localID;

module.exports =  {
    data: new SlashCommandBuilder()
        .setName('claim')
        .setDescription('claim')
        .addStringOption(option => option.setName('inputname').setDescription('name').setRequired(true)),
    async execute(interaction, client) {
      return;
        let inputName = interaction.options.getString('inputname');
        try {
            var connection = require('../database/connect.js');
            const checkQuery = `SELECT * FROM user WHERE userID = ?`;
            const checkValues = [interaction.user.id];
            const checkResults = await connection.query(checkQuery, checkValues);
      
            //check if is registered
            if (checkResults[0].length == 0) {
              let embed = new Discord.EmbedBuilder()
                .setTitle(`Novo usuário no ThiefGami`)
                .setColor('#FFA500')
                .setDescription('Inicie no ThiefGami utilizando o comando START');
              return interaction.reply({ embeds: [embed]});
            }
      
            if (spawnManager.getTotalName() === undefined) return interaction.reply({ content: 'Não há nenhum personagem para claimar no momento.' });
      
            if (inputName.toLowerCase() === spawnManager.getTotalName().toLowerCase()) {

              //claimar o personagem
              interaction.reply({ content: `Você claimou o personagem **${spawnManager.getTotalName()}** com sucesso!`});
              let embedClaim = spawnManager.getEmbedClaim();
              let descriptionNew = spawnManager.getEmbedTest().data.description;
              let image = spawnManager.getEmbedTest().data.image.url;
              descriptionNew += `\n\nObtido por ${interaction.user}`;

              let embedNew = new Discord.EmbedBuilder(embedClaim.embeds[0])
                .setDescription(descriptionNew)
                .setImage(`${image}`);
              
              spawnManager.setEmbedClaim({ embeds: [embedNew] });
      

              //adicionar o personagem ao inventário
              const searchQuery = `SELECT * FROM inventory WHERE userID = ?`;
              const searchQueryValues = [interaction.user.id];
              const searchResults = await connection.query(searchQuery, searchQueryValues);
              if (searchResults[0].length == 0) {
                localID = 0;
              } else {
                const newLocalIDQuery = `SELECT MAX(localID) as max FROM inventory WHERE userID = ${interaction.user.id}`
                const newLocalIDResults = await connection.query(newLocalIDQuery);
                localID = newLocalIDResults[0][0].max + 1;
              }
              const insertQuery = `INSERT INTO inventory (localID, rarity, charID, userID, picID) VALUES (?, ?, ?, ?, ?)`;
              const insertValues = [localID, spawnManager.getRarity(), spawnManager.getCharID(), interaction.user.id, spawnManager.getPicture()];
              spawnManager.setTotalName(undefined);
              await connection.query(insertQuery, insertValues);
              return;
            } else {
              return interaction.reply({ content: 'Nome errado.' });
            }
          } catch (error) {
              console.error(error);
          }
    }
}