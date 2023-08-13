const Discord = require("discord.js");

module.exports =  {
    name: 'favl',
    async execute(client, message, args) {
        let emoji = args[0];
        if (emoji === undefined) emoji = '❤️';
        try {
            var connection = require('../database/connect.js');
            var getLocalID = `SELECT MAX(localID) as max FROM inventory WHERE userID = ${message.author.id}`
            const localGet = await connection.query(getLocalID);
            let localID = localGet[0][0].max;
            var getLatest = `SELECT * FROM inventory WHERE localID = ${localID} AND userID = ${message.author.id}`;
            const checkResults = await connection.query(getLatest);

            if (checkResults[0].length == 0) return message.reply({ content: 'Sem personagens para favoritar.' });

            //checa se o favorito existe, se existir retira ele
            if (checkResults[0][0].favorite !== null) {
                const sqlRemoveFavorite = `UPDATE inventory SET favorite = NULL WHERE userID = ${message.author.id} AND localID = ${localID}`;
                const sqlRemove = await connection.query(sqlRemoveFavorite);
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