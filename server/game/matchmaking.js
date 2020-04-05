const Lobby = require('./lobby');
const Game = require('./game');

/**
 * Représente un matchmaking (recherche de partie)
 */
class Matchmaking {
    static queue = new Array(7);
    /**
     * @param GLOBAL L'instance globale de données du serveur
     */
    constructor (GLOBAL) {
        this.GLOBAL = GLOBAL;

        /** Tableau de 6 cases => 1 case pour chaque nb de joueurs souhaité par des lobby
         * case indice 0 => Lobby pour une partie à 2 joueurs
         * case indice 1 => Lobby pour une partie à 3 joueurs
         * ...
         * case indice 6 => Lobby pour une partie à 8 joueurs
         */
        //Matchmaking.queue = new Array(7);
        for (let i = 0; i < 7; i++)
            Matchmaking.queue[i] = [];

        setInterval(this.checkLaunch.bind(this), 1e3);
    }

    /**
     * @param lobby L'objet correspondant au lobby à ajouter au matchmaking
     */
    addLobby (lobby) {
        if (lobby.targetUsersNb === lobby.users.length) {
            // On lance la partie directement si le nombre de joueurs correspond au nombre de joueurs attendus pour la partie
            this.createGame([lobby]);
            return;
        }

        // Sinon on l'insère dans la bonne file d'attente
        const index = lobby.targetUsersNb - 2;
        if (Matchmaking.queue[index].indexOf(lobby) === -1)
            Matchmaking.queue[index].push(lobby);
    }

    /**
     * @param lobby L'objet correspondant au lobby à supprimer
     */
    delLobby (lobby) {
        const index = lobby.targetUsersNb - 2;
        if (Matchmaking.queue[index].indexOf(lobby) !== -1) {
            lobby.delete();
            Matchmaking.queue[index].splice(Matchmaking.queue[index].indexOf(lobby), 1);
        }
    }

    /**
     * @param lobbies La liste des lobbies qui matchent pour jouer
     */
    createGame (lobbies) {
        let users = [], nb = 0;
        const duration = lobbies[0].gameDuration; // TMP
        for (const lobby of lobbies) {
            users = users.concat(lobby.users);
            this.delLobby(lobby);
        }

        let game = new Game(users, duration, this.GLOBAL);
        this.GLOBAL.games.push(game);

        // signaler à tous les joueurs que la partie a été trouvée
        for (const usr of users)
            usr.socket.emit('lobbyGameFoundRes');
    }

    checkLaunch () {
        for (let i = 0; i < 7; i++) {
            let nbMax = i + 2;

            for (let j = 0; j < Matchmaking.queue[i].length; j++) {
                let sum = Matchmaking.queue[i][j].users.length;
                let fusion = [];

                for (let k = 0; k < Matchmaking.queue[i].length; k++) {
                    if (k !== j) {
                        sum += Matchmaking.queue[i][k].users.length;
                        if (sum < nbMax) {
                            if (fusion.indexOf(j) === -1)
                                fusion.push(i);
                            if (fusion.indexOf(k) === -1)
                                fusion.push(j);
                        }
                        else if (sum > nbMax) {
                            sum -= Matchmaking.queue[i][k].users.length;
                        }
                        else {
                            if (fusion.indexOf(j) === -1)
                                fusion.push(j);
                            if (fusion.indexOf(k) === -1)
                                fusion.push(k);

                            let mergedLobby = [];
                            for (let f of fusion)
                                mergedLobby.push(Matchmaking.queue[i][f]);

                            this.createGame(mergedLobby);
                        }
                    }
                }
            }
        }
    }
}

module.exports = Matchmaking;
