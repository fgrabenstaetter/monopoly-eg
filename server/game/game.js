const Constants = require('../lib/constants');
const Cells = require('../lib/cells');
const Player = require('./player');
const Cards = []; // en attente d'implémentation des cartes

/**
 * Représente une partie de jeu (superviseur de jeu)
 */
class Game {

    gameIDCounter = 0;

    /**
     * @param users La liste des utilisateurs de la partie de jeu
     * @param paws La liste de leurs pions (même ordre) = liste d'entiers de 0 à 7
     * @param GLOBAL L'instance globale de données du serveur
     */
    constructor (users, pawns, GLOBAL) {
        this.GLOBAL = GLOBAL;
        this.players = [];
        this.id = this.gameIDCounter ++;
        this.turnPlayerInd = Math.floor(Math.random() * this.players.length);

        this.cells = Cells;
        this.cards = Cards;
        this.bank = {}; // a faire

        this.startedTime = null; // timestamp de démarrage en ms
        this.maxDuration = null; // durée max d'une partie en ms (null = illimité) (option à rajouter)
        this.turnMaxDuration = 2e4; // durée max d'un tour de jeu en ms
        this.waitingTimeAfterReady = 3e3; // attente avant démarrage de partie en ms, après que tous les joueurs soient prêt

        for (let i = 0, l = users.length; i < l; i ++) {
            this.players.push(new Player(users[i], pawns[i]));
        }

        this.GLOBAL.games.push(this);
    }

    delete () {
        for (const player of this.players)
            this.GLOBAL.network.gamePlayerStopListening(player);

        const ind = this.GLOBAL.games.indexOf(this);
        if (ind !== -1)
            this.GLOBAL.games.splice(ind, 1);
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

    /**
     * Le jeu ne démarre que lorsque tous les joueurs sont prêts
     * @return true si tous les joueurs sont prêts, false sinon
     */
    get allPlayersReady () {
        for (const player of this.players) {
            if (!player.isReady)
                return false;
        }

        return true;
    }

    /**
     * @return le timestamp de fin de partie forcé (en ms)
     */
    get forcedEndTime () {
        return this.startedTime + this.maxDuration;
    }

    start () {
        this.startedTime = Date.now();
        setTimeout(this.nextTurn.bind(this), this.waitingTimeAfterReady);
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
        console.log('NEXT TURN player = ' + this.players[this.turnPlayerInd].user.nickname);
    }
}

module.exports = Game;
