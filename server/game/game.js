const Constants = require('../lib/constants');
const Cells = require('../lib/cells');
const Deck = require('./deck');
const Player = require('./player');

const chanceCardsMeta = require('./../lib/chanceCards');
const communityChestCardsMeta = require('./../lib/communityChestCards');


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
        this.turnPlayerInd = Math.floor(Math.random() * this.players.length); // le premier sera l'indice cette valeur + 1 % nb joueurs
        this.turnTimeout = null;

        this.cells = Cells;
        this.cards = []; //tmp

        this.chanceDeck = new Deck(chanceCardsMeta);
        this.communityChestDeck = new Deck(communityChestCardsMeta);

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
     * Cette méthode n'est à appeler que lorsque le socket associé au joueur a émit l'event 'disconnect'
     * @param player Le joueur a supprimer
     */
    delPlayer (player) {
        const ind = this.players.indexOf(player);
         if (ind === -1)
            return;

        // this.players.gamePlayerStopListening(player, game); // pas besoin car suppression = socket disconnect
        this.players.splice(ind, 1);
        this.GLOBAL.network.io.to(this.name).emit('gameQuitRes', { playerNickname: player.user.nickname });
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

    /**
     * @return le joueur du tour actuel
     */
    get curPlayer () {
        return this.players[this.turnPlayerInd];
    }

    start () {
        this.startedTime = Date.now();
        setTimeout(this.nextTurn.bind(this), this.waitingTimeAfterReady);
    }

    /**
     * Met fin au tour actuel (= fin de tour) et commence directement le tour suivant (ne pas devoir attendre le timeout)
     */
    endTurn () {
        clearTimeout(this.turnTimeout);
        nextTurn();
    }

    /**
     * Démarre un nouveau tour de jeu avec le joueur suivant (pas d'action de jeu prise ici, mais dans rollDice)
     */
    nextTurn () {
        this.turnPlayerInd = (this.turnPlayerInd >= this.players.length - 1) ? 0 : ++ this.turnPlayerInd;
        console.log('NEXT TURN player = ' + this.curPlayer.user.nickname);
        this.turnTimeout = setTimeout(this.nextTurn.bind(this), this.turnMaxDuration);
        this.GLOBAL.network.io.to(this.name).emit('gameTurnRes', {
            nickname: this.curPlayer.user.nickname,
            turnEndTime: Date.now() + this.turnMaxDuration
        });
    }

    /**
     * Lance les dés et joue le tour du joueur actuel (this.curPlayer)
     * @return [int, int] le résultat des dés
     */
    rollDice () {
        const diceRes = [ Math.ceil(Math.random() * 6), Math.ceil(Math.random() * 6) ];

        //  ... actions du tour
        //  this.curPlayer

        return diceRes;
    }
}

module.exports = Game;
