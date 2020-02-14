const Lobby = require('./lobby.js');
/**
 * Représente un matchmaking (recherche de partie)
 */
class Matchmaking {
    constructor (id) {
        this.id = id;
        /** Tableau de 6 cases => 1 case pour chaque nbMax de joueurs souhaité par des lobby par    exemple
         * case indice 0 => Lobby pour une partie à 2 joueurs
         * case indice 1 => Lobby pour une partie à 3 joueurs
        */
        this.games = [];
        this.playersWaiting = new Array(6);
        let i;
        for (i = 0; i < 6; i++)
            this.playersWaiting[i] = [];
        setInterval(this.checkLaunch.bind(this), 1e3);
    }

    /**
     * @param lobby L'objet correspondant au lobby à ajouter au matchmaking
     */
    addLobby (lobby) {
        // On lance la partie directement si le nombre de joueurs correspond au nombre de joueurs attendus pour la partie
        if (lobby.maxPlayersNb === lobby.nbPlayers) {
            // objet game à compléter après implémentation de la classe de ce dernier
            const game = new Gameboard(lobby.users);
            this.games.push(game);
        }
        else {
            const index = lobby.maxPlayersNb - 2;
            if (this.playersWaiting[index].indexOf(lobby) === -1)
                this.playersWaiting[index].push(lobby);
        }
    }

    /**
     * @param lobby L'objet correspondant au lobby à supprimer
     */
    delLobby (lobby) {
        const index = lobby.maxPlayersNb - 2;
        if (this.playersWaiting[index].indexOf(lobby) !== -1)
            this.playersWaiting[index].splice(this.playersWaiting[index].indexOf(lobby), 1);
    }

    checkLaunch () {
        let i, j, k;
        for (i = 0; i < 6; i++) {
            const nbMax = i+2;
            for (j = 0; j < this.playersWaiting[i].length; j++) {
                let sum = this.playersWaiting[i][j].nbPlayers;
                for (k = 0; k < this.playersWaiting[i].length; k++) {
                    let lobbyUnion = [];
                    sum += this.playersWaiting[i][k].nbPlayers;
                    if (sum === nbMax) {
                        lobbyUnion = this.playersWaiting[i][j].users.concat(this.playersWaiting[i][k].users);
                        this.delLobby(this.playersWaiting[i][j]);
                        this.delLobby(this.playersWaiting[i][k]);
                        console.log("HELLO WORLD!")
                        //const game = new Gameboard(lobbyUnion);
                        //this.games.push(game);
                    }
                    else if (sum > nbMax){
                        sum -= this.playersWaiting[i][k].nbPlayers;
                        console.log("Je passe mon tour!");
                    }
                }
            }
        }
    }
}

let match = new Matchmaking(0);
let lob1 = new Lobby(0, 1, [], {}, 6, match);
let lob2 = new Lobby(1, 1, [], {}, 6, match);
let lob3 = new Lobby(2, 1, [], {}, 6, match);
let lob4 = new Lobby(3, 2, [], {}, 6, match);
let lob5 = new Lobby(4, 5, [], {}, 6, match);
match.addLobby(lob1);
match.addLobby(lob2);
match.addLobby(lob3);
match.addLobby(lob4);
match.addLobby(lob5);
for (i = 0; i < 5; i++)
    console.log(match.playersWaiting[i]);
for (i = 0; i < 5; i++)
    console.log(match.playersWaiting[i]);
module.exports = Matchmaking;
