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
         * case indice 2 => Lobby pour une partie à 4 joueurs
         * case indice 3 => Lobby pour une partie à 5 joueurs
         * case indice 4 => Lobby pour une partie à 6 joueurs
         * case indice 5 => Lobby pour une partie à 7 joueurs
         * case indice 6 => Lobby pour une partie à 8 joueurs
        */
        this.games = [];
        this.playersWaiting = new Array(7);
        let i;
        for (i = 0; i < 7; i++)
            this.playersWaiting[i] = [];
        setInterval(this.checkLaunch.bind(this), 1e3);
    }

    /**
     * @param lobby L'objet correspondant au lobby à ajouter au matchmaking
     */
    addLobby (lobby) {
        // On lance la partie directement si le nombre de joueurs correspond au nombre de joueurs attendus pour la partie
        if (lobby.targetUsersNb === lobby.nbUsers) {
            // objet game à compléter après implémentation de la classe de ce dernier
            /* const game = new Gameboard(lobby.users);
            this.games.push(game);*/
            console.log("YIKES");
        }
        // Sinon on l'insère dans la bonne file d'attente
        else {
            const index = lobby.targetUsersNb - 2;
            if (this.playersWaiting[index].indexOf(lobby) === -1)
                this.playersWaiting[index].push(lobby);
        }
    }

    /**
     * @param lobby L'objet correspondant au lobby à supprimer
     */
    delLobby (lobby) {
        const index = lobby.targetUsersNb - 2;
        if (this.playersWaiting[index].indexOf(lobby) !== -1)
            this.playersWaiting[index].splice(this.playersWaiting[index].indexOf(lobby), 1);
    }

    checkLaunch () {
        for (let i = 0; i < 7; i++) {
            let nbMax = i+2;
            for (let j = 0; j < this.playersWaiting[i].length; j++) {
                let sum = this.playersWaiting[i][j].nbUsers;
                let fusion = [];
                for (let k = 0; k < this.playersWaiting[i].length; k++) {
                    sum += this.playersWaiting[i][k].nbUsers;
                    if (k !== j) {
                        if (sum < nbMax) {
                            if (fusion.indexOf(j) === -1)
                                fusion.push(i);
                            if (fusion.indexOf(k) === -1)
                                fusion.push(j);
                        }
                        else if (sum > nbMax)
                            sum -= this.playersWaiting[i][k].nbUsers;
                        else {
                            if (fusion.indexOf(j) === -1)
                                fusion.push(j);
                            if (fusion.indexOf(k) === -1)
                                fusion.push(k);
                            let mergedLobby = [];
                            for (let f of fusion)
                                mergedLobby = mergedLobby.concat(this.playersWaiting[i][f].users);

                            for (let f of fusion) {
                                // f < this.playersWaiting[i].length
                                this.delLobby(this.playersWaiting[i][f]);
                            }
                            // Ici il faudra instancier un Gameboard et l'ajouter au tableau games de matchmaking, après l'implémentation de la classe Gameboard
                            console.log("Lobbys fusionnés!");
                        }
                    }
                }
            }
        }
    }
}

// TEST de la fusion des lobbys -- A SUPPRIMER!
let match = new Matchmaking(0);
let lob1 = new Lobby(0, {}, match);
let lob2 = new Lobby(1, {}, match);
let lob3 = new Lobby(2, {}, match);
let lob4 = new Lobby(3, {}, match);
let lob5 = new Lobby(4, {}, match);
let lob6 = new Lobby(5, {}, match);
lob1.addUser({});
lob1.addUser({});
lob1.addUser({});
lob2.addUser({});
lob3.addUser({});
lob3.addUser({});
lob3.addUser({});
lob3.addUser({});
lob3.addUser({});
lob5.addUser({});
lob5.addUser({});
lob6.addUser({});
lob6.addUser({});
lob6.addUser({});
lob6.addUser({});
lob6.addUser({});
lob1.changeMaxPlayersNb(5);
lob2.changeMaxPlayersNb(5);
lob3.changeMaxPlayersNb(5);
lob4.changeMaxPlayersNb(5);
lob5.changeMaxPlayersNb(5);
lob6.changeMaxPlayersNb(6);
match.addLobby(lob1);
match.addLobby(lob2);
match.addLobby(lob3);
match.addLobby(lob4);
match.addLobby(lob5);
match.addLobby(lob6);
console.log(lob1.nbUsers);
console.log(lob2.nbUsers);
console.log(lob3.nbUsers);
console.log(lob4.nbUsers);
console.log(lob5.nbUsers);
