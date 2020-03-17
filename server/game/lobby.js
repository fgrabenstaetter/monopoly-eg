const Chat = require('./chat');

/**
 * Représente un Lobby
 */
class Lobby {

    /**
     * Objets d'invitation de lobby
     * { from: fromUserID: int, toUserID: int, invitationID: int }
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
        this.chat = new Chat();
        this.id = Lobby.lobbyIDCounter++;

        // le user à l'indice 0 => hôte
        this.users = [];
        this.pawns = [];
        // pawn = int de 0 à 7 (car max 8 joueurs = 8 pions différents)

        this.targetUsersNb = 4; // de 2 à 8
        this.maxUsersNb = 100; // TEMPORAIRE (normalement 8)
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
        this.pawns.push(0);
        if (this.users.length > this.targetUsersNb)
            this.targetUsersNb = this.users.length;

        this.GLOBAL.network.lobbyUserListen(user, this);
    }

    /**
     * @param user L'objet correspond à l'utilisateur à retirer du lobby
     */
    delUser(user) {
        const ind = this.users.indexOf(user);
        if (ind === -1)
            return;

        this.pawns.splice(ind, 1);
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
     * @param user L'utilisateur dont on veut récupérer le pion
     * @return son pion (int) si user trouvé, sinon null
     */
    userPawn(user) {
        const ind = this.users.indexOf(user);
        if (ind !== -1)
            return this.pawns[ind];
        return null;
    }

    /**
     * @param user L'utilisateur dont on veut modifier le pion
     * @param pawn Le nouveau pion
     * @return true si succès, false sinon (pion déjà utilisé)
     */
    changePawn(user, pawn) {
        const ok = this.pawns.indexOf(pawn) === -1;
        if (!ok)
            return false;

        this.pawns[this.users.indexOf(user)] = pawn;
        return true;
    }

    /**
     * @param user L'utilisateur qu'on veut tester hote ou non
     * @return true si il est l'hôte, false sinon
     */
    isHost(user) {
        return this.users[0] === user;
    }

    /**
     * @return un pion disponible
     */
    get nextPawn() {
        for (let i = 0; i < 7; i++) {
            if (this.pawns.indexOf(i) === -1)
                return i;
        }
        // ne peut pas arriver ici
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
        console.log(Lobby.invitations);

        return Lobby.invitationIDCounter++;
    }

    /*
     * @param id L'ID de l'invitation à supprimer
     * @return L'objet invitation si trouvé, false sinon
     */
    delInvitation(id) {
        console.log(Lobby.invitations);
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
