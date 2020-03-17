const Constants = require('../lib/constants');
const { UserSchema, UserManager } = require('../models/user');

/**
 * Représente un utilisateur (client connecté)
 */
class User {

    /*
     * @param userSchema Le modèle d'utilisateur associé aux données
     */
    constructor (userSchema) {
        this.id = userSchema.id;
        this.nickname = userSchema.nickname;
        this.email    = userSchema.email;
        this.level    = userSchema.level;
        this.exp      = userSchema.exp;
        this.inscriptionDatetime = userSchema.inscriptionDatetime;

        this.userSchema = userSchema;

        this.levelUpExp = 100;
        this.socket = null;
    }

    /**
     * Renvoie les amis (tableau d'ids) de User
     */
    get friends() {
        let friends = [];

        UserSchema.getAcceptedFriends(this.id, (error, friendships) => {
            if (!friendships || error || friendships.length == 0)
                return [];

            for (let i = 0; i < friendships.length; i++)
                friends.push(friendships[i].friend._id);
            
            return friends;
        });
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
