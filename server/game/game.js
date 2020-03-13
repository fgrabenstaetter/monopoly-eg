const Constants = require('../lib/constants');
const Cells = require('../lib/cells');
const Deck = require('./deck');
const Player = require('./player');
const Chat = require('./chat');

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
        this.chat = new Chat();

        this.cells = Cells;
        this.cards = []; //tmp
        this.chanceDeck = new Deck(chanceCardsMeta);
        this.communityChestDeck = new Deck(communityChestCardsMeta);
        this.bankProperties = [];
        this.bankMoney = 4000;

        this.turnActionData = { // pour le client (envoi Network)
            message: null,
            type: null,
            args: []
        };

        this.startedTime = null; // timestamp de démarrage en ms
        this.maxDuration = null; // durée max d'une partie en ms (null = illimité) (option à rajouter)

        for (let i = 0, l = users.length; i < l; i ++) {
            this.players.push(new Player(users[i], pawns[i]));
        }

        this.GLOBAL.games.push(this);
    }

    delete () {
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

    /**
     * @param id L'IDdu joueur recherché
     * @return le joueur si trouvé, sinon null
     */
    playerByID (id) {
        for (const player of this.players) {
            if (player.id === id)
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

    /**
     * @return la cellule sur laquelle est le joueur actuel
     */
    get curCell () {
        return this.cells[this.curPlayer.cellInd];
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
     * Gérer les actions nécéssaires si une action asynchrone de tour a été ignorer par un joueur a la fin de son tour
     */
    dealWithTurnAsyncAction () {
        switch (this.turnActionData.type) {
            case Constants.GAME_ACTION_TYPE.SHOULD_MORTAGE: // l'hypothèque forcée a été ignorée, => vente automatique ou faillure
                this.playerAutoMortage(this.curPlayer);
            break;
        }
    }

    /**
     * @param player Le player a foutre a la rue
     */
    playerFailure (player) {
        // la banque récupère tout son fric et propriétés
        for (const prop of player.properties)
            prop.owner = null; // owner = banque
        this.bankProperties = this.bankProperties.concat(player.properties);
        this.bankMoney += player.money;

        player.properties = [];
        player.loseMoney(player.money);
        player.failure = true;

        this.GLOBAL.network.io.to(this.name).emit('gamePlayerFailure', { playerID: player.id });
    }

    /**
     * @param player Le player a qui faire l'hypotécation forcée automatique, ou faillite
     */
    playerAutoMortage (player) {
        const moneyToObtain = this.turnActionData.args[0]; // argent déjà soustrait à cette valeur !
        let sum = 0;
        let properties = []; // id list
        for (const prop of player.properties) {
            sum += prop.mortagePrice;
            properties.push(prop.id);
            if (sum >= moneyToObtain)
                break;
        }


        if (sum < moneyToObtain) // failure
            this.playerFailure(player);
        else {
            // succès
            player.money = sum - moneyToObtain;
            this.GLOBAL.network.io.to(this.name).emit('gameTurnPropertyForcedMortageRes', {
                properties  : properties,
                playerID    : player.id,
                playerMoney : player.money
            });
        }
    }

    /**
     * Démarre un nouveau tour de jeu avec le joueur suivant (pas d'action de jeu prise ici, mais dans rollDice)
     */
    nextTurn () {
        // si le joueur précédent n'a pas répondu à une action asynchrone nécessaire, prendre les mesures nécéssaires et reset la propriété
        if (this.turnActionData.type != null) {
            this.dealWithTurnAsyncAction();
            this.turnActionData.type = null;
            this.turnActionData.message = null;
            this.turnActionData.args = [];
        }

        do
            this.turnPlayerInd = (this.turnPlayerInd >= this.players.length - 1) ? 0 : ++ this.turnPlayerInd;
        while (this.curPlayer.failure)

        console.log('NEXT TURN player = ' + this.curPlayer.user.nickname);
        this.turnTimeout = setTimeout(this.nextTurn.bind(this), Constants.GAME_PARAM.TURN_MAX_DURATION);
        this.GLOBAL.network.io.to(this.name).emit('gameTurnRes', {
            playerID: this.curPlayer.id,
            turnEndTime: Date.now() + Constants.GAME_PARAM.TURN_MAX_DURATION
        });
    }

    //////////////////////////////
    // ACTUEL TURN SYNC METHODS //
    //////////////////////////////

    playerTurnIsInPrison (diceRes1, diceRes2) {
        const total = diceRes1 + diceRes2;
        if (this.curPlayer.remainingTurnsInJail < 3) {
            if (useExitJailCard) {
                this.curPlayer.cellInd += total;
                this.curPlayer.jailJokerCards--;
                this.curPlayer.escapePrison();
            }
            else if (diceRes1 == diceRes2) {
                this.curPlayer.cellInd += total;
                this.curPlayer.escapePrison();
            }
        }
        else {
            lose = this.curPlayer.loseMoney(Constants.GAME_PARAM.EXIT_JAIL_PRICE)
            if (!lose) {
                //Le joueur n'a pas assez pour payer, il faut traiter le cas (règles ?)
            }
            else {
                this.curPlayer.cellInd += total;
                this.curPlayer.escapePrison();
            }
        }
    }

    playerOnPropertyCell (diceRes1, diceRes2) {
        const total = diceRes1 + diceRes2;
        index = this.curPlayer.properties.indexOf(this.curCell.property);
        if (index !== -1) {
            // Le joueur est tombé sur une de ses propriétés
            this.turnActionData.type = Constants.GAME_ACTION_TYPE.CAN_UPGRADE;
            this.turnActionData.message = "Le joueur " + this.curPlayer.user.nickname + " considère l'amélioration de la propriété " + this.curCell.property.name;
            this.turnActionData.args.push(this.curCell.property.id);
        }
        else {
            let cellOwner = null;
            for (const player of this.players) {
                if (this.player.properties.indexOf(this.curCell.property) !== -1) {
                    cellOwner = player;
                    break;
                }
            }
            if (cellOwner == null) {
                // Le terrain n'est pas encore acheté => J'ai la possibilité de l'acheter. Le client doit savoir l'action à executer
                this.turnActionData.type = Constants.GAME_ACTION_TYPE.CAN_BUY;
                this.turnActionData.message = 'Le joueur ' + this.curPlayer.user.nickname + " considère l'achat de " + this.curCell.property.name;
            }
            else {
                // Le terrain appartient à un autre joueur
                if (this.curPlayer.money < this.curCell.property.rentalPrice) {
                    // Le joueur n'a pas assez pour payer
                    // regarder si ses propriétés valent assez pour combler ce montant
                    let sum = this.curPlayer.money;
                    for (const prop of this.curPlayer.properties)
                        sum += prop.mortagePrice;

                    if (sum < this.curCell.property.rentalPrice) {
                        // le joueur ne peux pas payer, même en vendant ses propriétés => faillite
                        this.turnActionData.type = Constants.GAME_ACTION_TYPE.NOTHING;
                        this.turnActionData.message = 'Le joueur ' + this.curPlayer.user.nickname + ' est en faillite (ne peux payer le loyer de ' + this.curCell.property.owner.user.nickname + ')';
                        this.playerFailure(this.curPlayer);
                    } else {
                        // lui demander quelles propriétés il veux hypothéquer
                        // Si il ignore cette action asynchrone, une vente automatique sera effectuée (si pas assez => faillite)
                        this.turnActionData.type = Constants.GAME_ACTION_TYPE.SHOULD_MORTAGE;
                        this.turnActionData.args[0] = this.curCell.property.rentalPrice - this.curPlayer.money; // argent manquant à obtenir en hypothéquant les propriétés
                        this.turnActionData.message = 'Le joueur ' + this.curPlayer.user.nickname + ' doit hypothéquer des propriétés pour pouvoir payer le loyer de ' + this.curCell.property.owner.user.nickname;
                    }
                }
                else {
                    // Le joueur peux payer le loyer sans devoir hypothéquer
                    this.curPlayer.loseMoney(this.curCell.property.rentalPrice);
                    this.turnActionData.type = Constants.GAME_ACTION_TYPE.PAID_RENT;
                    this.turnActionData.message = 'Le joueur ' + this.curPlayer.user.nickname + ' a payé ' + this.curCell.property.rentalPrice + ' à ' + this.curCell.property.owner.user.nickname;
                    this.turnActionData.args.push(this.curCell.property.owner.id);
                }
            }
        }
    }

    /**
     * Lance les dés et joue le tour du joueur actuel (this.curPlayer)
     * @return [int, int] le résultat des dés
     * @param useExitJailCard Pour savoir si le joueur souhaite utiliser une carte pour sortir de prison (dans le cas ou il en a une, utile pour le réseau)
     */
    rollDice (useExitJailCard = false) {
        for (let i = 0; i < turnActionData.args.length; i++) {
            //Supprimer tous les arguments envoyer au client avant d'en rajouter de nouveaux avant l'utilisation de ce tableau
            this.turnActionData.args.splice(i, 1);
        }
        const diceRes = [ Math.ceil(Math.random() * 6), Math.ceil(Math.random() * 6) ];
        const total = diceRes[0] + diceRes[1];
        const oldPos = this.curPlayer.cellInd;
        //  ... actions du tour
        //  this.curPlayer
        if (this.curPlayer.isInPrison) {
            this.playerTurnIsInPrison(diceRes[0], diceRes[1]);
        }
        else {
            this.curPlayer.cellInd += total;
            switch (this.curCell.type) {
                case Constants.CELL_TYPE.PARC:
                    break;

                case Constants.CELL_TYPE.PRISON:
                    this.curPlayer.goPrison();
                    break;

                case Constants.CELL_TYPE.PROPERTY:
                    this.playerOnPropertyCell(diceRes[0], diceRes[1]);
                    break;

                case Constants.CELL_TYPE.CHANCE:
                    this.chanceDeck.drawCard(this, this.curPlayer);
                    break;

                case Constants.CELL_TYPE.COMMUNITY:
                    this.communityChestDeck.drawCard(this, this.curPlayer);
                    break;

                case Constants.CELL_TYPE.START:
                    //Ne fait rien => Gain de money ajouté à la fin de la fonction
                    break;
            }
        }
        if (oldPos > this.curPlayer.cellInd) {
            //Ancien indice > Nouvel indice alors on a passé la case départ, on reçoit alors de l'argent de la banque.
            this.curPlayer.addMoney(Constants.GAME_PARAM.GET_MONEY_FROM_START);
        }
        return diceRes;
    }

    ///////////////////////////////
    // ACTUAL TURN ASYNC METHODS //
    ///////////////////////////////

    /**
     * @return L'ID de la propriété achetée si succès, -1 sinon
     */
    curPlayerBuyProperty () {
        if (!this.curCell.property || this.curCell.property.owner)
            return -1;
        let price;
        if (this.curCell.property.type === Constants.PROPERTY_TYPE.STREET)
            price = this.curCell.property.emptyPrice;
        else
            price = this.curCell.property.price;
        if (this.curPlayer.money < price)
            return -1;

        this.curPlayer.loseMoney(price);
        this.curPlayer.addProperty(this.curCell.property);

        // reset pour que le serveur sache que l'action a bien été effectuée
        this.turnActionData.type = null;
        this.turnActionData.message = null;
        this.turnActionData.args = [];

        return this.curCell.property.id;
    }

    /**
     * @param level le niveau d'amélioration souhaité (1: une maison, 2: deux maisons, 3: trois maisons, 4: un hôtel)
     * @return L'ID de la propriété améliorée si succès, -1 sinon
     */
    curPlayerUpgradeProperty (level) {
        if (!this.curCell.property || this.curCell.property.owner || this.curCell.property.type !== Constants.PROPERTY_TYPE.STREET)
            return -1;

        const price = this.curCell.property.upgradePrice(level);
        if (this.curPlayer.money < price)
            return -1;

        this.curPlayer.loseMoney(price);
        this.curCell.property.upgrade(level);

        // reset pour que le serveur sache que l'action a bien été effectuée
        this.turnActionData.type = null;
        this.turnActionData.message = null;
        this.turnActionData.args = [];

        return this.curCell.property.id;
    }

    /**
     * Attention: méthode apellée lorsque le joueur fait un choix manuel,
     * Il en faudra une autre pour une vente forcée automatique au timeout de fin du tour
     * @param propertiesList Liste d'ID de propriétés à hypothéquer
     * @return true si succès, false sinon
     */
    curPlayerManualForcedMortage (propertiesList) {
        const moneyToObtain = this.turnActionData.args[0];
        let sum = 0;
        for (const id of propertiesList) {
            const prop = this.curPlayer.propertyByID(id);
            if (prop)
                sum += prop.mortagePrice;
        }

        if (sum < moneyToObtain)
            return false; // enclancher la vente forcée automatique si possible

        // hypothéquer
        for (prop of propertiesList)
            this.curPlayer.delProperty(prop);

        // reset pour que le serveur sache que l'action a bien été effectuée
        this.turnActionData.type = null;
        this.turnActionData.message = null;
        this.turnActionData.args = [];

        return true;
    }
}

module.exports = Game;
