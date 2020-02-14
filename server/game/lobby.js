/**
 * Représente un Lobby
 */
class Lobby {
    constructor (id, nbPlayers, users, chat, maxPlayersNb, matchmaking) {
        this.id = id;
        this.nbPlayers = nbPlayers;
        this.users = users;
        this.chat = chat;
        if (maxPlayersNb < 2)
            this.maxPlayersNb = 2;
        else if (maxPlayersNb > 8)
            this.maxPlayersNb = 8;
        else
            this.maxPlayersNb = maxPlayersNb;
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

    /**
     * @param newNb le nouveau nombre de joueur de la partie à chercher
     */
    changeMaxPlayersNb (newNb) {
        // Si on veut changer pour un nombre plus petit que 2 on le met automatiquement à 2
        if (newNb < 2)
            this.maxPlayersNb = 2;
        // Si on veut changer pour un nombre plus grand que 8 on le met automatique à 8
        else if (newNb > 8)
            this.maxPlayersNb = 8;
        // Sinon le nombre est correct
        else
            this.maxPlayersNb = newNb;
    }

    searchGame () {
        this.matchmaking.addLobby(this);
    }
}

module.exports = Lobby;
