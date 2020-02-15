//const Chat = require('./chat.js');

/**
 * Représente un Lobby
 */
class Lobby {
    /**
     * @param id ID unique pour le lobby
     * @param user L'utilisateur qui veut créer le lobby
     * @param matchmaking L'instance globale de matchmaking du serveur
     */
    constructor (id, user, matchmaking) {
        this.id = id;
        this.users = [user];
        //this.chat = new Chat();
        this.targetUsersNb = 4;
        // Il y aura un seul objet matchmaking qui sera un attribut de chaque objet Lobby pour simplifier
        this.matchmaking = matchmaking;
    }

    /**
     * @param user L'objet correspond à l'utilisateur à ajouter dans le lobby
     */
    addUser (user) {
        if (this.users.indexOf(user) === -1)
            this.users.push(user);
    }

    /**
     * @param user L'objet correspond à l'utilisateur à retirer du lobby
     */
    delUser (user) {
        if (this.users.indexOf(user) !== -1)
            this.users.splice(this.users.indexOf(user), 1);
    }

    get nbUsers () {
        return this.users.length;
    }

    /**
     * @param newNb le nouveau nombre de joueur de la partie à chercher
     */
    changeMaxPlayersNb (newNb) {
        // Si on veut changer pour un nombre plus petit que 2 on le met automatiquement à 2
        if (newNb < 2)
            this.targetUsersNb = 2;
        // Si on veut changer pour un nombre plus grand que 8 on le met automatique à 8
        else if (newNb > 8)
            this.targetUsersNb = 8;
        // Sinon le nombre est correct
        else
            this.targetUsersNb = newNb;
    }

    searchGame () {
        this.matchmaking.addLobby(this);
    }
}

module.exports = Lobby;
