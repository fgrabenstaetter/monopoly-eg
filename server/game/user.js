const Constants = require('../lib/constants');

/**
 * Représente un utilisateur (client connecté)
 */
class User {

    /*
     * @param userSchema Le modèle d'utilisateur associé aux données
     */
    constructor (userSchema) {
        this.nickname = userSchema.nickname;
        this.email = userSchema.email;
        this.friends = userSchema.friends;
        this.inscriptionDatetime = userSchema.inscriptionDatetime;
        this.level = userSchema.level;
        this.exp = userSchema.exp;

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

module.exports = User;
