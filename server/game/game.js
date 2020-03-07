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
        setTimeout(this.nextTurn.bind(this), Constants.GAME_PARAM.WAITING_TIME_AFTER_READY);
    }

    /**
     * Met fin au tour actuel (= fin de tour) et commence directement le tour suivant (pour ne pas devoir attendre le timeout)
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
        this.turnTimeout = setTimeout(this.nextTurn.bind(this), Constants.GAME_PARAM.TURN_MAX_DURATION);
        this.GLOBAL.network.io.to(this.name).emit('gameTurnRes', {
            playerID: this.curPlayer.user.id,
            turnEndTime: Date.now() + Constants.GAME_PARAM.TURN_MAX_DURATION
        });
    }

    /**
     * Lance les dés et joue le tour du joueur actuel (this.curPlayer)
     * @return [int, int] le résultat des dés
     * @param useExitJailCard Pour savoir si le joueur souhaite utiliser une carte pour sortir de prison (dans le cas ou il en a une, utile pour le réseau)
     */
    rollDice (useExitJailCard = false) {
        const diceRes = [ Math.ceil(Math.random() * 6), Math.ceil(Math.random() * 6) ];
        const total = diceRes[0] + diceRes[1];
        const oldInd = this.curPlayer.cellInd;
        //  ... actions du tour
        //  this.curPlayer
        if (this.curPlayer.isInPrison) {
            if (this.curPlayer.remainingTurnsInJail < 3) {
                if (useExitJailCard) {
                    this.curPlayer.cellInd += total;
                    if (this.curPlayer)
                    this.curPlayer.jailJokerCards--;
                    this.curPlayer.escapePrison() = 0;
                }
                else if (diceRes[0] == diceRes[1]) {
                    this.curPlayer.cellInd += total;
                    this.curPlayer.escapePrison() = 0;
                }
            }
            else {
                lose = this.curPlayer.loseMoney(Constants.GAME_PARAM.EXIT_JAIL_PRICE)
                if (!lose) {
                    //Le joueur a perdu car il ne peut pas payer l'amende (à implémenter)
                }
                else {
                    this.curPlayer.cellInd += total;
                    this.curPlayer.escapePrison();
                }
            }
        }
        else {
            const curCell = this.curPlayer.cellInd + total;
            const cellType = Cells[curCell];
            switch (cellType) {
                case Constants.PARC:
                    break;

                case Constants.PRISON:
                    this.curPlayer.goPrison();
                    break;

                case Constants.PROPERTY:
                    break;

                case Constants.CHANCE:
                    break;

                case Constants.COMMUNITY:
                    break;

                case Constants.START:
                    break;
            }
        }
        if (oldInd > this.curPlayer.cellInd) {
            //Ancien indice > Nouvel indice alors on a passé la case départ, on reçoit alors de l'argent de la banque.
            this.curPlayer.addMoney(Constants.GET_MONEY_FROM_START);
        }
        return diceRes;
    }
}

module.exports = Game;
