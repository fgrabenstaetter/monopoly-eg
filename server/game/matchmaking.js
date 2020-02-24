const Lobby = require('./lobby');
const Game = require('./game');

/**
 * Représente un matchmaking (recherche de partie)
 */
class Matchmaking {

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
        this.queue = new Array(7);
        for (let i = 0; i < 7; i++)
            this.queue[i] = [];

        setInterval(this.checkLaunch.bind(this), 1e3);
    }

    /**
     * @param lobby L'objet correspondant au lobby à ajouter au matchmaking
     */
    addLobby (lobby) {
        if (lobby.targetUsersNb === lobby.users.length) {
            // On lance la partie directement si le nombre de joueurs correspond au nombre de joueurs attendus pour la partie
            this.createGame(lobby);
            return;
        }

        // Sinon on l'insère dans la bonne file d'attente
        const index = lobby.targetUsersNb - 2;
        if (this.queue[index].indexOf(lobby) === -1)
            this.queue[index].push(lobby);
    }

    /**
     * @param lobby L'objet correspondant au lobby à supprimer
     */
    delLobby (lobby) {
        const index = lobby.targetUsersNb - 2;
        if (this.queue[index].indexOf(lobby) !== -1) {
            lobby.delete();
            this.queue[index].splice(this.queue[index].indexOf(lobby), 1);
        }
    }

    /**
     * @param lobbies La liste des lobbies qui matchent pour jouer
     */
    createGame (lobbies) {
        let users = [], pawns = [];
        for (const lobby of lobbies) {
            users = users.concat(lobby.users);
            pawns = pawns.concat(lobby.pawns);
            this.delLobby(lobby);
        }

        let game = new Game(users, pawns, lobbies[0].network, this.games);
        this.GLOBAL.games.push(game);
    }

    checkLaunch () {
        for (let i = 0; i < 7; i++) {
            let nbMax = i + 2;

            for (let j = 0; j < this.queue[i].length; j++) {
                let sum = this.queue[i][j].users.length;
                let fusion = [];

                for (let k = 0; k < this.queue[i].length; k++) {
                    sum += this.queue[i][k].users.length;

                    if (k !== j) {
                        if (sum < nbMax) {
                            if (fusion.indexOf(j) === -1)
                                fusion.push(i);
                            if (fusion.indexOf(k) === -1)
                                fusion.push(j);
                        } else if (sum > nbMax)
                            sum -= this.queue[i][k].users.length;
                        else {
                            if (fusion.indexOf(j) === -1)
                                fusion.push(j);
                            if (fusion.indexOf(k) === -1)
                                fusion.push(k);

                            let mergedLobby = [];
                            for (let f of fusion)
                                lobbies.push(this.queue[i][f]);

                            this.createGame(lobbies);
                        }
                    }
                }
            }
        }
    }
}

module.exports = Matchmaking;
