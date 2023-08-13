const mysql = require('mysql2/promise');

module.exports = {
    async mysqlConnection() {
        const connection = await mysql.createConnection({
            host: 'localhost',
            user: 'root',
            database: 'thiefgami',
            supportBigNumbers: true,
            bigNumberStrings: true
        });

        console.log('Conectado com ID: ' + connection.threadId);
        module.exports = connection;
        return connection;
    }
}