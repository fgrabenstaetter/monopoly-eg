const Chat = require('./chat');

/**
 * Représente un Lobby
 */
class Lobby {
t
    /**
     * Objets d'invitation de lobby
     * { from: pseudoEmetteur, to: pseudoDestinataire, id: int }
     */
    invitations = [];
    invitationIDCounter = 0;


    /**
     * @param id ID unique pour le lobby
     * @param network L'instance globale network du serveur
     * @param user L'utilisateur qui veut créer le lobby
     * @param matchmaking L'instance globale de matchmaking du serveur
     */
    constructor (id, network, user, matchmaking) {
        this.id = id;
        this.network = network;
        // le user à l'indice 0 => hôte
        this.users = [user];
        this.chat = new Chat();
        this.targetUsersNb = 4;
        this.matchmaking = matchmaking;
    }

    /**
     * @param user L'objet correspond à l'utilisateur à ajouter dans le lobby
     */
    addUser (user) {
        if (this.users.indexOf(user) === -1) {
            this.users.push(user);
            this.network.lobbyListen(user, this);
        }
    }

    /**
     * @param user L'objet correspond à l'utilisateur à retirer du lobby
     */
    delUser (user) {
        const ind = this.users.indexOf(user);
        if (ind === 0) {
            // l'hôte est parti, ferme ce lobby
            this.targetUsersNb = 0; // bloquer l'accès au lobby (solution temporaire)
            for (let i = 1, l = this.users.length; i < l; i ++)
                this.delUser(this.users[i]);
            this.delUser(this.users[0]);
        } else if (ind !== -1) {
            this.users.splice(this.users.indexOf(user), 1);
            this.network.lobbyStopListening(user);
        }
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
        this.targetUsersNb = 0; // sol. temporaire pour bloquer l'accès
    }

    /**
     * @param from Le pseudo de l'utilisateur qui envoie l'invitation
     * @param to Le pseudo de l'utilisateur qui doit recevoir l'invitation
     * @return L'ID de l'invitation créée
     */
    static addInvitation (from, to) {
        this.invitations.push( {
            from: from,
            to: to,
            id: this.invitationIDCounter
        });
        return this.invitationIDCounter ++;
    }

    /*
     * @param id L'ID de l'invitation à supprimer
     * @return L'objet invitation si trouvé, false sinon
     */
    static delInvitation (id) {
        for (let i = 0, l = this.invitations.length; i < l; i ++) {
            if (this.invitations[i].id === id) {
                const save = this.invitations[i];
                this.invitations.splice(i, 1);
                return save;
            }
        }
        return false;
    }
}

module.exports = Lobby;
