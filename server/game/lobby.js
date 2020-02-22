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
    lobbyIDCounter = 0;

    /**
     * @param user Utilisateur qui crée le lobby (= hôte)
     * @param matchmaking L'instance globale de matchmaking du serveur
     */
    constructor (user, matchmaking) {
        this.matchmaking = matchmaking;
        this.chat = new Chat();
        this.id = this.lobbyIDCounter ++;

        // le user à l'indice 0 => hôte
        this.users = [user];
        this.pawns = [0]; // pion par défaut pour l'hôte
        // pawn = int de 0 à 7 (car max 8 joueurs = 8 pions différents)

        this.targetUsersNb = 1000; // de 2 à 8
        this.open = true;
    }

    /**
     * @param user L'objet correspond à l'utilisateur à ajouter dans le lobby
     */
    addUser (user) {
        if (!this.open || this.users.indexOf(user) !== -1 || this.users.length >= 8)
            return;
        this.users.push(user);
        this.pawns.push(0);
        if (this.users.length > this.targetUsersNb)
            this.targetUsersNb = this.users.length;
    }

    /**
     * @param user L'objet correspond à l'utilisateur à retirer du lobby
     */
    delUser (user) {
        const ind = this.users.indexOf(user);
        if (ind === -1)
            return;

        this.users.splice(ind, 1);
        this.pawns.splice(ind, 1);
        // this.network.lobbyUserStopListening(user);
    }

    /**
     * 
     * @param network Gestionnaire de réseau dont les users seront retirés 
     */
    delete () {
        if (this.users.length === 0)
            return;
        
        for (const usr of this.users)
            this.delUser(usr);
    }

    /**
     * @param newNb le nouveau nombre de joueur souhaité pour la partie à jouer
     */
    changeTargetUsersNb (newNb) {
        if (newNb < 2)
            this.targetUsersNb = 2;
        else if (newNb > 8)
            this.targetUsersNb = 8;
        else if (newNb < this.users.length)
            this.targetUsersNb = this.users.length;
        else
            this.targetUsersNb = newNb;
    }

    searchGame () {
        this.matchmaking.addLobby(this);
        this.open = false;
    }

    /**
     * @param nickname Le pseudo de l'utilisateur à chercher
     * @return l'utilisateur (user) si trouvé, sinon null
     */
    userByNickname (nickname) {
        for (const user of this.users) {
            if (user.nickname === nickname)
                return user;
        }

        return null;
    }

    /**
     * @param user L'utilisateur dont on veut récupérer le pion
     * @return son pion (int) si user trouvé, sinon null
     */
    userPawn (user) {
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
    changePawn (user, pawn) {
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
    isHost (user) {
        return this.users[0] === user;
    }

    /**
     * @return un pion disponible
     */
    get nextPawn () {
        for (let i = 0; i < 7; i ++) {
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
