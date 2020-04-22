const Chat = require('./chat');

/**
 * Représente un Lobby
 */
class Lobby {

    /**
     * Objets d'invitation de lobby
     * { fromUserID: int, toUserID: int, invitationID: int }
     */
    static invitations = [];
    static invitationIDCounter = 0;
    static lobbyIDCounter = 0;

    /**
     * @param user Utilisateur qui crée le lobby (= hôte)
     * @param GLOBAL L'instance globale de données du serveur
     */
    constructor(user, GLOBAL) {
        this.GLOBAL = GLOBAL;
        this.invitedUsers = []; // ne pas supprime les users ici si ils se deco !
        this.chat = new Chat();
        this.id = Lobby.lobbyIDCounter++;

        // le user à l'indice 0 => hôte
        this.users = [];
        this.targetUsersNb = 2; // de 2 à 8
        this.gameDuration = null; // durée en ms ou null pour illimité
        this.maxUsersNb = 8;
        this.open = true;

        this.addUser(user);
    }

    /**
     * @param user L'objet correspond à l'utilisateur à ajouter dans le lobby
     */
    addUser(user) {
        if (!this.open || this.users.indexOf(user) !== -1 || this.users.length >= this.maxUsersNb)
            return false;

        this.users.push(user);
        if (this.users.length > this.targetUsersNb)
            this.targetUsersNb = this.users.length;

        this.GLOBAL.network.lobbyUserListen(user, this);

        if (!this.isHost(user)) // message de rejoint
            this.GLOBAL.network.lobbySendMessage(this, null, user.nickname + ' a rejoint !');
    }

    /**
     * @param user L'objet correspond à l'utilisateur à retirer du lobby
     */
    delUser(user) {
        const ind = this.users.indexOf(user);
        if (ind === -1)
            return;
        const isInvited = this.invitedUsers.indexOf(user) !== -1;
        if (isInvited)
            return; // NE PAS LE SUPPRIMER CAR IL VIENT DACCEPTER LINVITATION LOBBY DUN AMI

        this.users.splice(ind, 1);

        if (this.users.length === 0) {
            this.maxUsersNb = 0;
            this.GLOBAL.lobbies.splice(this.GLOBAL.lobbies.indexOf(this), 1);
        } else {
            const newHost = this.users[0];
            this.GLOBAL.network.io.to(this.name).emit('lobbyUserLeftRes', {
                userID: user.id,
                hostID: newHost.id
            });
        }
        const inMM = this.GLOBAL.matchmaking.queue[this.targetUsersNb - 2].indexOf(this);
        if (inMM !== -1) {
            let err = Errors.SUCCESS;
            this.GLOBAL.matchmaking.delLobby(this);
            this.GLOBAL.network.io.to(this.name).emit('lobbyCancelPlayRes', {
                error: err.code,
                status: err.status
            });
        }
    }

    /**
     *
     * @param network Gestionnaire de réseau dont les users seront retirés
     */
    delete() {
        if (this.users.length === 0)
            return;

        for (const usr of this.users)
            this.delUser(usr);
    }

    /**
     * @param newNb le nouveau nombre de joueur souhaité pour la partie à jouer
     */
    changeTargetUsersNb(newNb) {
        if (newNb < 2)
            this.targetUsersNb = 2;
        else if (newNb > 8)
            this.targetUsersNb = 8;
        else if (newNb < this.users.length)
            this.targetUsersNb = this.users.length;
        else
            this.targetUsersNb = newNb;
    }

    /**
     * @param duration La durée souhaité en minutes (soit 30 soit 60 soit null pour illimité)
     * @return false si erreur (mauvaise durée) sinon true
     */
    changeDuration (duration) {
        if ([30, 60, null].indexOf(duration) === -1)
            return false;
        this.gameDuration = duration;
        return true;
    }

    searchGame() {
        this.GLOBAL.matchmaking.addLobby(this);
        this.open = false;
    }

    /**
     * @param nickname Le pseudo de l'utilisateur à chercher
     * @return l'utilisateur (user) si trouvé, sinon null
     */
    userByNickname(nickname) {
        for (const user of this.users) {
            if (user.nickname === nickname)
                return user;
        }

        return null;
    }

    /**
     * @param id L'ID de l'utilisateur à chercher
     * @return l'utilisateur (user) si trouvé, sinon null
     */
    userByID(id) {
        for (const user of this.users) {
            if (user.id === id)
                return user;
        }

        return null;
    }

    /**
     * @param user L'utilisateur qu'on veut tester hote ou non
     * @return true si il est l'hôte, false sinon
     */
    isHost(user) {
        return this.users[0] === user;
    }

    /**
     * @return le nom du lobby (utilisé comme socket room notamment)
     */
    get name() {
        return 'lobby-' + this.id;
    }

    /**
     * @param fromID L'ID de l'utilisateur qui envoie l'invitation
     * @param toID L'ID pseudo de l'utilisateur qui doit recevoir l'invitation
     * @return L'ID de l'invitation créée
     */
    addInvitation(fromID, toID) {
        Lobby.invitations.push({
            fromUserID: fromID,
            toUserID: toID,
            invitationID: Lobby.invitationIDCounter
        });

        return Lobby.invitationIDCounter++;
    }

    /*
     * @param id L'ID de l'invitation à supprimer
     * @return L'objet invitation si trouvé, false sinon
     */
    delInvitation(id) {
        for (let i = 0, l = Lobby.invitations.length; i < l; i++) {
            if (Lobby.invitations[i].invitationID === id) {
                const save = Lobby.invitations[i];
                Lobby.invitations.splice(i, 1);
                return save;
            }
        }
        return false;
    }
}

module.exports = Lobby;
