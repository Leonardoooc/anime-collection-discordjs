const Discord = require("discord.js");
const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports =  {
    data: new SlashCommandBuilder()
        .setName('fav')
        .setDescription('fav')
        .addStringOption(option => option.setName('localid').setDescription('id').setRequired(true))
        .addStringOption(option => option.setName('emoji').setDescription('emoji')),
    async execute(interaction, client) {
        return;
        let localID = interaction.options.getString('localid');
        let emoji = interaction.options.getString('emoji');
        if (typeof localID !== 'number' && isNaN(localID)) return interaction.reply({ content: 'LocalID inválido.' });
        try {
            var connection = require('../database/connect.js');
            const checkQuery = `SELECT * FROM inventory WHERE userID = ? AND localID = ?`;
            const checkValues = [interaction.user.id, localID];
            const checkResults = await connection.query(checkQuery, checkValues);

            if (checkResults[0].length == 0) return interaction.reply({ content: 'LocalID inválido.' });

            //checa se o favorito existe, se existir retira ele
            if (checkResults[0][0].favorite !== null) {
                const sqlRemoveFavorite = `UPDATE inventory SET favorite = NULL WHERE userID = ? AND localID = ?`;
                const sqlRemoveFavValues = [interaction.user.id, localID];
                const sqlRemove = await connection.query(sqlRemoveFavorite, sqlRemoveFavValues);
                interaction.reply({ content: `Categoria removida do personagem ID ${localID}.` });
                return;
            } else {

                //checa se o emoji é valido
                if (emoji === null) return interaction.reply({ content: 'Emoji inválido. '});
                const emotes = (str) => str.match(/\p{Extended_Pictographic}/gu);
                if(emotes(emoji) === null) return interaction.reply({ content: 'Emoji inválido. '});

                const splitEmoji = (string) => [...new Intl.Segmenter().segment(string)].map(x => x.segment)

                let splited = splitEmoji(emoji);
    
                if (emotes(splited[0]) === null ) return interaction.reply({ content: 'Emoji inválido. '});


                // adiciona o favorito ao localid
                var sqlInsert = `UPDATE inventory SET favorite = '${splited[0]}' WHERE userID = ${interaction.user.id} AND localID = ${localID}`;
                const sqlSetFav = await connection.query(sqlInsert);
                interaction.reply({ content: `Personagem de ID ${localID} adicionado na categoria '${emoji}' com sucesso.` });
            }

        } catch (error) {
            console.error(error);
        }
    }
}