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

/**
 * Représente une partie de jeu (superviseur de jeu)
 */
class Game {

    static gameIDCounter = 0;

    /**
     * @param users La liste des utilisateurs de la partie de jeu
     * @param paws La liste de leurs pions (même ordre) = liste d'entiers de 0 à 7
     * @param GLOBAL L'instance globale de données du serveur
     */
    constructor(users, pawns, GLOBAL) {
        this.GLOBAL             = GLOBAL;
        this.players            = [];
        this.id                 = Game.gameIDCounter++;
        this.forcedDiceRes      = null; // forcer un [int, int] pour le prochain rollDice = > POUR TESTS UNITAIRES UNIQUEMENT !!!
        this.cells              = Cells;
        this.chanceDeck         = new Deck(chanceCardsMeta);
        this.communityChestDeck = new Deck(communityChestCardsMeta);
        this.chat               = new Chat();
        this.bids               = [];
        this.bank               = new Bank(this.cells);

        for (let i = 0, l = users.length; i < l; i++) {
            const player = new Player(users[i], pawns[i]);
            this.players.push(player);
            // nécéssaire uniquement pour tests unitaires (env normal: socket change et donc inutile
            if (this.GLOBAL.network)
                this.GLOBAL.network.gamePlayerListen(player, this);
        }

        this.turnData = { // pour le client (envoi Network)
            // action data
            actionMessage    : null,
            asyncRequestType : null, // voir lib/constants.js GAME_ASYNC_REQUEST_TYPE
            asyncRequestArgs : null, // liste

            // dices system
            nbDoubleDices    : 0, // ++ à chaque double et si >= 3 => prison
            canRollDiceAgain : false, // true quand le joueur peux encore lancer les dés, false sinon

            // turn system
            startedTime      : null, // timestamp de début du tour
            endTime          : null, // timestamp de fin de tour
            timeout          : null,
            playerInd        : Math.floor(Math.random() * this.players.length) // le premier sera l'indice cette valeur + 1 % nb joueurs
        };

        this.startedTime = null; // timestamp de démarrage en ms
        this.maxDuration = null; // durée max d'une partie en ms (null = illimité) (option à rajouter)
    }

    delete() {
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
     * @return le timestamp de fin de partie forcé (en ms)
     */
    get forcedEndTime() {
        return this.startedTime + this.maxDuration;
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
    }

    /**
     * Met fin au tour actuel (= fin de tour) et commence directement le tour suivant (pour ne pas devoir attendre le timeout)
     */
    endTurn() {
        clearTimeout(this.turnData.timeout);
        this.nextTurn();
    }

    /**
     * Démarre un nouveau tour de jeu avec le joueur suivant (pas d'action de jeu prise ici, mais dans rollDice)
     */
    nextTurn() {
        // si le joueur n'a pas lancé les dés ou n'a pas relancé après un double, le faire automatiquement puis réappeller cette méthode
        if (this.turnData.canRollDiceAgain) {
            this.turnPlayerAFK();
            return;
        }
        // si le joueur précédent n'a pas répondu à une action asynchrone nécessaire, prendre les mesures nécéssaires
        if (this.turnData.asyncRequestType != null)
            this.asyncActionExpired();
        this.turnData.nbDoubleDices = 0;
        this.turnData.canRollDiceAgain = true;

        let cpt = 0;
        do {
            this.turnData.playerInd = (this.turnData.playerInd >= this.players.length - 1) ? 0 : ++this.turnData.playerInd;
            cpt ++;
            if (cpt > this.players.length) {
                // tous en faillite
                // TODO
                this.delete();
            }
        } while (this.curPlayer.failure)

        this.turnData.startedTime = Date.now();
        this.turnData.endTime = this.turnData.startedTime + Constants.GAME_PARAM.TURN_MAX_DURATION;
        this.GLOBAL.network.io.to(this.name).emit('gameTurnRes', {
            playerID: this.curPlayer.id,
            turnEndTime: this.turnData.endTime
        });

        if (!this.curPlayer.connected)
            this.turnPlayerAFK();
        else
            this.turnData.timeout = setTimeout(this.nextTurn.bind(this), Constants.GAME_PARAM.TURN_MAX_DURATION);
    }


    /**
     * Actions nécéssaires pour le tour d'un joueur qui est AFK/déconnecté
     */
    turnPlayerAFK () {
        const waitAfterEach = 4e3;
        if (this.turnData.canRollDiceAgain) { // relancer dés à chaque double aussi
            this.GLOBAL.network.gameTurnAction(this.curPlayer, this);
            setTimeout(this.turnPlayerAFK.bind(this), waitAfterEach);
        } else
            this.turnData.timeout = setTimeout(this.nextTurn.bind(this), waitAfterEach); // fin tour
    }

    /**
     * Lance les dés et joue le tour du joueur actuel (this.curPlayer)
     * @param useExitJailCard Pour savoir si le joueur souhaite utiliser une carte pour sortir de prison (dans le cas ou il en a une, utile pour le réseau)
     * @return [int, int] le résultat des dés ou false si problème quelconque
     */
    rollDice(useExitJailCard = false) {
        if (!this.turnData.canRollDiceAgain)
            return false;
        this.turnData.canRollDiceAgain = false;

        this.resetTurnActionData();
        const diceRes = this.forcedDiceRes ? this.forcedDiceRes : [Math.ceil(Math.random() * 6), Math.ceil(Math.random() * 6)];
        this.forcedDiceRes = null; // forcedDiceRes => ne pas toucher (uniquement pour TU)

        if (this.curPlayer.isInPrison)
            this.turnPlayerAlreadyInPrison(diceRes);
        else if (diceRes[0] === diceRes[1]) {
            this.turnData.nbDoubleDices ++;
            if (this.turnData.nbDoubleDices >= 3)
                this.curPlayer.goPrison();
            else
                this.turnData.canRollDiceAgain = true;

            // Reprogrammer le timeout en rajoutant le temps additionnel lors d'un double aux dés
            const timeLeft = this.turnData.endTime - Date.now();
            const newDuration = timeLeft + Constants.GAME_PARAM.TURN_DOUBLE_DICE_ADDED_TIME;
            clearTimeout(this.turnData.timeout);
            this.turnData.timeout = setTimeout(this.nextTurn.bind(this), newDuration); // fin de tour
        }

        // peux être sorti de prison !
        if (!this.curPlayer.isInPrison) {
            const oldPos = this.curPlayer.cellPos;
            const total = diceRes[0] + diceRes[1];
            this.curPlayer.moveRelative(total);

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

                default: // OTHER (parc, carte départ)
                // this.setTurnActionData(null, null, null); // pas besoin car déjà vide
            }

            if (oldPos > this.curPlayer.cellPos) // recevoir argent de la banque
                this.curPlayer.addMoney(Constants.GAME_PARAM.GET_MONEY_FROM_START);
        }

        return diceRes;
    }

    //////////////////////////////
    // ACTUEL TURN SYNC METHODS //
    //////////////////////////////

    // = Méthodes uniquement appelées par Game (ici) après le lancé de dés du joueur actuel

    /**
     * @param diceRes [int, int] le résultat des dés
     * @param useExitJailCard true si le joueur souhaite utiliser sa carte sortie de prison, false sinon
     */
    turnPlayerAlreadyInPrison(diceRes, useExitJailCard = false) {
        if (this.curPlayer.remainingTurnsInJail > 0) {
            if (useExitJailCard && this.curPlayer.nbJailEscapeCards > 0) {
                this.curPlayer.nbJailEscapeCards--;
                this.curPlayer.quitPrison();
            } else if (diceRes[0] === diceRes[1])
                this.curPlayer.quitPrison();
            else
                this.curPlayer.remainingTurnsInJail--;

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
                    // Le joueur n'a pas assez pour payer
                    // regarder si ses propriétés valent assez pour combler ce montant
                    let sum = this.curPlayer.money;
                    for (const prop of this.curPlayer.properties)
                        sum += prop.mortagePrice;

                    if (sum < rentalPrice) {
                        // le joueur ne peux pas payer, même en vendant ses propriétés => faillite
                        this.playerFailure(this.curPlayer);
                        this.setTurnActionData(null, null,
                            'Le joueur ' + this.curPlayer.nickname + ' est en faillite (ne peux payer le loyer de ' + property.owner.nickname + ')');
                    } else {
                        // lui demander quelles propriétés il veux hypothéquer
                        // Si il ignore cette action asynchrone, une vente automatique de ses propriétés sera effectuée
                        this.setTurnActionData(Constants.GAME_ASYNC_REQUEST_TYPE.SHOULD_MORTAGE, [rentalPrice],
                            'Le joueur ' + this.curPlayer.nickname + ' doit hypothéquer des propriétés pour pouvoir payer le loyer de ' + property.owner.nickname);
                    }

                } else {
                    // Le joueur peux payer le loyer sans devoir hypothéquer
                    this.curPlayer.loseMoney(property.rentalPrice);
                    this.setTurnActionData(null, null,
                        'Le joueur ' + this.curPlayer.nickname + ' a payé ' + property.rentalPrice + ' de loyer à ' + property.owner.nickname);
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
            this.curPlayer.nickname + ' est envoyé en taule !');
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
     * Attention: méthode apellée lorsque le joueur fait un choix manuel (pour hypothèque forcée, voir playerAutoMortage)
     * @param propertiesList Liste d'ID de propriétés à hypothéquer
     */
    asyncActionManualForcedMortage(propertiesList) {
        const rentalPrice = this.turnData.asyncRequestArgs[0];
        let sum = this.curPlayer.money;
        let properties = [];

        for (const id of propertiesList) {
            const prop = this.curPlayer.propertyByID(id);
            if (prop) {
                sum += prop.mortagePrice;
                properties.push(prop);
            }
        }

        if (sum < rentalPrice)
            return false; // enclancher la vente forcée automatique au timeout de tour (si pas de nouvelle requête qui réussie)

        // hypothéquer
        this.playerAutoMortage(this.curPlayer, properties);
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
     * @param player Le player a qui faire l'hypotécation forcée automatique, ou faillite
     * @param properties si null => vente automatique dans l'ordre croissant, sinon liste des propriétés obtenues via asyncActionManualForcedMortage UNIQUEMENT (la somme des hypothèques + argent joueur doit être suffisante dans ce cas !)
     */
    playerAutoMortage(player, properties = null) {
        const rentalPrice = this.turnData.asyncRequestArgs[0];
        let sum = player.money;

        if (!properties) { // vente automatique (dans l'ordre)
            properties = [];
            for (const prop of properties) {
                sum += prop.mortagePrice;
                properties.push(prop);
                if (sum >= rentalPrice)
                    break;
            }
        } else { // liste donnée en paramètre
            for (const prop of properties)
                sum += prop.mortagePrice;
        }

        if (sum < rentalPrice) // failure
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

            // payer le loyer
            const owner = this.cells[player.cellPos].property.owner;
            owner.addMoney(rentalPrice);
            player.loseMoney(rentalPrice);

            // envoyer message à tous les joueurs
            const mess = 'Le joueur ' + player.nickname + ' a payé ' + rentalPrice + ' de loyer à ' + owner.nickname;
            this.GLOBAL.network.io.to(this.name).emit('gamePropertyForcedMortageRes', {
                properties  : propertiesID,
                playerID    : player.id,
                playerMoney : player.money,
                message     : mess,
                rentalOwner : {
                    id      : owner.id,
                    money   : owner.money
                }
            });
        }
    }
}

module.exports = Game;
