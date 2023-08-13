const Discord = require("discord.js");

module.exports =  {
    name: 'fav',
    async execute(client, message, args) {
        let localID = args[0];
        let emoji = args[1];
        if (emoji === undefined) emoji = '❤️';
        if (typeof localID !== 'number' && isNaN(localID)) return message.reply({ content: 'LocalID inválido.' });
        try {
            var connection = require('../database/connect.js');
            const checkQuery = `SELECT * FROM inventory WHERE userID = ? AND localID = ?`;
            const checkValues = [message.author.id, localID];
            const checkResults = await connection.query(checkQuery, checkValues);

            if (checkResults[0].length == 0) return message.reply({ content: 'LocalID inválido.' });

            //checa se o favorito existe, se existir retira ele
            if (checkResults[0][0].favorite !== null) {
                const sqlRemoveFavorite = `UPDATE inventory SET favorite = NULL WHERE userID = ? AND localID = ?`;
                const sqlRemoveFavValues = [message.author.id, localID];
                const sqlRemove = await connection.query(sqlRemoveFavorite, sqlRemoveFavValues);
                message.reply({ content: `Categoria removida do personagem ID ${localID}.` });
                return;
            } else {

                //checa se o emoji é valido
                if (emoji === null) return message.reply({ content: 'Emoji inválido. '});
                const emotes = (str) => str.match(/\p{Extended_Pictographic}/gu);
                if(emotes(emoji) === null) return message.reply({ content: 'Emoji inválido. '});

                const splitEmoji = (string) => [...new Intl.Segmenter().segment(string)].map(x => x.segment)

                let splited = splitEmoji(emoji);
    
                if (emotes(splited[0]) === null ) return message.reply({ content: 'Emoji inválido. '});


                // adiciona o favorito ao localid
                var sqlInsert = `UPDATE inventory SET favorite = '${splited[0]}' WHERE userID = ${message.author.id} AND localID = ${localID}`;
                const sqlSetFav = await connection.query(sqlInsert);
                message.reply({ content: `Personagem de ID ${localID} adicionado na categoria '${emoji}' com sucesso.` });
            }

        } catch (error) {
            console.error(error);
        }
    }
}