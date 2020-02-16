const Chat = require('./chat');

/**
 * Représente un Lobby
 */
class Lobby {

    /**
     * Objets d'invitation de lobby
     * { from: pseudoEmetteur, to: pseudoDestinataire, id: int }
     */
    invitations = [];
    invitationIDCounter = 0;

    /**
     * @param lobbies La liste de tous les lobbies du serveur
     * @param network L'instance globale network du serveur
     * @param user L'utilisateur qui veut créer le lobby
     * @param matchmaking L'instance globale de matchmaking du serveur
     */
    constructor (lobbies, network, user, matchmaking) {
        this.lobbies = lobbies;
        this.network = network;
        this.matchmaking = matchmaking;
        this.chat = new Chat();

        // le user à l'indice 0 => hôte
        this.users = [user];
        this.pawns = [0]; // pion par défaut pour l'hôte
        this.targetUsersNb = 4;
        this.lobbies.push(this);
    }

    /**
     * @param user L'objet correspond à l'utilisateur à ajouter dans le lobby
     */
    addUser (user) {
        if (this.users.indexOf(user) !== -1 || this.users.length >= this.targetUsersNb)
            return;

        this.users.push(user);
        this.pawns.push(0);
        this.network.lobbyListen(user, this);
    }

    /**
     * @param user L'objet correspond à l'utilisateur à retirer du lobby
     */
    delUser (user) {
        const ind = this.users.indexOf(user);
        if (ind === -1)
            return;

        if (ind === 0) {
            // l'hôte est parti, ferme ce lobby
            this.targetUsersNb = 0; // bloquer l'accès au lobby
            for (let i = 1, l = this.users.length; i < l; i ++)
                this.delUser(this.users[i]);
            this.delUser(this.users[0]);

            // supprimer le lobby de la liste globale des lobbies
            const lobInd = this.lobbies.indexOf(this);
            if (lobInd !== -1)
                this.lobbies.splice(lobInd, 1);
        }

        this.users.splice(ind, 1);
        this.pawns.splice(ind, 1);
        this.network.lobbyStopListening(user);
    }

    delete () {
        if (this.users.length === 0)
            return;
        this.delUser(this.users[0]);
    }

    /**
     * @param newNb le nouveau nombre de joueur souhaité pour la partie à jouer
     */
    changeTargetUsersNb (newNb) {
        if (newNb < 2)
            this.targetUsersNb = 2;
        else if (newNb > 8)
            this.targetUsersNb = 8;
        else
            this.targetUsersNb = newNb;
    }

    searchGame () {
        this.matchmaking.addLobby(this);
        this.targetUsersNb = 0; // bloquer l'accès
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
