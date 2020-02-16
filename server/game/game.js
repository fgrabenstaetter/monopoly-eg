const Player = require('./player');

/**
 * Représente une partie de jeu (superviseur de jeu)
 */
class Game {

    gameIDCounter = 0;

    /**
     * @param users La liste des utilisateurs de la partie de jeu
     * @param paws La liste de leurs pions (même ordre)
     * @param network L'instance Network du serveur
     * @param games La liste de toutes les parties (Game) globale
     */
    constructor (users, pawns, network, games) {
        this.network = network;
        this.games = games;
        this.players = [];
        this.id = this.gameIDCounter ++;

        for (let i = 0, l = users.length; i < l; i ++) {
            users[i].room = this.id;
            this.players.push(new Player(users[i], pawns[i]));
            this.network.gamePlayerListen(players[i], this);
        }

        this.games.push(this);
    }

    delete () {
        for (const player of this.players) {
            this.network.gamePlayerStopListening(player);
            player.user.room = null;
        }

        const ind = this.games.indexOf(this);
        if (ind !== -1)
            this.games.splice(ind, 1);
    }
}

module.exports = Game;
