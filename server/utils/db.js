const mysql = require('mysql');
const bcrypt = require('bcrypt');

class DB {

    constructor (db) {
        this.db = mysql.createConnection({
                host: 'localhost',
                user: 'root',
                password: 'test',
                database: 'testDB'
            });
    }

    // @param pseudo le pseudo du client
    // @param password le mot de passe en clair
    // @callback-return true si connexion réussie, false sinon
    login (pseudo, password, callback) {
        this.db.query(
            'SELECT * FROM users WHERE pseudo = ?',
            [pseudo],
            (error, results, fields) => {
                if (error != null || results.length != 1) {
                    callback(false);
                    return;
                }

                const hash = results[0].password;
                bcrypt.compare(password, hash, (err, res) => {
                    if (err == null && res === true)
                        callback(true);
                    else
                        callback(false);
                });
            });
    }

    // @param pseudo le pseudo du nouveau client
    // @param password le mot de passe en clair
    // @callback-return true si inscription réussie, false sinon
    register (pseudo, password, callback) {
        if (password.length < 4) {
            callback(false);
            return;
        }

        const saltRounds = 10;
        bcrypt.hash(password, saltRounds, (err, hash) => {
            if (err != null) {
                callback(false);
                return;
            }

            // ajouter contrainte sql pseudo unique
            this.db.query(
                'INSERT INTO users(pseudo, password) VALUES (?, ?)',
                [pseudo, hash],
                (error, results, fields) => {
                    if (error == null)
                        callback(true);
                    else
                        callback(false);
                }
            );
        });
    }
}

module.exports = DB;
