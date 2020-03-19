const Chat      = require('./chat');
const Constants = require('../lib/constants');
const Deck      = require('./deck');
const Map = require('./map');
const Player    = require('./player');

const cellsMeta = require('./../lib/cells');
const chanceCardsMeta         = require('./../lib/chanceCards');
const communityChestCardsMeta = require('./../lib/communityChestCards');
const propertiesMeta = require('./../lib/properties');

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

        this.map = new Map(cellsMeta, propertiesMeta);

        this.chanceDeck = new Deck(chanceCardsMeta);
        this.communityChestDeck = new Deck(communityChestCardsMeta);

        this.bank = {
            money      : Constants.GAME_PARAM.BANK_INITIAL_MONEY,
            properties : []
        }

        /*
        // ajout des propriétés du plateau dans la banque
        for (const cell of this.cells) {
            if (cell.property)
                this.bank.properties.push(cell.property);
        }
        TODO: fix this
        */

        this.turnData = { // pour le client (envoi Network)
            actionMessage    : null,
            asyncRequestType : null, // voir lib/constants.js GAME_ASYNC_REQUEST_TYPE
            asyncRequestArgs : null, // liste
            nbDoubleDices    : 0 // ++ à chaque double et si >= 3 => prison
        };

        this.startedTime = null; // timestamp de démarrage en ms
        this.maxDuration = null; // durée max d'une partie en ms (null = illimité) (option à rajouter)

        for (let i = 0, l = users.length; i < l; i ++) {
            const player = new Player(users[i], pawns[i]);
            this.players.push(player);
            // nécéssaire uniquement pour tests unitaires (env normal: socket change et donc inutile
            if (this.GLOBAL.network)
                this.GLOBAL.network.gamePlayerListen(player, this);
        }
    }

    globalGameState () {

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
        this.GLOBAL.network.io.to(this.name).emit('gameQuitRes', { playerNickname: player.nickname });
    }

    /**
     * @param nickname Le pseudo du joueur recherché
     * @return le joueur si trouvé, sinon null
     */
    playerByNickname (nickname) {
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
        return this.cells[this.curPlayer.cellPos];
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
         // si le joueur précédent n'a pas répondu à une action asynchrone nécessaire, prendre les mesures nécéssaires
         if (this.turnData.asyncRequestType != null)
             this.asyncActionExpired();
         this.turnData.nbDoubleDices = 0;

         do
             this.turnPlayerInd = (this.turnPlayerInd >= this.players.length - 1) ? 0 : ++ this.turnPlayerInd;
         while (this.curPlayer.failure)

         // console.log('NEXT TURN player = ' + this.curPlayer.nickname);
         this.turnTimeout = setTimeout(this.nextTurn.bind(this), Constants.GAME_PARAM.TURN_MAX_DURATION);
         this.GLOBAL.network.io.to(this.name).emit('gameTurnRes', {
             playerID: this.curPlayer.id,
             turnEndTime: Date.now() + Constants.GAME_PARAM.TURN_MAX_DURATION
         });
     }


    /**
     * Lance les dés et joue le tour du joueur actuel (this.curPlayer)
     * @param useExitJailCard Pour savoir si le joueur souhaite utiliser une carte pour sortir de prison (dans le cas ou il en a une, utile pour le réseau)
     * @return [int, int] le résultat des dés
     */
    rollDice (useExitJailCard = false) {
        this.resetTurnData();
        const diceRes = [ Math.ceil(Math.random() * 6), Math.ceil(Math.random() * 6) ];

        if (this.curPlayer.isInPrison)
            this.turnPlayerAlreadyInPrison(diceRes);
        else if (diceRes[0] === diceRes[1]) {
            this.turnData.nbDoubleDices ++;
            if (this.turnData.nbDoubleDices === 3)
                this.curPlayer.goPrison();
        }


        // peux être sorti de prison !
        if (!this.curPlayer.isInPrison) {
            const oldPos  = this.curPlayer.cellPos;
            const total   = diceRes[0] + diceRes[1];
            this.curPlayer.cellPos = (this.curPlayer.cellPos + total) % this.cells.length;

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

                default: // PARC
                    // this.setTurnData(null, null, null); // pas besoin car déjà vide
            }

            if (oldPos > this.curPlayer.cellPos) {
                // Ancien indice > Nouvel indice alors on a passé la case départ, on reçoit alors de l'argent de la banque.
                this.curPlayer.addMoney(Constants.GAME_PARAM.GET_MONEY_FROM_START);
            }
        }

        return diceRes;
    }

    //////////////////////////////
    // ACTUEL TURN SYNC METHODS //
    //////////////////////////////

    // = Méthodes uniquement appelées par Game (ici) après le lancé de dés du joueur actuel

    turnPlayerAlreadyInPrison (diceRes, useExitJailCard = false) {
        if (this.curPlayer.remainingTurnsInJail > 0) {
            if (useExitJailCard) {
                this.curPlayer.jailJokerCards --;
                this.curPlayer.quitPrison();
            } else if (diceRes1 === diceRes2)
                this.curPlayer.quitPrison();
            else
                this.curPlayer.remainingTurnsInJail --;
        } else {
            // pour linstant sortir = gratuit
            const total = diceRes[0] + diceRes[1];
            this.curPlayer.cellPos += total;
            this.curPlayer.quitPrison();
        }
    }

    turnPlayerPropertyCell (diceRes1, diceRes2) {
        const total = diceRes1 + diceRes2;
        index = this.curPlayer.properties.indexOf(this.curCell.property);
        if (index !== -1) {
            // Le joueur est tombé sur une de ses propriétés
            this.setTurnData(Constants.GAME_ACTION_TYPE.CAN_UPGRADE, this.curCell.property.availableUpgradeLevels,
                'Le joueur ' + this.curPlayer.nickname + ' considère l\'amélioration de la propriété ' + this.curCell.property.name);

        } else {
            if (!this.curCell.property.owner && this.curPlayer.money >= this.curCell.property.emptyPrice) {
                // Le terrain n'est pas encore acheté et j'ai assez pour l'acheter !
                this.setTurnData(Constants.GAME_ACTION_TYPE.CAN_BUY, [this.curCell.property.emptyPrice],
                    'Le joueur ' + this.curPlayer.nickname + ' considère l\'achat de ' + this.curCell.property.name);

            } else if (this.curCell.property.owner) {
                // Le terrain appartient à un autre joueur
                if (this.curPlayer.money < this.curCell.property.rentalPrice) {
                    // Le joueur n'a pas assez pour payer
                    // regarder si ses propriétés valent assez pour combler ce montant
                    let sum = this.curPlayer.money;
                    for (const prop of this.curPlayer.properties)
                        sum += prop.mortagePrice;

                    if (sum < this.curCell.property.rentalPrice) {
                        // le joueur ne peux pas payer, même en vendant ses propriétés => faillite
                        this.playerFailure(this.curPlayer);
                        this.setTurnData(null, null,
                            'Le joueur ' + this.curPlayer.nickname + ' est en faillite (ne peux payer le loyer de ' + this.curCell.property.owner.nickname + ')');
                    } else {
                        // lui demander quelles propriétés il veux hypothéquer
                        // Si il ignore cette action asynchrone, une vente automatique sera effectuée (si pas assez => faillite)
                        this.setTurnData(Constants.GAME_ACTION_TYPE.SHOULD_MORTAGE, [this.curCell.property.rentalPrice - this.curPlayer.money],
                            'Le joueur ' + this.curPlayer.nickname + ' doit hypothéquer des propriétés pour pouvoir payer le loyer de ' + this.curCell.property.owner.nickname);
                    }
                }
                else {
                    // Le joueur peux payer le loyer sans devoir hypothéquer
                    this.curPlayer.loseMoney(this.curCell.property.rentalPrice);
                    this.setTurnData(null, null,
                        'Le joueur ' + this.curPlayer.nickname + ' a payé ' + this.curCell.property.rentalPrice + ' à ' + this.curCell.property.owner.nickname);
                }
            }
        }
    }

    turnPlayerChanceCardCell () {
        this.chanceDeck.drawCard(this, this.curPlayer);
        // TODO
    }

    turnPlayerCommunityCardCell () {
        this.communityChestDeck.drawCard(this, this.curPlayer);
        // TODO
    }

    turnPlayerPrisonCell () {
        this.curPlayer.goPrison();
        this.setTurnData(Constants.GAME_ACTION_TYPE.NOTHING, [],
            this.curPlayer.nickname + ' est envoyé en taule !');
    }

    ///////////////////////////////
    // ACTUAL TURN ASYNC METHODS //
    ///////////////////////////////

    // = Méthodes uniquement appelées par Network après requête du joueur du tour actuel

    /**
     * @return L'ID de la propriété achetée si succès, -1 sinon
     */
    asyncActionBuyProperty () {
        if (!this.curCell.property || this.curCell.property.owner)
            return -1;
        let price;
        if (this.curCell.property.type === Constants.PROPERTY_TYPE.STREET)
            price = this.curCell.property.emptyPrice;
        else
            price = this.curCell.property.price;
        if (this.curPlayer.money < price)
            return -1;

        if (this.curCell.property.owner)
            this.curCell.property.owner.delProperty(this.curCell.property);
        this.curPlayer.loseMoney(price);
        this.curPlayer.addProperty(this.curCell.property);

        this.resetTurnData();
        return this.curCell.property.id;
    }

    /**
     * @param level le niveau d'amélioration souhaité (1: une maison, 2: deux maisons, 3: trois maisons, 4: un hôtel)
     * @return L'ID de la propriété améliorée si succès, -1 sinon
     */
    asyncActionUpgradeProperty (level) {
        if (!this.curCell.property || this.curCell.property.owner || this.curCell.property.type !== Constants.PROPERTY_TYPE.STREET)
            return -1;

        const price = this.curCell.property.upgradePrice(level);
        if (this.curPlayer.money < price)
            return -1;

        this.curPlayer.loseMoney(price);
        this.curCell.property.upgrade(level);

        this.resetTurnData();
        return this.curCell.property.id;
    }

    /**
     * Attention: méthode apellée lorsque le joueur fait un choix manuel,
     * Il en faudra une autre pour une vente forcée automatique au timeout de fin du tour
     * @param propertiesList Liste d'ID de propriétés à hypothéquer
     * @return true si succès, false sinon
     */
    asyncActionManualForcedMortage (propertiesList) {
        const moneyToObtain = this.turnData.asyncRequestArgs[0];
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

        this.resetTurnData();
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
    setTurnData (asyncRequestType, asyncRequestArgs, actionMessage) {
        this.turnData.asyncRequestType = asyncRequestType;
        this.turnData.asyncRequestArgs = asyncRequestArgs;
        this.turnData.actionMessage          = actionMessage;
    }

    resetTurnData () {
        this.setTurnData(null, null, null);
    }

    /**
     * Gérer les actions nécéssaires si une action asynchrone de tour a été ignorer par un joueur a la fin de son tour
     */
    asyncActionExpired () {
        switch (this.turnData.asyncRequestType) {
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
        for (const prop of player.properties) {
            player.delProperty(prop);
            this.bank.properties.push(prop);
        }

        this.bank.money += player.money;
        player.loseMoney(player.money);
        player.failure = true;

        this.GLOBAL.network.io.to(this.name).emit('gamePlayerFailureRes', { playerID: player.id });
    }

    /**
     * @param player Le player a qui faire l'hypotécation forcée automatique, ou faillite
     */
    playerAutoMortage (player) {
        const moneyToObtain = this.turnData.asyncRequestArgs[0]; // argent déjà soustrait à cette valeur !
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
}

module.exports = Game;
