const Chat                    = require('./chat');
const Constants               = require('./../lib/constants');
const Deck                    = require('./deck');
const Player                  = require('./player');
const Bank                    = require('./bank');
const Cells                   = require('./../lib/cells');
const Properties              = require('./../lib/properties');
const chanceCardsMeta         = require('./../lib/chanceCards');
const communityChestCardsMeta = require('./../lib/communityChestCards');
const Errors                  = require('./../lib/errors');
const Bid                     = require('./bid');
const SuccessManager          = require('./successManager');
const activeGameSchema        = require('./../models/activeGame');
const Lobby                   = require('./lobby');


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
    constructor (id, users, duration, GLOBAL) {
        this.id                       = id;
        this.GLOBAL                   = GLOBAL;
        this.players                  = [];
        this.forcedDiceRes            = null; // forcer un [int, int] pour le prochain rollDice = > POUR TESTS UNITAIRES UNIQUEMENT !!!
        this.cells                    = Cells.new;
        this.chanceDeck               = new Deck(chanceCardsMeta);
        this.communityChestDeck       = new Deck(communityChestCardsMeta);
        this.chat                     = new Chat();
        this.bank                     = new Bank(this.cells);
        this.networkLastGameActionRes = null; // SEULEMENT POUR NETWORK PAS TOUCHE LA MOUCHE
        this.offers                   = [];
        this.bids                     = [];
        this.alreadyOneManualBid      = false; // max 1 bid mannuelle à la fois
        this.maxDuration              = duration; // 30 | 60 | null (durée max d'une partie en minutes ou null si illimité)
        this.ended                    = false;

        this.shouldPersist = (Constants.ENVIRONMENT != Constants.ENVIRONMENTS.TEST);
        this.startedTime = null; // timestamp de démarrage en ms
        // si maxDuration défini => la partie prend fin au début d'un nouveau tour lorsque le timeout est atteint uniquement

        const pawns = [0, 1, 2, 3, 4, 5, 6, 7];
        for (let i = 0, l = users.length; i < l; i++) {
            const randInd = Math.floor(Math.random() * pawns.length);
            const pawn = pawns[randInd];
            pawns.splice(randInd, 1);

            const player = new Player(users[i], pawn);
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
            playerInd            : Math.floor(Math.random() * this.players.length), // le premier sera l'indice cette valeur + 1 % nb joueurs
            persistInterval      : null  // id de interval pour fairie clearInterval apres
        };
        this.successManager = new SuccessManager(this);

        if (this.shouldPersist) {
            let gameState = activeGameSchema(this.currentGameState());
            gameState.save();
        }

        this.checkEndInterval = setInterval( () => {
            if (this.checkEnd()) {
                clearInterval(this.checkEndInterval);
                this.ended = true;
            }
        }, 2e3);
    }

    deleteGameState () {
        let id = this.id;
        if (this.shouldPersist)
            activeGameSchema.deleteOne({ '_id': this.id }, function (err) {
                console.log('Game state removed for game #', id);
            });
    }

    delete() {
        // mettre tous les joueurs dans un même nouveau lobby :)
        let users = [];
        for (const player of this.players) {
            users.push(player.user);
            this.GLOBAL.network.gamePlayerStopListening(player, this);
        }

        users.sort( (a, b) => {
            return a.failure && b.failure ? 0 : a.failure ? 1 : -1;
        });

        clearTimeout(this.turnData.timeout);
        clearTimeout(this.turnData.midTimeout);
        clearTimeout(this.turnData.timeoutActionTimeout);

        this.players = [];
        const ind = this.GLOBAL.games.indexOf(this);
        if (ind !== -1)
            this.GLOBAL.games.splice(ind, 1);

        this.deleteGameState();
        const newLobby = new Lobby(users[0], this.GLOBAL); // le vainqueur = hôte :)
        this.GLOBAL.lobbies.push(newLobby);
        for (let i = 1; i < users.length; i ++)
            newLobby.addUser(users[i]);
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
     * Cette fonction doit etre utilisee pour obtenir l'etat courant du jeu sous forme de dictionaire
     */
    currentGameState () {
        let players = [];
        let cells = [];
        let properties = [];

        for (let player of this.players)
            players.push(player.toJSON());

        for (let cell of this.cells) {
            cells.push(cell.toJSON());
            if (cell.property)
                properties.push(cell.property.toJSON());
        }

        return {
            _id: this.id,
            endTime: this.endTime,
            players: players,
            bank: this.bank.toJSON(),
            properties: properties
        }
    }

    persistGameState () {
        let gameId = this.id;
        let gameState = activeGameSchema(this.currentGameState());
        activeGameSchema.findOneAndUpdate({_id: this.id}, gameState, {upsert: true}, function(err, doc) {
            /*
            if (err)
                console.log('Error at saving gamestate for game #', gameId);
            else
                console.log('Succesfully saved gamestate for game #', gameId);
            */
        });
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

        if (this.shouldPersist)
            this.turnData.persistInterval = setInterval(this.persistGameState.bind(this), Constants.GAME_PARAM.PERSIST_GAMESTATE_INTERVAL);
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
                for (const prop of pl.properties)
                    sum += prop.value;
                if (sum > winnerValue)
                    winnerPlayer = pl;
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
        // si le joueur précédent n'a pas répondu à une action asynchrone nécessaire, prendre les mesures nécéssaires
        if (this.turnData.asyncRequestType != null)
            this.asyncActionExpired();

        if (this.ended)
            return;

        // si le joueur n'a pas lancé les dés ou n'a pas relancé après un double, le faire automatiquement puis réappeller cette méthode
        if (this.turnData.canRollDiceAgain) {
            this.turnPlayerTimeoutAction(false);
            return;
        }

        this.turnData.nbDoubleDices = 0;
        this.turnData.canRollDiceAgain = true;

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
     * @param expired true si le tour a expiré, false sinon (cette méthode n'est pas apellé uniquement lors du timeout de tour, mais aussi lorsqu'on veut relancer les dés)
     */
    turnPlayerTimeoutAction (expired = true) {
        clearTimeout(this.turnData.timeout);
        clearTimeout(this.turnData.midTimeout);
        clearTimeout(this.turnData.timeoutActionTimeout);

        if (this.turnData.canRollDiceAgain && this.active) { // relancer dés à chaque double aussi
            this.GLOBAL.network.gameTurnAction(this.curPlayer, this);
            if (expired) // si expiré uniquement !
                this.turnData.timeoutActionTimeout = setTimeout(this.turnPlayerTimeoutAction.bind(this), Constants.GAME_PARAM.TURN_AUTO_ROLL_DICE_MIN_INTERVAL);
        } else
            this.turnData.timeout = setTimeout(this.nextTurn.bind(this), Constants.GAME_PARAM.TURN_AUTO_ROLL_DICE_MIN_INTERVAL); // fin tour
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
                    this.turnData.midTimeout = setTimeout(this.turnMidTimeCheck.bind(this), newDuration / 2); // moitié de tour
                    this.turnData.endTime = Date.now() + newDuration;
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
            case Constants.CELL_TYPE.GOPRISON:
                this.turnPlayerGoPrisonCell();
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
                break;
                if (this.curPlayer.cellPos === 30) {
                    this.curPlayer.moveAbsolute(10);
                    //Perdre l'argent gagné au passage de la case départ
                    this.curPlayer.loseMoney(Constants.GAME_PARAM.GET_MONEY_FROM_START);
                }
        }

        if (!this.curPlayer.isInPrison && oldPos > player.cellPos) // recevoir argent de la banque
            player.addMoney(Constants.GAME_PARAM.GET_MONEY_FROM_START);

        this.successManager.check();
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
                if (this.curPlayer.remainingTurnsInJail > 0)
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

        for (const bid of this.bids) {
            if (bid.property === property)
                return;
        }

        if (property.isMortgaged)
            return; // rien à faire

        if (property.owner === this.curPlayer && property.type === Constants.PROPERTY_TYPE.STREET) {
            // Le joueur est tombé sur une de ses propriétés
            this.setTurnActionData(null, null,
                'Le joueur ' + this.curPlayer.nickname + ' considère l\'amélioration de ses propriétés');
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
                    property.owner.addMoney(rentalPrice);
                    this.setTurnActionData(null, null,
                        'Le joueur ' + this.curPlayer.nickname + ' a payé ' + rentalPrice + '€ de loyer à ' + property.owner.nickname);
                }
            } else if (!property.owner && this.curPlayer.money < buyingPrice)
                new Bid(property, 0, this);
        }
    }

    turnPlayerChanceCardCell() {
        this.chanceDeck.drawCard(this, this.curPlayer);
    }

    turnPlayerCommunityCardCell() {
        this.communityChestDeck.drawCard(this, this.curPlayer);
    }

    turnPlayerGoPrisonCell() {
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
        else if (property.owner)
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
     * @param list Liste de { propertyID: int, level: int } avec level le niveau d'amélioration souhaité (1: une maison, 2: deux maisons, 3: trois maisons, 4: quatre maisons, 5: un hôtel)
     * @return 0 si succès, 1 si requête invalide, 2 si une propriété non-valide pour amélioration (pas le propriétaire ou hypothéquée, ou pas une STREET), 3 si pas assez d'argent, 4 si le joueur n'a pas le monopole pour une propriété
     */
    asyncActionUpgradeProperty(list) {
        let sum = 0;
        for (const row of list) {
            if (row.propertyID == null || row.level == null || row.level < 0 || row.level > 5)
                return 1;
            let prop = this.curPlayer.propertyByID(row.propertyID);

            if (!prop || prop.type !== Constants.PROPERTY_TYPE.STREET || prop.isMortgaged)
                return 2;
            else if (!this.curPlayer.colorMonopoly(prop.color))
                return 4;

            sum += prop.upgradePrice(row.level);
        }


        if (sum > 0) {
            if (sum > this.curPlayer.money)
                return 3;
            this.curPlayer.loseMoney(sum);
            this.bank.addMoney(sum);
        } else {
            this.curPlayer.addMoney(sum * -1);
            this.bank.loseMoney(sum * -1);
        }

        // améliorer les propriétés
        for (const row of list)
            this.curPlayer.propertyByID(row.propertyID).upgrade(row.level);

        return 0;
    }

    /**
     * Attention: méthode apellée lorsque le joueur fait un choix manuel (pour hypothèque forcée (cause: loyer ou taxe ou carte) ou NON, voir playerAutoMortgage)
     * @param propertiesList Liste d'ID de propriétés à hypothéquer
     */
    asyncActionManualMortgage(propertiesList) {
        const moneyToObtain = this.turnData.asyncRequestArgs ? this.turnData.asyncRequestArgs[0] : null; // null si pas hypothèque forcée (= manuel)
        let sum = this.curPlayer.money;
        let properties = [];

        for (const id of propertiesList) {
            const prop = this.curPlayer.propertyByID(id);
            if (prop && !prop.isMortgaged) {
                sum += prop.mortgagePrice;
                properties.push(prop);
            }
        }

        if (moneyToObtain && sum < moneyToObtain) // seulement si hypothèque forcée (cause: loyer ou taxe)
            return false; // enclancher la vente forcée automatique au timeout de tour (si pas de nouvelle requête qui réussie)

        this.playerAutoMortgage(this.curPlayer, properties);
        if (this.turnData.asyncRequestType === Constants.GAME_ASYNC_REQUEST_TYPE.SHOULD_MORTGAGE)
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
            case Constants.GAME_ASYNC_REQUEST_TYPE.SHOULD_MORTGAGE: // l'hypothèque forcée a été ignorée, => vente automatique ou faillure
                this.playerAutoMortgage(this.curPlayer);
                break;
            case Constants.GAME_ASYNC_REQUEST_TYPE.CAN_BUY:
                const curProp = this.curCell.property;
                new Bid(curProp, 0, this);
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

        if (player === this.curPlayer) {
            clearTimeout(this.turnData.timeout);
            clearTimeout(this.turnData.midTimeout);
            clearTimeout(this.turnData.timeoutActionTimeout);
            this.turnData.timeout = setTimeout(this.nextTurn.bind(this), Constants.TURN_AUTO_ROLL_DICE_MIN_INTERVAL);
        }

        this.GLOBAL.network.io.to(this.name).emit('gamePlayerFailureRes', { playerID: player.id, bankMoney: this.bank.money });
    }

    /**
     * Attention: peut être appelée pour une hypothèque volontaire ou forcée !
     * @param player Le player a qui faire l'hypotécation forcée automatique, ou faillite
     * @param properties si null et hypothèque forcée => vente automatique dans l'ordre croissant, sinon liste des propriétés obtenues via asyncActionManualMortgage UNIQUEMENT (la somme des hypothèques + argent joueur doit être suffisante dans ce cas !)
     */
    playerAutoMortgage(player, properties = null) {
        // hypothèque forcée = moneyToObtain ci-dessous != null SINON PAS FORCÉE
        const isForced = player === this.curPlayer && this.turnData.asyncRequestType === Constants.GAME_ASYNC_REQUEST_TYPE.SHOULD_MORTGAGE;
        const moneyToObtain = isForced ? this.turnData.asyncRequestArgs[0] : null; // null si hypothèque non forcée (= manuel)
        let sum = player.money;

        if (!moneyToObtain && !properties)
            return false;

        if (!properties) { // vente automatique forcée (dans l'ordre)
            properties = [];
            for (const prop of properties) {
                if (prop.isMortgaged)
                    continue;
                sum += prop.mortgagePrice;
                properties.push(prop);
                if (sum >= moneyToObtain)
                    break;
            }
        } else { // liste donnée en paramètre: hyp forcée manuel ou non forcée
            for (const prop of properties) {
                if (!prop.isMortgaged)
                    sum += prop.mortgagePrice;
            }
        }

        if (moneyToObtain && sum < moneyToObtain) // failure
            this.playerFailure(player);
        else {
            let propertiesID = [];
            for (const prop of properties) {
                propertiesID.push(prop.id);
                prop.mortgage(this);
            }

            let rentalOwner, mess;
            if (moneyToObtain) { // hypothèque forcée
                // payer le loyer ou la taxe
                player.loseMoney(moneyToObtain);
                if (this.curCell.type === Constants.CELL_TYPE.PROPERTY) {
                    // LOYER
                    const owner = this.curCell.property.owner;
                    owner.addMoney(moneyToObtain);
                    rentalOwner = { id: owner.id, money: owner.money };
                    mess = 'Le joueur ' + player.nickname + ' a hypothéqué un montant de ' + sum + '€ pour réussir à payer ' + moneyToObtain + '€ de loyer à ' + owner.nickname;
                } else if (this.curCell.type === Constants.CELL_TYPE.TAX) {
                    // TAXE | IMPOT
                    this.bank.addMoney(moneyToObtain);
                    mess = 'Le joueur ' + player.nickname + ' a hypothéqué un montant de ' + sum + '€ pour réussir à payer ' + moneyToObtain + '€ de taxes';
                } else if (this.curCell.type === Constants.CELL_TYPE.CHANCE || this.curCell.type === Constants.CELL_TYPE.COMMUNITY) {
                    // CARTE CHANCE | COMMUNAUTEE
                    this.bank.addMoney(moneyToObtain);
                    mess = 'Le joueur ' + player.nickname + ' a hypothéqué un montant de ' + sum + '€ pour réussir à payer la carte chance/communautée';
                }
            } else { // non forcée
                rentalOwner = null;
                mess = 'Le joueur ' + player.nickname + ' a hypothéqué un montant de ' + sum + '€';
            }

            this.GLOBAL.network.io.to(this.name).emit('gamePropertyMortgagedRes', {
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
     * @param msgIfShouldMortgage Le message a mettre dans turnData.actionMessage si le joueur doit hypothéquer (pas de faillite)
     */
    playerNotEnoughMoney (player, moneyToObtain, msgIfFailure, msgIfShouldMortgage) {
        // regarder si ses propriétés valent assez pour combler ce montant
        let sum = player.money;
        for (const prop of player.properties) {
            if (!prop.isMortgaged)
                sum += prop.mortgagePrice;
        }

        if (sum < moneyToObtain) {
            // le joueur ne peux pas payer, même en vendant ses propriétés => faillite
            this.playerFailure(player);
            this.setTurnActionData(null, null, msgIfFailure);
        } else {
            // lui demander quelles propriétés il veux hypothéquer
            // Si il ignore cette action asynchrone, une vente automatique de ses propriétés sera effectuée
            this.setTurnActionData(Constants.GAME_ASYNC_REQUEST_TYPE.SHOULD_MORTGAGE, [moneyToObtain], msgIfShouldMortgage);
        }
    }
}

module.exports = Game;
