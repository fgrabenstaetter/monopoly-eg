const Constants = require('../lib/constants');
const bcrypt = require('bcrypt');

/**
 * Représente un utilisateur (client connecté)
 */
class User {

    static idCounter = 0;

    /**
     * @param rawPassword Le mot de passe en clair
     * @param cb La fonction de callback
     * @callback-return null si erreur, le hash sinon
     */
    static encryptPassword (rawPassword, cb) {
        const saltRounds = 10;
        bcrypt.hash(rawPassword, saltRounds, (err, hash) => {
            if (err != null) {
                cb(null);
                return;
            }
            cb(hash);
        });
    }

    /**
     * @param rawPassword Le mot de passe en clair
     * @param hashPassword Le mot de passe hashé
     * @param cb La fonction de callback
     * @callback-return false s'ils ne correpondent pas, true sinon
     */
    static validPassword (rawPassword, hashPassword, cb) {
        bcrypt.compare(rawPassword, hashPassword, (err, res) => {
            if (err == null && res === true)
                callback(true);
            else
                callback(false);
        });
    }


    /**
     * @param email L'email à tester
     * @return true si email est valide, false sinon
     */
    static isEmail (email) {
        const regex = /^[a-zA-Z0-9_.-]+@[A-Za-z]{2,6}/;
        return regex.test(email);
    }

    /*
     * @param userModel Le modèle d'utilisateur associé aux données
     */
    constructor (userModel) {
        this.id = idCounter ++;
        this.nickname = userModel.nickname;
        this.email = userModel.email;
        // this.friends = userModel.friends;
        this.inscriptionDatetime = userModel.inscriptionDatetime;
        this.level = userModel.level;
        this.exp = userModel.exp;

        this.levelUpExp = 100;
        this.socket = null;
    }

    /**
     * @param exp L'expérience à ajouter pour le niveau actuel
     */
    addExperience (exp) {
        this.exp += exp;
        while (this.exp > this.levelUpExp) {
            this.level ++;
            this.exp = this.exp - this.levelUpExp;
        }
    }
}
