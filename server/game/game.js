const Chat                    = require('./chat');
const Constants               = require('./../lib/constants');
const Bid                     = require('./bid');
const Deck                    = require('./deck');
const Player                  = require('./player');
const Bank                    = require('./bank');
const Cells                   = require('./../lib/cells');
const Properties              = require('./../lib/properties');
const chanceCardsMeta         = require('./../lib/chanceCards');
const communityChestCardsMeta = require('./../lib/communityChestCards');
const Errors                  = require('./../lib/errors');
const SuccessManager          = require('./successManager');

/**
 * Représente une partie de jeu (superviseur de jeu)
 */
class Game {

    static gameIDCounter = 0;

    /**
     * @param users La liste des utilisateurs de la partie de jeu
     * @param paws La liste de leurs pions (même ordre) = liste d'entiers de 0 à 7
     * @param duration La durée souhaitée de temps de jeu en ms ou null si illimité
     * @param GLOBAL L'instance globale de données du serveur
     */
    constructor (users, pawns, duration, GLOBAL) {
        this.GLOBAL             = GLOBAL;
        this.players            = [];
        this.id                 = Game.gameIDCounter++;
        this.forcedDiceRes      = null; // forcer un [int, int] pour le prochain rollDice = > POUR TESTS UNITAIRES UNIQUEMENT !!!
        this.cells              = Cells.new;
        this.chanceDeck         = new Deck(chanceCardsMeta);
        this.communityChestDeck = new Deck(communityChestCardsMeta);
        this.chat               = new Chat();
        this.bids               = [];
        this.bank               = new Bank(this.cells);
        this.successManager     = new SuccessManager(this);

        this.startedTime = null; // timestamp de démarrage en ms
        this.maxDuration = duration; // 30 | 60 | null (durée max d'une partie en minutes ou null si illimité)
        // si maxDuration défini => la partie prend fin au début d'un nouveau tour lorsque le timeout est atteint uniquement

        for (let i = 0, l = users.length; i < l; i++) {
            const player = new Player(users[i], pawns[i]);
            this.players.push(player);
            // nécéssaire uniquement pour tests unitaires (env normal: socket change et donc inutile
            if (this.GLOBAL.network)
                this.GLOBAL.network.gamePlayerListen(player, this);
        }

        this.turnData = { // pour le client (envoi Network)
            // action data
            actionMessage        : null,
            asyncRequestType     : null, // voir lib/constants.js GAME_ASYNC_REQUEST_TYPE
            asyncRequestArgs     : null, // liste

            // dices system
            nbDoubleDices        : 0, // ++ à chaque double et si >= 3 => prison
            canRollDiceAgain     : false, // true quand le joueur peux encore lancer les dés, false sinon

            // turn system
            startedTime          : null, // timestamp de début du tour
            endTime              : null, // timestamp de fin de tour
            timeout              : null,
            midTimeout           : null, // timestamp de moitié de tour => lancer les dés auto
            timeoutActionTimeout : null,
            playerInd            : Math.floor(Math.random() * this.players.length) // le premier sera l'indice cette valeur + 1 % nb joueurs
        };
    }

    delete() {
        clearTimeout(this.turnData.timeout);
        clearTimeout(this.turnData.midTimeout);
        clearTimeout(this.turnData.timeoutActionTimeout);
        this.players = [];
        const ind = this.GLOBAL.games.indexOf(this);
        if (ind !== -1)
            this.GLOBAL.games.splice(ind, 1);
    }

    bidByID (bidID) {
        for (const bid of this.bids) {
            if (bidID === bid.id)
                return bid;
        }
        return null;
    }

    get active () {
        return this.players.length > 0;
    }

    /**
     * Cette méthode n'est à appeler que lorsque le socket associé au joueur a émit l'event 'disconnect'
     * @param player Le joueur a supprimer
     */
    delPlayer(player) {
        const ind = this.players.indexOf(player);
        if (ind === -1)
            return;

        this.players.splice(ind, 1);
        // this.GLOBAL.network.io.to(this.name).emit('gameQuitRes', { playerNickname: player.nickname });
    }

    /**
     * @param nickname Le pseudo du joueur recherché
     * @return le joueur si trouvé, sinon null
     */
    playerByNickname(nickname) {
        for (const player of this.players) {
            if (player.nickname === nickname)
                return player;
        }

        return null;
    }

    /**
     * @param id L'IDdu joueur recherché
     * @return le joueur si trouvé, sinon null
     */
    playerByID(id) {
        for (const player of this.players) {
            if (player.id === id)
                return player;
        }

        return null;
    }


    get name() {
        return 'game-' + this.id;
    }

    /**
     * Le jeu ne démarre que lorsque tous les joueurs sont prêts
     * @return true si tous les joueurs sont prêts, false sinon
     */
    get allPlayersReady() {
        for (const player of this.players) {
            if (!player.isReady)
                return false;
        }

        return true;
    }

    /**
     * @return le timestamp de fin de partie forcé (en ms) ou null si illimité
     */
    get forcedEndTime() {
        return this.maxDuration ? this.startedTime + this.maxDuration * 60 * 1e3 : null;
    }

    /**
     * @return le joueur du tour actuel
     */
    get curPlayer() {
        return this.players[this.turnData.playerInd];
    }

    /**
     * @return la cellule sur laquelle est le joueur actuel
     */
    get curCell() {
        return this.cells[this.curPlayer.cellPos];
    }


    /**
     * @param immediate false pour attendre le timeout de lancement, true sinon (utile pour tests unitaires)
     */
    start(immediate = false) {
        if (!this.allPlayersReady)
            return false;
        this.startedTime = Date.now();
        if (immediate)
            this.nextTurn();
        else
            setTimeout(this.nextTurn.bind(this), Constants.GAME_PARAM.WAITING_TIME_AFTER_READY);

        this.endTime = this.duration ? this.startedTime + this.duration * 60 * 1e3 : null;
    }

    /**
     * Met fin au tour actuel (= fin de tour) et commence directement le tour suivant (pour ne pas devoir attendre le timeout)
     */
    endTurn() {
        clearTimeout(this.turnData.timeout);
        clearTimeout(this.turnData.midTimeout);
        this.nextTurn();
    }

    /**
     * Vérifie si la partie est terminée ou non ( = un seul joueur n'est pas en faillite OU le timeout de partie a été atteint)
     * @return true si la partie est finie, false sinon
     */
    checkEnd () {
        const gameTimeout = this.forcedEndTime && this.forcedEndTime >= Date.now();
        if (gameTimeout) {
            // le vainqueur est celui qui a le plus d'argent / biens de valeur (= valeur des propriétés)
            let winnerPlayer, winnerValue = 0;
            for (const pl of this.players) {
                let sum = pl.money;
                for  (const prop of pl.properties)
                    sum += prop.value;
                if (sum > winnerValue) {
                    winnerValue = sum;
                    winnerPlayer = pl;
                }
            }

            this.GLOBAL.network.io.to(this.name).emit('gameEndRes', {
                type: 'timeout',
                winnerID: winnerPlayer.id,
                duration: Date.now() - this.startedTime
            });
            this.delete();
            return true;

        } else {
            let nb = 0, solo;
            for (const pl of this.players) {
                if (pl.failure)
                    nb ++;
                else
                    solo = pl;
            }

            if (nb === this.players.length - 1) { // fin de partie
                const winner = solo;
                this.GLOBAL.network.io.to(this.name).emit('gameEndRes', {
                    type: 'normal',
                    winnerID: winner.id,
                    duration: Date.now() - this.startedTime
                });
                this.delete();
                return true;
            }
        }

        return false;
    }

    /**
     * Démarre un nouveau tour de jeu avec le joueur suivant (pas d'action de jeu prise ici, mais dans rollDice)
     */

    turnMidTimeCheck () {
        if (this.turnData.canRollDiceAgain)
            this.GLOBAL.network.gameTurnAction(this.curPlayer, this);
    }

    nextTurn() {
        // si le joueur n'a pas lancé les dés ou n'a pas relancé après un double, le faire automatiquement puis réappeller cette méthode
        if (this.turnData.canRollDiceAgain) {
            this.turnPlayerTimeoutAction();
            return;
        }
        this.successManager.check(this);
        // si le joueur précédent n'a pas répondu à une action asynchrone nécessaire, prendre les mesures nécéssaires
        if (this.turnData.asyncRequestType != null)
            this.asyncActionExpired();
        this.turnData.nbDoubleDices = 0;
        this.turnData.canRollDiceAgain = true;
        if (this.checkEnd())
            return;

        do
            this.turnData.playerInd = (this.turnData.playerInd >= this.players.length - 1) ? 0 : ++this.turnData.playerInd;
        while (this.curPlayer.failure)

        this.turnData.startedTime = Date.now();
        this.turnData.endTime = this.turnData.startedTime + (this.curPlayer.connected ? Constants.GAME_PARAM.TURN_MAX_DURATION : Constants.GAME_PARAM.TURN_DISCONNECTED_MAX_DURATION);
        this.GLOBAL.network.io.to(this.name).emit('gameTurnRes', {
            playerID: this.curPlayer.id,
            turnEndTime: this.turnData.endTime
        });

        if (!this.curPlayer.connected)
            this.turnPlayerTimeoutAction();
        else {
            clearTimeout(this.turnData.timeout);
            clearTimeout(this.turnData.midTimeout);
            this.turnData.timeout = setTimeout(this.nextTurn.bind(this), Constants.GAME_PARAM.TURN_MAX_DURATION);
            this.turnData.midTimeout = setTimeout(this.turnMidTimeCheck.bind(this), Constants.GAME_PARAM.TURN_MAX_DURATION / 2);
        }
    }

    /**
     * Actions nécéssaires pour le tour d'un joueur qui est AFK/déconnecté
     */
    turnPlayerTimeoutAction () {
        clearTimeout(this.turnData.timeout);
        clearTimeout(this.turnData.midTimeout);
        clearTimeout(this.turnData.timeoutActionTimeout);

        if (this.turnData.canRollDiceAgain && this.active) { // relancer dés à chaque double aussi
            this.GLOBAL.network.gameTurnAction(this.curPlayer, this);
            this.turnData.timeoutActionTimeout = setTimeout(this.turnPlayerTimeoutAction.bind(this), Constants.GAME_PARAM.TURN_ROLL_DICE_INTERVAL_AFTER_TIMEOUT);
        } else
            this.turnData.timeout = setTimeout(this.nextTurn.bind(this), Constants.GAME_PARAM.TURN_ROLL_DICE_INTERVAL_AFTER_TIMEOUT); // fin tour
    }

    /**
     * Lance les dés et joue le tour du joueur actuel (this.curPlayer)
     * @param useExitJailCard Pour savoir si le joueur souhaite utiliser une carte pour sortir de prison (dans le cas ou il en a une, utile pour le réseau)
     * @return [int, int] le résultat des dés ou false si problème quelconque
     */
    rollDice (useExitJailCard = false) {
        if (!this.turnData.canRollDiceAgain)
            return false;
        this.turnData.canRollDiceAgain = false;

        this.resetTurnActionData();
        const diceRes = this.forcedDiceRes ? this.forcedDiceRes : [Math.ceil(Math.random() * 6), Math.ceil(Math.random() * 6)];
        this.forcedDiceRes = null; // forcedDiceRes => ne pas toucher (uniquement pour TU)

        if (this.curPlayer.isInPrison)
            this.turnPlayerAlreadyInPrison(diceRes, useExitJailCard);
        else if (diceRes[0] === diceRes[1]) {
            this.turnData.nbDoubleDices ++;
            if (this.turnData.nbDoubleDices >= 3)
                this.curPlayer.goPrison();
            else {
                this.turnData.canRollDiceAgain = true;

                if (this.turnData.endTime >= Date.now() && this.curPlayer.connected) {
                    // Reprogrammer le timeout en rajoutant le temps additionnel lors d'un double aux dés
                    const timeLeft = this.turnData.endTime - Date.now();
                    const newDuration = timeLeft + Constants.GAME_PARAM.TURN_DOUBLE_DICE_ADDED_TIME;

                    clearTimeout(this.turnData.timeout);
                    clearTimeout(this.turnData.midTimeout);
                    this.turnData.timeout = setTimeout(this.nextTurn.bind(this), newDuration); // fin de tour
                    this.turnData.midTimeout = setTimeout(this.turnMidTimeCheck.bind(this), newDuration / 2); // fin de tour
                }
            }
        }

        // peux être sorti de prison !
        if (!this.curPlayer.isInPrison) {
            const oldPos = this.curPlayer.cellPos;
            const total = diceRes[0] + diceRes[1];
            this.curPlayer.moveRelative(total);
            this.makeTurnAfterMove(diceRes, this.curPlayer, oldPos);
        }

        return diceRes;
    }

    makeTurnAfterMove(diceRes, player, oldPos) {
        switch (this.curCell.type) {
            case Constants.CELL_TYPE.PRISON:
                this.turnPlayerPrisonCell();
                break;

            case Constants.CELL_TYPE.PROPERTY:
                this.turnPlayerPropertyCell(diceRes);
                break;

            case Constants.CELL_TYPE.CHANCE:
                this.turnPlayerChanceCardCell();
                break;

            case Constants.CELL_TYPE.COMMUNITY:
                this.turnPlayerCommunityCardCell();
                break;

            case Constants.CELL_TYPE.TAX:
                this.turnPlayerTaxCell();
                break;

            case Constants.CELL_TYPE.OTHER:
                if (this.curPlayer.cellPos === 30) {
                    this.curPlayer.moveAbsolute(10);
                    //Perdre l'argent gagné au passage de la case départ
                    this.curPlayer.loseMoney(Constants.GAME_PARAM.GET_MONEY_FROM_START);
                }
        }

        if (oldPos > player.cellPos) // recevoir argent de la banque
            player.addMoney(Constants.GAME_PARAM.GET_MONEY_FROM_START);
    }

    //////////////////////////////
    // ACTUEL TURN SYNC METHODS //
    //////////////////////////////

    // = Méthodes uniquement appelées par Game (ici) après le lancé de dés du joueur actuel

    /**
     * @param diceRes [int, int] le résultat des dés
     * @param useExitJailCard true si le joueur souhaite utiliser sa carte sortie de prison (et qu'il est en prison), false sinon
     */
    turnPlayerAlreadyInPrison(diceRes, useExitJailCard = false) {
        if (this.curPlayer.remainingTurnsInJail > 0) {
            if (useExitJailCard && this.curPlayer.nbJailEscapeCards > 0) {
                this.curPlayer.nbJailEscapeCards--;
                this.curPlayer.quitPrison();
            } else if (diceRes[0] === diceRes[1])
                this.curPlayer.quitPrison();
            else {
                this.curPlayer.remainingTurnsInJail--;
                this.setTurnActionData(null, null, 'Le joueur ' + this.curPlayer.nickname + ' est toujours en prison (tour ' + (4 - this.curPlayer.remainingTurnsInJail) + '/3) !');
            }

        } else {
            // pour linstant sortir = gratuit
            this.curPlayer.quitPrison();
        }
    }

    /**
     * @param diceRes [int, int] le résultat des dés
     */
    turnPlayerPropertyCell(diceRes) {
        const total = diceRes[0] + diceRes[1];
        const property = this.curCell.property;

        if (property.owner === this.curPlayer) {
            // Le joueur est tombé sur une de ses propriétés
            if (property.type === Constants.PROPERTY_TYPE.STREET) {
                const avUpgradeLevels = property.availableUpgradeLevels;
                if (avUpgradeLevels !== [null, null, null, null, null])
                    this.setTurnActionData(Constants.GAME_ASYNC_REQUEST_TYPE.CAN_UPGRADE, avUpgradeLevels,
                        'Le joueur ' + this.curPlayer.nickname + ' considère l\'amélioration de sa propriété ' + property.name);
                // else => ne peux pax améliorer => rien à faire
            }
            // else => rien à faire

        } else {
            const buyingPrice = property.type === Constants.PROPERTY_TYPE.STREET ? property.prices.empty : property.price;

            if (!property.owner && this.curPlayer.money >= buyingPrice) {
                // La propriété n'est pas encore achetée et j'ai assez d'argent pour l'acheter !
                this.setTurnActionData(Constants.GAME_ASYNC_REQUEST_TYPE.CAN_BUY, [buyingPrice],
                    'Le joueur ' + this.curPlayer.nickname + ' considère l\'achat de ' + property.name);

            } else if (property.owner) {
                // Le terrain appartient à un autre joueur
                const rentalPrice = property.type === Constants.PROPERTY_TYPE.PUBLIC_COMPANY ? property.rentalPrice(diceRes) : property.rentalPrice;

                if (this.curPlayer.money < rentalPrice) {
                    this.playerNotEnoughMoney(this.curPlayer, rentalPrice,
                        'Le joueur ' + this.curPlayer.nickname + ' est en faillite (ne peux payer le loyer de ' + property.owner.nickname + ')',
                        'Le joueur ' + this.curPlayer.nickname + ' doit hypothéquer des propriétés pour pouvoir payer le loyer de ' + property.owner.nickname);
                } else {
                    // Le joueur peux payer le loyer sans devoir hypothéquer
                    this.curPlayer.loseMoney(rentalPrice);
                    this.setTurnActionData(null, null,
                        'Le joueur ' + this.curPlayer.nickname + ' a payé ' + rentalPrice + '€ de loyer à ' + property.owner.nickname);
                }
            } // else => rien à faire
        }
    }

    turnPlayerChanceCardCell() {
        this.chanceDeck.drawCard(this, this.curPlayer);
    }

    turnPlayerCommunityCardCell() {
        this.communityChestDeck.drawCard(this, this.curPlayer);
    }

    turnPlayerPrisonCell() {
        this.curPlayer.goPrison();
        this.setTurnActionData(null, null,
            this.curPlayer.nickname + ' est envoyé en prison ! (tour 1/3)');
    }

    turnPlayerTaxCell () {
        const moneyToPay = this.curCell.tax.money;
        if (this.curPlayer.money < moneyToPay) {
            this.playerNotEnoughMoney(this.curPlayer, moneyToPay,
                'Le joueur ' + this.curPlayer.nickname + ' est en faillite (ne peux pas payer la taxe de ' + moneyToPay + '€)',
                'Le joueur ' + this.curPlayer.nickname + ' doit hypothéquer des propriétés pour pouvoir payer la taxe de ' + moneyToPay + '€');
        } else {
            // il a assez d'argent
            this.curPlayer.loseMoney(moneyToPay);
            this.bank.addMoney(moneyToPay);
            this.setTurnActionData(null, null,
                'Le joueur ' + this.curPlayer.nickname + ' a payé ' + moneyToPay + '€ de taxes');
        }
    }

    ///////////////////////////////
    // ACTUAL TURN ASYNC METHODS //
    ///////////////////////////////

    // = Méthodes uniquement appelées par Network après requête du joueur du tour actuel

    /**
     * @return true si succès, false sinon
     */
    asyncActionBuyProperty() {
        const property = this.curCell.property;
        if (!property)
            return Errors.BUY_PROPERTY.NOT_EXISTS;

        if (property.owner)
            return Errors.BUY_PROPERTY.ALREADY_SOLD;

        const price = property.type === Constants.PROPERTY_TYPE.STREET ? property.prices.empty : property.price;
        if (this.curPlayer.money < price)
            return Errors.BUY_PROPERTY.NOT_ENOUGH_MONEY;

        this.curPlayer.loseMoney(price);
        this.bank.addMoney(price);
        this.bank.delProperty(property);
        this.curPlayer.addProperty(property);

        this.resetTurnActionData();

        return Errors.SUCCESS;
    }

    /**
     * @param level le niveau d'amélioration souhaité (1: une maison, 2: deux maisons, 3: trois maisons, 4: un hôtel)
     * @return true si succès, false sinon
     */
    asyncActionUpgradeProperty(level) {
        const property = this.curCell.property;
        if (!property || !property.owner || property.type !== Constants.PROPERTY_TYPE.STREET)
            return false;

        const price = property.upgradePrice(level);
        if (this.curPlayer.money < price)
            return false;

        this.curPlayer.loseMoney(price);
        this.curCell.property.upgrade(level);

        this.resetTurnActionData();
        return true;
    }

    /**
     * Attention: méthode apellée lorsque le joueur fait un choix manuel (pour hypothèque forcée (cause: loyer ou taxe) ou NON, voir playerAutoMortage)
     * @param propertiesList Liste d'ID de propriétés à hypothéquer
     */
    asyncActionManualMortage(propertiesList) {
        const moneyToObtain = this.turnData.asyncRequestArgs[0]; // null si pas hypothèque forcée
        let sum = this.curPlayer.money;
        let properties = [];

        for (const id of propertiesList) {
            const prop = this.curPlayer.propertyByID(id);
            if (prop) {
                sum += prop.mortagePrice;
                properties.push(prop);
            }
        }

        if (moneyToObtain && sum < moneyToObtain) // seulement si hypothèque forcée (cause: loyer ou taxe)
            return false; // enclancher la vente forcée automatique au timeout de tour (si pas de nouvelle requête qui réussie)


        this.playerAutoMortage(this.curPlayer, properties);
        if (this.turnData.asyncRequestType === Constants.GAME_ASYNC_REQUEST_TYPE.SHOULD_MORTAGE)
            this.resetTurnActionData();
        return true;
    }

    ///////////////////////
    // DIVERSES MÉTHODES //
    ///////////////////////

    /**
     * @param actionMessage Le message à afficher côté client (ou null)
     * @param asyncRequestType Le type de requête asynchrone que le client pourra faire ensuite (ou null)
     * @param asyncRequestArgs Liste d'arguments pour la requête asynchrone possible à envoyer au joueur (ou null)
     */
    setTurnActionData(asyncRequestType, asyncRequestArgs, actionMessage) {
        this.turnData.asyncRequestType = asyncRequestType;
        this.turnData.asyncRequestArgs = asyncRequestArgs;
        this.turnData.actionMessage = actionMessage;
    }

    resetTurnActionData() {
        this.setTurnActionData(null, null, null);
    }

    /**
     * Gérer les actions nécéssaires si une action asynchrone de tour a été ignorer par un joueur a la fin de son tour
     */
    asyncActionExpired() {
        switch (this.turnData.asyncRequestType) {
            case Constants.GAME_ASYNC_REQUEST_TYPE.SHOULD_MORTAGE: // l'hypothèque forcée a été ignorée, => vente automatique ou faillure
                this.playerAutoMortage(this.curPlayer);
                break;
            case Constants.GAME_ASYNC_REQUEST_TYPE.CAN_BUY:
                const curProp = this.curCell.property;
                let price;
                switch (curProp.type) {
                    case Constants.PROPERTY_TYPE.STREET:
                        price = curProp.prices.empty;
                        break;

                    default:
                        price = curProp.price;
                        break;
                }
                const bid = new Bid(curProp, price, this);
                this.bids.push(bid);
                const msg = 'Une enchère a demarré pour' + curProp.name;
                this.GLOBAL.network.io.to(this.name).emit('gameBidRes', {
                    bidID    : bid.id,
                    playerID : null,
                    text     : msg,
                    price    : bid.amountAsked
                });
                break;
        }
    }

    /**
     * @param player Le player a foutre a la rue
     */
    playerFailure(player) {
        // la banque récupère tout son fric et propriétés
        for (const prop of player.properties) {
            player.delProperty(prop);
            this.bank.addProperty(prop);
        }

        this.bank.addMoney(player.money);
        player.loseMoney(player.money);
        player.failure = true;

        this.GLOBAL.network.io.to(this.name).emit('gamePlayerFailureRes', { playerID: player.id, bankMoney: this.bank.money });
    }

    /**
     * Attention: peut être appelée pour une hypothèque volontaire ou forcée !
     * @param player Le player a qui faire l'hypotécation forcée automatique, ou faillite
     * @param properties si null et hypothèque forcée => vente automatique dans l'ordre croissant, sinon liste des propriétés obtenues via asyncActionManualMortage UNIQUEMENT (la somme des hypothèques + argent joueur doit être suffisante dans ce cas !)
     */
    playerAutoMortage(player, properties = null) {
        // hypothèque forcée = moneyToObtain ci-dessous != null SINON PAS FORCÉE
        const moneyToObtain = this.turnData.asyncRequestArgs[0];
        let sum = player.money;

        if (!moneyToObtain && !properties)
            return false;

        if (!properties) { // vente automatique forcée (dans l'ordre)
            properties = [];
            for (const prop of properties) {
                sum += prop.mortagePrice;
                properties.push(prop);
                if (sum >= moneyToObtain)
                    break;
            }
        } else { // liste donnée en paramètre: hyp forcée manuel ou non forcée
            for (const prop of properties)
                sum += prop.mortagePrice;
        }

        if (moneyToObtain && sum < moneyToObtain) // failure
            this.playerFailure(player);
        else {
            // succès
            player.addMoney(sum - player.money);

            // toutes les propriétés hypothéquées => à la banque
            let propertiesID = [];
            for (const prop of properties) {
                player.delProperty(prop);
                this.bank.addProperty(prop);
                propertiesID.push(prop.id);
            }


            let rentalOwner, mess;
            if (moneyToObtain) { // hypothèque forcée
                // payer le loyer ou la taxe
                player.loseMoney(moneyToObtain);
                if (this.curCell.type === Constants.CELL_TYPE.PROPERTY) {
                    // payer loyer
                    const owner = this.cells[player.cellPos].property.owner;
                    owner.addMoney(moneyToObtain);
                    rentalOwner = { id: owner.id, money: owner.money };
                    mess = 'Le joueur ' + player.nickname + ' a hypothéqué un montant de ' + sum + '€ pour réussir à payer ' + moneyToObtain + '€ de loyer à ' + owner.nickname;
                } else if (this.curCell.type === Constants.CELL_TYPE.TAX) {
                    // payer taxe
                    this.bank.addMoney(moneyToObtain);
                    mess = 'Le joueur ' + player.nickname + ' a hypothéqué un montant de ' + sum + '€ pour réussir à payer ' + moneyToObtain + '€ de taxes';
                }
            } else { // non forcée
                rentalOwner = null;
                mess = 'Le joueur ' + player.nickname + ' a hypothéqué un montant de ' + sum + '€';
            }

            this.GLOBAL.network.io.to(this.name).emit('gamePropertyMortageRes', {
                properties  : propertiesID,
                playerID    : player.id,
                playerMoney : player.money,
                bankMoney   : this.bank.money,
                message     : mess,
                rentalOwner : rentalOwner
            });
        }
    }

    /**
     * Cette méthode est appelée lorsqu'un joueur n'a pas assez d'argent pour payer quelque chose. Il va devoir hypothéquer, ou directement en faillite si même en hypothéquant il ne peux pas avoir assez d'argent.
     * @param player Le joueur qui n'a pas assez d'argent pour payer quelque chose
     * @param moneyToObtain L'argent qu'il doit réussir à avoir en hypothéquant, sinon faillite (vérifications ICI)
     * @param msgIfFailure Le message a mettre dans turnData.actionMessage si le joueur est en faillite
     * @param msgIfShouldMortage Le message a mettre dans turnData.actionMessage si le joueur doit hypothéquer (pas de faillite)
     */
    playerNotEnoughMoney (player, moneyToObtain, msgIfFailure, msgIfShouldMortage) {
        // regarder si ses propriétés valent assez pour combler ce montant
        let sum = player.money;
        for (const prop of player.properties)
            sum += prop.mortagePrice;

        if (sum < moneyToObtain) {
            // le joueur ne peux pas payer, même en vendant ses propriétés => faillite
            this.playerFailure(player);
            this.setTurnActionData(null, null, msgIfFailure);
        } else {
            // lui demander quelles propriétés il veux hypothéquer
            // Si il ignore cette action asynchrone, une vente automatique de ses propriétés sera effectuée
            this.setTurnActionData(Constants.GAME_ASYNC_REQUEST_TYPE.SHOULD_MORTAGE, [moneyToObtain], msgIfShouldMortage);
        }
    }
}

module.exports = Game;
