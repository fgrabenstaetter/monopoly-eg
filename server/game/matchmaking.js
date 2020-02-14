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
        this.playersWaiting = Array(6);
        setInterval(this.checkLaunch.bind(this), 1e3);
    }

    /**
     * @param lobby L'objet correspondant au lobby à ajouter au matchmaking
     */
    addLobby (lobby) {
        if (this.playersWaiting[lobby.maxPlayersNb - 2].indexOf(lobby) === -1)
            this.playersWaiting[lobby.maxPlayersNb - 2].push(lobby);
    }

    /**
     * @param lobby L'objet correspondant au lobby à supprimer
     */
    delLobby (lobby) {
        if (this.playersWaiting[lobby.maxPlayersNb - 2].indexOf(lobby) !== -1)
            this.playersWaiting[lobby.maxPlayersNb - 2].splice(this.playersWaiting[lobby.maxPlayersNb -2].indexOf(lobby), 1);
    }

    /**
     * @param nbForLaunch Le nombre de joueurs pour lancer une partie
     */
    checkLaunch (nbForLaunch) {
        // Si le nombre de joueurs pour lancer correspond déjà à un lobby contenant ce nombre de joueurs
        if (this.playersWaiting[nbForLaunch - 2].length !== 0) {
            // Choisir un lobby aléatoire parmi ceux qui sont disponibles
            let random = Math.floor(Math.random() * (this.playersWaiting[nbForLaunch].length - 0 + 1) + 0);
            return [this.playersWaiting[nbForLaunch - 2][random].users, nbForLaunch];
        }
        //Sinon chercher des lobbys à fusionner
        else {
            for (i = 0; i < 6; i++) {
                for (j = 0; j < 6; j++) {
                    if (this.playersWaiting[i].length !== 0 && this.playersWaiting[j].length !== 0 ) {
                        let tmp = i + j + 4;
                        if (tmp === nbForLaunch) {
                            let random1 = Math.floor(Math.random() * (this.playersWaiting[i].length - 0 + 1) + 0);
                            let random2 = Math.floor(Math.random() * (this.playersWaiting[j].length - 0 + 1) + 0);
                            gamePlayers = this.playersWaiting[i][random1].users.concat(this.playersWaiting[j][random2].users);
                            return [gamePlayers, nbForLaunch];
                        }
                    }
                }
            }
        }
    }
}

module.exports = Matchmaking;
