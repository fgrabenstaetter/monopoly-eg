const Constants = require('../lib/constants');
const Cells = require('../lib/cells');
const Player = require('./player');

/**
 * Représente une partie de jeu (superviseur de jeu)
 */
class Game {

    gameIDCounter = 0;

    /**
     * @param users La liste des utilisateurs de la partie de jeu
     * @param paws La liste de leurs pions (même ordre) = liste d'entiers de 0 à 7
     * @param network L'instance Network du serveur
     * @param games La liste de toutes les parties (Game) globale
     */
    constructor (users, pawns, network, games) {
        this.network = network;
        this.games = games;
        this.players = [];
        this.id = this.gameIDCounter ++;
        this.turnPlayerInd = Math.floor(Math.random() * this.players.length);
        this.cells = Cells;

        for (let i = 0, l = users.length; i < l; i ++) {
            users[i].socket.join(this.name);
            this.players.push(new Player(users[i], pawns[i]));
            this.network.gamePlayerListen(players[i], this);
        }



        this.games.push(this);
    }

    delete () {
        for (const player of this.players) {
            this.network.gamePlayerStopListening(player);
            player.user.room = null;
            player.user.socket.leave(this.name);
        }

        const ind = this.games.indexOf(this);
        if (ind !== -1)
            this.games.splice(ind, 1);
    }

    /**
     * @param nickname Le pseudo du joueur recherché
     * @return le joueur si trouvé, sinon null
     */
    playerByNickname (nickname) {
        for (const player of this.players) {
            if (player.user.nickname === nickname)
                return player;
        }

        return null;
    }

    get name () {
        return 'game-' + this.id;
    }

    nextTurn () {
        switch (this.cells[this.players[this.turnPlayerInd].cellInd].type) {
            case Constants.CELL_TYPE.PARC:

                break;
            case Constants.CELL_TYPE.PRISON:

                break;
            case Constants.CELL_TYPE.PROPERTY:

                break;
            case Constants.CELL_TYPE.CHANCE_CARD:

                break;
            case Constants.CELL_TYPE.COMMUNITY_CARD:

        }

        this.turnPlayerInd = (this.turnPlayerInd >= this.players.length - 1) ? 0 : ++ this.turnPlayerInd;
    }
}

module.exports = Game;
