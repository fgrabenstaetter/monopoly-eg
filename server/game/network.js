const Constants                   = require('../lib/constants');
const Errors                      = require('../lib/errors');
const { UserSchema, UserManager } = require('../models/user');
const Offer                       = require('./offer');

/**
 * Simplifie et centralise toutes les communications socket
 */
class Network {

    /**
     * @param io L'instance globale socket.io du serveur
     * @param GLOBAL L'instance globale de données du serveur
     */
    constructor(io, GLOBAL) {
        this.io = io;
        this.GLOBAL = GLOBAL;
    }

    /////////////////////
    // GENERAL METHODS //
    /////////////////////

    lobbyUserListen(user, lobby) {
        user.socket.join(lobby.name);

        // Inviter / Rejoindre / Quitter
        this.lobbyInvitationReq             (user, lobby);
        this.lobbyInvitationAcceptReq       (user, lobby);
        this.lobbyKickReq                   (user, lobby);

        // Paramètres + Chat
        this.lobbyChangeTargetUsersNbReq    (user, lobby);
        this.lobbyChangePawnReq             (user, lobby);
        this.lobbyChatSendReq               (user, lobby);
        this.lobbyPlayReq                   (user, lobby);

        // Amis
        this.lobbyFriendListReq             (user, lobby);
        this.lobbyRequestedFriendListReq    (user, lobby);
        this.lobbyPendingFriendListReq      (user, lobby);
        this.lobbyFriendInvitationSendReq   (user, lobby);
        this.lobbyFriendInvitationActionReq (user, lobby);
        // this.lobbyFriendDeleteReq(user, lobby);

        user.socket.on('lobbyReadyReq', () => {
            // réponse de création / rejoignage de lobby
            this.lobbyNewUser(user, lobby);
        });
    }

    gamePlayerListen(player, game) {
        player.socket.join(game.name);

        // Début/Fin + tour
        this.gameReadyReq                 (player, game);
        this.gameRollDiceReq              (player, game);
        this.gameTurnEndReq               (player, game);

        // Actions de tour asynchrones
        this.gamePropertyBuyReq           (player, game);
        this.gamePropertyUpgradeReq       (player, game);
        this.gamePropertyForcedMortageReq (player, game);

        // Chat + offres
        this.gameChatSendReq              (player, game);
        this.gameOfferSendReq             (player, game);
        this.gameOfferAcceptReq           (player, game);

        // Divers
        this.gameOverbidReq               (player, game);
        this.gameMortageReq               (player, game);
    }

    //////////////////
    // LOBBY EVENTS //
    //////////////////

    lobbyNewUser(user, lobby) {

        if (lobby.users[0] === user) { // est l'hôte
            user.socket.emit('lobbyCreatedRes', {
                targetUsersNb: lobby.targetUsersNb,
                pawn: lobby.userPawn(user)
            });

            // message de bienvenue
            this.lobbySendMessage(lobby, null, 'Bienvenue dans ce lobby créé par ' + user.nickname + ' !');
            return;
        }

        // non hôte
        let messages = [];
        for (const mess of lobby.chat.messages) {
            messages.push({
                senderUserID : mess.sender ? mess.sender.id : -1, // -1 => Server
                content      : mess.text,
                createdTime  : mess.createdTime
            });
        }

        let users = [];
        for (const usr of lobby.users) {
            users.push({
                nickname : usr.nickname,
                id       : usr.id,
                pawn     : lobby.userPawn(usr)
            });
        }

        user.socket.emit('lobbyJoinedRes', {
            targetUsersNb : lobby.targetUsersNb,
            users         : users,
            messages      : messages
        });

        // envoyer à tous les users du loby, sauf le nouveau
        user.socket.broadcast.to(lobby.name).emit('lobbyUserJoinedRes', {
            nickname : user.nickname,
            id       : user.id,
            pawn     : lobby.pawns[lobby.users.indexOf(user)]
        });
    }

    lobbyInvitationReq(user, lobby) {
        user.socket.on('lobbyInvitationReq', (data) => {
            user.getFriends((friends) => {
                let err = Errors.SUCCESS;
                let friendUser = null;

                if (!data.friendID)
                    err = Errors.MISSING_FIELD;
                else if (friends.indexOf(data.friendID) === -1)
                    err = Errors.FRIENDS.NOT_EXISTS;
                else if (lobby.users.length >= lobby.targetUsersNb)
                    err = Errors.LOBBY.FULL;
                else if (lobby.userByID(data.friendID))
                    err = Errors.FRIENDS.ALREADY_SAME_LOBBY;
                else {
                    for (const user of this.GLOBAL.users) {
                        if (user.id === data.friendID) {
                            friendUser = user;
                            break;
                        }
                    }

                    if (!friendUser) {
                        err = Errors.FRIENDS.NOT_CONNECTED;
                    } else {
                        for (const game of this.GLOBAL.games) {
                            const tmp = game.playerByID(data.friendID);
                            if (tmp) {
                                err = Errors.FRIENDS.IN_GAME;
                                break;
                            }
                        }
                    }

                    if (err.code === Errors.SUCCESS.code) {
                        const invitId = lobby.addInvitation(user.id, data.friendID);
                        friendUser.socket.emit('lobbyInvitationReceivedRes', {
                            invitationID         : invitId,
                            senderFriendID       : user.id,
                            senderFriendNickname : user.nickname,
                            nbUsersInLobby       : lobby.users.length
                        });
                    }
                }

                user.socket.emit('lobbyInvitationRes', { error: err.code, status: err.status });
            });
        });
    }

    lobbyFriendInvitationSendReq(user, lobby) {
        user.socket.on('lobbyFriendInvitationSendReq', (data) => {

            if (user.nickname === data.nickname) {
                user.socket.emit('lobbyFriendInvitationSendRes', { error: Errors.FRIENDS.CANT_INVITE_YOURSELF.code, status: Errors.FRIENDS.CANT_INVITE_YOURSELF.status });
                return;
            }

            UserSchema.findOne({ nickname: data.nickname }, (error, invitedUser) => {
                if (error || !invitedUser) {
                    user.socket.emit('lobbyFriendInvitationSendRes', { error: Errors.FRIENDS.NOT_EXISTS.code, status: Errors.FRIENDS.NOT_EXISTS.status });
                    return;
                }

                UserSchema.getFriends(user.id, (error, friends) => {
                    if (error) {
                        user.socket.emit('lobbyFriendInvitationSendRes', { error: Errors.FRIENDS.REQUEST_ERROR.code, status: Errors.FRIENDS.REQUEST_ERROR.status });
                        return;
                    }

                    // On vérifie si l'invitation n'a pas déjà été envoyée (ou si users pas déjà amis)
                    let friendFound = false;
                    if (friends && friends.length > 0) {
                        for (let i = 0; i < friends.length; i++) {
                            if (friends[i].friend._id.equals(invitedUser._id)) {
                                friendFound = friends[i].status;
                                break;
                            }
                        }
                    }

                    if (friendFound) {
                        if (friendFound == 'accepted') {
                            user.socket.emit('lobbyFriendInvitationSendRes', { error: Errors.FRIENDS.ALREADY_FRIENDS.code, status: Errors.FRIENDS.ALREADY_FRIENDS.status });
                        } else if (friendFound == 'requested') {
                            user.socket.emit('lobbyFriendInvitationSendRes', { error: Errors.FRIENDS.ALREADY_INVITED.code, status: Errors.FRIENDS.ALREADY_INVITED.status });
                        } else if (friendFound == 'pending') {
                            user.socket.emit('lobbyFriendInvitationSendRes', { error: Errors.FRIENDS.ALREADY_INVITED_BY_THIS_MEMBER.code, status: Errors.FRIENDS.ALREADY_INVITED_BY_THIS_MEMBER.status });
                        }
                    } else {
                        UserSchema.requestFriend(user.id, invitedUser._id, (error, friendships) => {
                            if (error) {
                                user.socket.emit('lobbyFriendInvitationSendRes', { error: Errors.FRIENDS.REQUEST_ERROR.code, status: Errors.FRIENDS.REQUEST_ERROR.status });
                                return;
                            }

                            user.socket.emit('lobbyFriendInvitationSendRes', { error: Errors.SUCCESS.code, status: Errors.SUCCESS.status });

                            // Envoi temps réel (si utilisateur connecté)
                            for (const u of this.GLOBAL.users) {
                                if (invitedUser._id == u.id) {
                                    u.socket.emit('lobbyFriendInvitationReceivedRes', { id: user.id, nickname: user.nickname });
                                    break;
                                }
                            }

                            return;
                        });
                    }
                });
            });
        });
    }

    lobbyFriendInvitationActionReq(user, lobby) {
        user.socket.on('lobbyFriendInvitationActionReq', (data) => {

            let action = data.action; // 0 = reject; 1 = accept
            let userNickname = data.nickname;

            UserSchema.findOne({ nickname: userNickname }, (error, invitedByUser) => {
                if (error || !invitedByUser) {
                    user.socket.emit('lobbyFriendInvitationActionRes', { error: Errors.FRIENDS.NOT_EXISTS.code, status: Errors.FRIENDS.NOT_EXISTS.status });
                    return;
                }

                if (action) { // accept
                    UserSchema.requestFriend(user.id, invitedByUser._id, (error, friendships) => {
                        if (error) {
                            user.socket.emit('lobbyFriendInvitationActionRes', { error: Errors.FRIENDS.REQUEST_ERROR.code, status: Errors.FRIENDS.REQUEST_ERROR.status });
                            return;
                        }

                        user.socket.emit('lobbyFriendInvitationActionRes', { error: Errors.SUCCESS.code, status: Errors.SUCCESS.status });

                        // Envoi de la notification d'acceptation en temps réel si l'utilisateur ayant fait la demande d'ami est connecté
                        for (const u of this.GLOBAL.users) {
                            if (invitedByUser._id == u.id) {
                                u.socket.emit('lobbyFriendInvitationAcceptedRes', { id: user.id, nickname: user.nickname });
                                break;
                            }
                        }

                        return;
                    });
                } else { // reject

                    UserSchema.findById(user.id, (error, userMongo) => {
                        if (error || !userMongo) {
                            user.socket.emit('lobbyFriendInvitationActionRes', { error: Errors.FRIENDS.NOT_EXISTS.code, status: Errors.FRIENDS.NOT_EXISTS.status });
                            return;
                        }
                        UserSchema.removeFriend(userMongo, invitedByUser);
                        user.socket.emit('lobbyFriendInvitationActionRes', { error: Errors.SUCCESS.code, status: Errors.SUCCESS.status });
                    });

                    return;
                }
            });
        });
    }

    lobbyInvitationAcceptReq(user, lobby) {
        user.socket.on('lobbyInvitationAcceptReq', (data) => {
            let err = Errors.SUCCESS;
            let friendLobby = null;

            if (!data || !data.invitationID)
                err = Errors.MISSING_FIELD;
            else {
                const invitObj = lobby.delInvitation(parseInt(data.invitationID));
                if (!invitObj)
                    err = Errors.LOBBY.INVITATION_NOT_EXISTS;
                else if (invitObj.toUserID !== user.id)
                    err = Errors.UNKNOW;
                else {
                    for (const lobby of this.GLOBAL.lobbies) {
                        const usr = lobby.userByID(invitObj.fromUserID);
                        if (usr) {
                            friendLobby = lobby;
                            break;
                        }
                    }

                    if (!friendLobby)
                        err = Errors.LOBBY.CLOSED;
                    else if (friendLobby.users.length >= 8)
                        err = Errors.LOBBY.FULL;
                    else {
                        // quitter son lobby
                        for (const lobby of this.GLOBAL.lobbies) {
                            const usr = lobby.userByID(user.id);
                            if (usr) {
                                lobby.delUser(user);
                                user.socket.leave(lobby.name);
                                break;
                            }
                        }
                    }
                }

                if (err.code === Errors.SUCCESS.code) {
                    friendLobby.addUser(user);
                    friendLobby.invitedUsers.push(user);
                }

                user.socket.emit('lobbyInvitationAcceptRes', { error: err.code, status: err.status });
            }
        });
    }

    lobbyKickReq(user, lobby) {
        user.socket.on('lobbyKickReq', (data) => {
            let err = Errors.SUCCESS;
            let userToKick = null;

            if (!data.userToKickID)
                err = Errors.MISSING_FIELD;
            else if (data.userToKickID === user.id)
                err = Errors.UNKNOW;
            else {
                userToKick = lobby.userByID(data.userToKickID);
                if (!userToKick)
                    err = Errors.LOBBY.NOT_IN_LOBBY;
            }

            if (err.code === Errors.SUCCESS.code)
                lobby.delUser(userToKick, false); // lui envoie l'event socket lobbyUserLeftRes

            user.socket.emit('lobbyKickRes', { error: err.code, status: err.status });
        });
    }

    lobbyChangeTargetUsersNbReq(user, lobby) {
        user.socket.on('lobbyChangeTargetUsersNbReq', (data) => {
            let err = Errors.SUCCESS;
            if (!data.nb)
                err = Errors.MISSING_FIELD;
            else if (!lobby.isHost(user))
                err = Errors.UNKNOW; // n'est pas l'hôte
            else {
                lobby.changeTargetUsersNb(data.nb);
                this.io.to(lobby.name).emit('lobbyTargetUsersNbChangedRes', { nb: lobby.targetUsersNb });
            }

            user.socket.emit('lobbyChangeTargetUsersNbRes', { error: err.code, status: err.status });
        });
    }

    lobbyChangePawnReq(user, lobby) {
        user.socket.on('lobbyChangePawnReq', (data) => {
            let err = Errors.SUCCESS;

            if (!data.pawn)
                err = Errors.MISSING_FIELD;
            else if (!lobby.changePawn(user, data.pawn))
                err = Errors.LOBBY.PAWN_ALREADY_USED;
            else {
                this.io.to(lobby.name).emit('lobbyUserPawnChangedRes', {
                    userID : user.id,
                    pawn   : data.pawn
                });
            }

            user.socket.emit('lobbyChangePawnRes', { error: err.code, status: err.status });
        });
    }

    lobbyChatSendReq(user, lobby) {
        user.socket.on('lobbyChatSendReq', (data) => {
            let err = Errors.SUCCESS;

            if (!data.content)
                err = Errors.MISSING_FIELD;
            else
                this.lobbySendMessage(lobby, user, data.content);

            user.socket.emit('lobbyChatSendRes', { error: err.code, status: err.status });
        });
    }

    // cette méthode n'est pas associée à un event socket !
    lobbySendMessage (lobby, user, text) {
        const mess = lobby.chat.addMessage(user, text);
        // broadcast lobby (also sender)
        this.io.to(lobby.name).emit('lobbyChatReceiveRes', {
            senderUserID : mess.sender ? mess.sender.id : -1, // -1 => Server
            content      : mess.text,
            createdTime  : mess.createdTime
        });
    }

    lobbyPlayReq(user, lobby) {
        user.socket.on('lobbyPlayReq', (data) => {
            let err = Errors.SUCCESS;

            if (!lobby.isHost(user))
                err = Errors.UNKNOW; // n'est pas l'hôte
            else if (lobby.users.length < lobby.targetUsersNb)
                err = Errors.LOBBY.NOT_FULL;

            if (err.code === Errors.SUCCESS.code) {
                this.io.to(lobby.name).emit('lobbyPlayRes', { error: Errors.SUCCESS.code, status: Errors.SUCCESS.status });
                lobby.searchGame();
            } else
                user.socket.emit('lobbyPlayRes', { error: err.code, status: err.status });
        });
    }

    lobbyFriendListReq(user, lobby) {
        user.socket.on('lobbyFriendListReq', () => {
            let friends = [];

            UserSchema.getAcceptedFriends(user.id, (error, friendsObj) => {
                if (!friendsObj || error) {
                    user.socket.emit('lobbyFriendListRes', { error: Errors.FRIENDS.REQUEST_ERROR.code, status: Errors.FRIENDS.REQUEST_ERROR.status });
                    return;
                }

                // Aucun ami (-> renvoie liste vide)
                if (friendsObj.length == 0) {
                    user.socket.emit('lobbyFriendListRes', { friends: [] });
                    return;
                }

                for (let i = 0; i < friendsObj.length; i++) {
                    friends.push({ id: friendsObj[i].friend._id, nickname: friendsObj[i].friend.nickname });
                }

                user.socket.emit('lobbyFriendListRes', { friends: friends });
            });
        });
    }

    lobbyRequestedFriendListReq(user, lobby) {
        user.socket.on('lobbyRequestedFriendListReq', () => {
            let friends = [];

            UserSchema.getRequestedFriends(user.id, (error, friendsObj) => {
                if (!friendsObj || error) {
                    user.socket.emit('lobbyRequestedFriendListRes', { error: Errors.FRIENDS.REQUEST_ERROR.code, status: Errors.FRIENDS.REQUEST_ERROR.status });
                    return;
                }

                // Aucun ami (-> renvoie liste vide)
                if (friendsObj.length == 0) {
                    user.socket.emit('lobbyRequestedFriendListRes', { friends: [] });
                    return;
                }

                for (let i = 0; i < friendsObj.length; i++) {
                    friends.push({ id: friendsObj[i].friend._id, nickname: friendsObj[i].friend.nickname });
                }

                user.socket.emit('lobbyRequestedFriendListRes', { friends: friends });
            });
        });
    }

    lobbyPendingFriendListReq(user, lobby) {
        user.socket.on('lobbyPendingFriendListReq', () => {
            let friends = [];

            UserSchema.getPendingFriends(user.id, (error, friendsObj) => {
                if (!friendsObj || error) {
                    user.socket.emit('lobbyPendingFriendListRes', { error: Errors.FRIENDS.REQUEST_ERROR.code, status: Errors.FRIENDS.REQUEST_ERROR.status });
                    return;
                }

                // Aucun ami (-> renvoie liste vide)
                if (friendsObj.length == 0) {
                    user.socket.emit('lobbyPendingFriendListRes', { friends: [] });
                    return;
                }

                for (let i = 0; i < friendsObj.length; i++) {
                    friends.push({ id: friendsObj[i].friend._id, nickname: friendsObj[i].friend.nickname });
                }

                user.socket.emit('lobbyPendingFriendListRes', { friends: friends });
            });
        });
    }

    /////////////////
    // GAME EVENTS //
    /////////////////

    gameReadyReq(player, game) {
        player.socket.on('gameReadyReq', () => {
            player.isReady = true;
            if (game.allPlayersReady && !game.startedTime) {
                // message de commencement
                const mess = game.chat.addMessage(null, 'C\'est parti, bonne chance à tous !');
                this.io.to(game.name).emit('gameChatReceiveRes', {
                    playerID    : -1, // = provient du serveur
                    text        : mess.text ,
                    createdTime : mess.createdTime
                });

                game.start();

                // envoyer les données initiales de jeu à tous les joueurs
                let players = [], cells = [], properties = [], cellsCounter = 0;

                for (const player of game.players) {
                    players.push({
                        nickname : player.nickname,
                        id       : player.id,
                        pawn     : player.pawn
                    });
                }

                for (const cell of game.cells) {
                    cells.push({
                        id         : cellsCounter ++,
                        type       : cell.type,
                        propertyID : cell.property ? cell.property.id : null
                    });

                    // propriétés
                    if (cell.type === Constants.CELL_TYPE.PROPERTY) {
                        let propertyData = {
                            id          : cell.property.id,
                            type        : cell.property.type,
                            name        : cell.property.name,
                            description : cell.property.description
                        };

                        switch (cell.property.type) {
                            case Constants.PROPERTY_TYPE.STREET:
                                propertyData.color        = cell.property.color;
                                propertyData.prices       = cell.property.prices;
                                propertyData.rentalPrices = cell.property.rentalPrices;
                                break;

                            case Constants.PROPERTY_TYPE.PUBLIC_COMPANY:
                                propertyData.price       = cell.property.price;
                                break;

                            case Constants.PROPERTY_TYPE.TRAIN_STATION:
                                propertyData.price        = cell.property.price;
                                propertyData.rentalPrices = cell.property.rentalPrices;
                        }

                        properties.push(propertyData);
                    }
                }

                this.io.to(game.name).emit('gameStartedRes', {
                    gameEndTime  : game.forcedEndTime,
                    playersMoney : Constants.GAME_PARAM.PLAYER_INITIAL_MONEY,
                    bankMoney    : Constants.GAME_PARAM.BANK_INITIAL_MONEY,
                    players      : players,
                    cells        : cells,
                    properties   : properties
                });
            }
        });
    }

    gameRollDiceReq(player, game) {
        player.socket.on('gameRollDiceReq', () => {
            let err = Errors.SUCCESS;
            if (player !== game.curPlayer)
                err = Errors.GAME.NOT_MY_TURN;
            else
                this.gameTurnAction(player, game);

            player.socket.emit('gameRollDiceRes', { error: err.code, status: err.status });
        });
    }

    gameTurnEndReq(player, game) {
        player.socket.on('gameTurnEndReq', (data) => {
            let err = Errors.SUCCESS;
            if (player !== game.curPlayer)
                err = Errors.GAME.NOT_MY_TURN;
            else
                game.endTurn();

            player.socket.emit('gameTurnEndRes', { error: err.code, status: err.status });
        });
    }

    // n'est pas une écoute d'event !
    gameTurnAction (player, game) {
        const moneySav = []; // sauvegarder l'argent des joueurs avant rollDice()
        for (const playr of game.players)
            moneySav.push(playr.money);
        const nbJailEscapeCardsSave = player.nbJailEscapeCards;

        const cellPosSave = player.cellPos;

        const diceRes = game.rollDice();

        if (!diceRes) {
            player.socket.emit('gameRollDiceRes', { error: Errors.UNKNOW.code, status: Errors.UNKNOW.status });
            return;
        }

        let updateMoneyList = [];
        for (let i = 0; i < game.players.length; i++) {
            if (moneySav.length > i && game.players[i].money !== moneySav[i])
                updateMoneyList.push({ playerID: game.players[i].id, money: game.players[i].money });
        }

        const extra = {};
        if (nbJailEscapeCardsSave !== player.nbJailEscapeCards)
            extra.nbJailEscapeCards = player.nbJailEscapeCards;

        // ajouter carte chance/communauté si une a été tirée
        let cardToSend = null;
        const tmpc = (cellPosSave + diceRes[0] + diceRes[1]) % 40;
        const cellPosTmp = player.cellPos !== tmpc ? tmpc : null;

        if (cellPosTmp === null) {
            if (game.curCell.type === Constants.CELL_TYPE.CHANCE) {
                cardToSend = game.chanceDeck.drawnCards[game.chanceDeck.drawnCards.length - 1];
                extra.newCard = {
                    type: 'chance',
                    name: cardToSend.token,
                    description: cardToSend.description
                }
            }
            else if (game.curCell.type === Constants.CELL_TYPE.COMMUNITY) {
                cardToSend = game.communityChestDeck.drawnCards[game.communityChestDeck.drawnCards.length - 1];
                extra.newCard = {
                    type: 'community',
                    name: cardToSend.token,
                    description: cardToSend.description
                }
            }
        }
        else {
            if (game.cells[cellPosTmp].type === Constants.CELL_TYPE.CHANCE) {
                cardToSend = game.chanceDeck.drawnCards[game.chanceDeck.drawnCards.length - 1];
                extra.newCard = {
                    type: 'chance',
                    name: cardToSend.token,
                    description: cardToSend.description
                }
            }
            else if (game.cells[cellPosTmp].type === Constants.CELL_TYPE.COMMUNITY) {
                cardToSend = game.communityChestDeck.drawnCards[game.communityChestDeck.drawnCards.length - 1];
                extra.newCard = {
                    type: 'community',
                    name: cardToSend.token,
                    description: cardToSend.description
                }
            }
        }

        this.io.to(game.name).emit('gameActionRes', {
            dicesRes         : diceRes,
            playerID         : player.id,
            cellPosTmp       : cellPosTmp,
            cellPos          : player.cellPos,
            turnEndTime      : game.turnData.endTime,
            actionMessage    : game.turnData.actionMessage,
            asyncRequestType : game.turnData.asyncRequestType,
            asyncRequestArgs : game.turnData.asyncRequestArgs,
            updateMoney      : updateMoneyList,
            extra            : extra
        });
    }

    gamePropertyBuyReq(player, game) {
        player.socket.on('gamePropertyBuyReq', (data) => {
            let err = Errors.SUCCESS;
            let propertyID;

            if (player !== game.curPlayer)
                err = Errors.GAME.NOT_MY_TURN;
            else
                err = game.asyncActionBuyProperty();

            if (err === Errors.SUCCESS) {
                this.io.to(game.name).emit('gamePropertyBuyRes', {
                    propertyID  : game.curCell.property.id,
                    playerID    : player.id,
                    playerMoney : player.money,
                    bankMoney   : game.bank.money
                });
            } else {
                player.socket.emit('gamePropertyBuyRes', { error: err.code, status: err.status });
            }
        });
    }

    gamePropertyUpgradeReq(player, game) {
        player.socket.on('gamePropertyUpgradeReq', (data) => {
            let err = Errors.SUCCESS;
            let propertyID;

            if (!data.level)
                err = Errors.MISSING_FIELD;
            else if (player !== game.curPlayer)
                err = Errors.GAME.NOT_MY_TURN;
            else if (!game.asyncActionUpgradeProperty(data.level)) // upgrade ici
                err = Errors.UNKNOW;

            if (err === Errors.SUCCESS) {
                this.io.to(game.name).emit('gamePropertyUpgradeRes', {
                    propertyID  : game.curCell.property.id,
                    level       : data.level,
                    playerID    : player.id,
                    playerMoney : player.money
                });
            } else
                player.socket.emit('gamePropertyUpgradeRes', { error: err.code, status: err.status });
        });
    }

    gamePropertyForcedMortageReq(player, game) {
        player.socket.on('gamePropertyForcedMortageReq', (data) => {
            let err = Errors.SUCCESS;
            let propertyID;

            if (!data.properties)
                err = Errors.MISSING_FIELD;
            else if (player !== game.curPlayer)
                err = Errors.GAME.NOT_MY_TURN;
            else if (!game.asyncActionManualForcedMortage(data.properties)) // hypothécation ici
                err = Errors.GAME.NOT_ENOUGH_FOR_MORTAGE;

            if (err !== Errors.SUCCESS)
                player.socket.emit('gamePropertyForcedMortageRes', { error: err.code, status: err.status });
            // else => envoyé par game.playerAutoMortage()
        });
    }

    gameChatSendReq(player, game) {
        player.socket.on('gameChatSendReq', (data) => {
            let err = Errors.SUCCESS;
            if (!data.text)
                err = Errors.MISSING_FIELD;
            else if (!game.allPlayersReady)
                err = Errors.GAME.NOT_STARTED;
            else {
                // envoyer le message (texte brut)
                const mess = game.chat.addMessage(player.user, data.text);
                this.io.to(game.name).emit('gameChatReceiveRes', {
                    playerID    : player.id,
                    text        : mess.text,
                    createdTime : mess.createdTime
                });
            }

            player.socket.emit('gameChatSendRes', { error: err.code, status: err.status });
        });
    }

    gameOfferSendReq(player, game) {
        player.socket.on('gameOfferSendReq', (data) => {
            let err = Errors.SUCCESS, recvr, prop;
            if (data.receiverID == null || data.propertyID == null || !data.price)
                err = Errors.MISSING_FIELD;
            else if (!(prop = player.propertyByID(data.propertyID)) || !(recvr = game.playerByID(data.receiverID)))
                err = Errors.UNKNOW;
            else {
                const offer = new Offer(game, player, recvr, prop, data.price);

                this.io.to(game.name).emit('gameOfferReceiveRes', {
                    receiverID : offer.receiver.id,
                    offerID    : offer.id,
                    price      : offer.amount,
                    propertyID : offer.property.id,
                    makerID    : offer.maker.id
                });
            }

            player.socket.emit('gameOfferSendRes', { error: err.code, status: err.status });
        });
    }

    gameOfferAcceptReq(player, game) {
        player.socket.on('gameOfferAcceptReq', (data) => {
            let err = Errors.SUCCESS, offer;
            if (data.offerID == null)
                err = Errors.MISSING_FIELD;
            else if (!(offer = Offer.offerByID(data.offerID)) || offer.receiver !== player || offer.property.owner !== offer.maker)
                err = Errors.UNKNOW;
            else if (player.money < offer.amount)
                err = Errors.GAME.NOT_ENOUGH_FOR_OFFER;
            else {
                if (!offer.accept())
                    err = Errors.UNKNOW;
                else {
                    this.io.to(game.name).emit('gameOfferFinishedRes', {
                        receiverID : offer.receiver.id,
                        offerID    : offer.id,
                        price      : offer.amount,
                        propertyID : offer.property.id,
                        makerID    : offer.maker.id
                    });
                }
            }

            player.socket.emit('gameOfferAcceptRes', { error: err.code, status: err.status });
        });
    }

    gameOverbidReq(player, game) {
        player.socket.on('gameOverbidReq', (data) => {
            let err = Errors.SUCCESS;
            // TODO
            if (!data.text || !data.bidID)
                err = Errors.MISSING_FIELD;
            else if (!(player === game.curPlayer))
                err = err = Errors.GAME.NOT_MY_TURN;
            else {
                const bid = game.bidByID(data.bidID);
                if (bid === null)
                    err = Errors.BID_ERRORS.BID_ENDED;
                const boundary = bid.amountAsked - data.price;
                //Sécurité pour les enchères, histoire qu'il n'y ait pas d'update pour une différence de 1 euro par exemple entre 200 et 201
                if (boundary >= 20) {
                    bid.updateBid(player, data.price);
                    const msg = player.nickname + ' a surrenchéri pour ' + bid.property.name + ' avec une valeur de ' + data.price;
                    this.io.to(game.name).emit('gameBidRes', {
                        bidID: bid.id,
                        playerID: player.id,
                        text: msg,
                        price: data.price
                    });
                }
                else
                    err = Errors.BID_ERRORS.BID_DIFF_LOWER_THAN_TWENTY;

            }
            player.socket.emit('gameOverbidRes', {error: err.code, status: err.status});
        });
    }

    gameMortageReq(player, game) {
        player.socket.on('gameMortageReq', (data) => {
            let err = Errors.SUCCESS;
            // TODO
        });
    }


    // UTILIES METHODS

    gamePlayerDisconnected (player, game) {
        console.log(player.nickname + ' s\'est déconnecté du jeu !');
        player.connected = false;
        this.io.to(game.name).emit('gamePlayerDisconnectedRes', { playerID: player.id });

        const mess = game.chat.addMessage(null, 'Le joueur ' + player.nickname + ' s\'est déconnecté');
        this.io.to(game.name).emit('gameChatReceiveRes', {
            playerID    : -1,
            text        : mess.text,
            createdTime : mess.createdTime
        });
    }

    gamePlayerReconnected (player, game) {
        console.log(player.nickname + ' s\'est reconnecté au jeu !');
        player.connected = true;
        this.gamePlayerListen(player, game);
        player.socket.broadcast.to(game.name).emit('gamePlayerReconnectedRes', { playerID: player.id });

        const mess = game.chat.addMessage(null, 'Le joueur ' + player.nickname + ' s\'est reconnecté');
        this.io.to(game.name).emit('gameChatReceiveRes', {
            playerID    : -1,
            text        : mess.text,
            createdTime : mess.createdTime
        });

        player.socket.on('gameReadyReq', () => {

            let players = [], cells = [], properties = [], playerProperties = [], chatMessages = [], cellsCounter = 0;

            for (const prop of player.properties)
                playerProperties.push(prop.id);

            for (const player of game.players) {
                players.push({
                    nickname          : player.nickname,
                    id                : player.id,
                    pawn              : player.pawn,
                    money             : player.money,
                    properties        : playerProperties,
                    nbJailEscapeCards : player.nbJailEscapeCards,
                    cellPos           : player.cellPos
                });
            }

            for (const cell of game.cells) {
                cells.push({
                    id         : cellsCounter ++,
                    type       : cell.type,
                    propertyID : cell.property ? cell.property.id : null
                });

                // propriétés
                if (cell.type === Constants.CELL_TYPE.PROPERTY) {
                    let propertyData = {
                        id          : cell.property.id,
                        type        : cell.property.type,
                        name        : cell.property.name,
                        description : cell.property.description
                    };

                    switch (cell.property.type) {
                        case Constants.PROPERTY_TYPE.STREET:
                            propertyData.color        = cell.property.color;
                            propertyData.prices       = cell.property.prices;
                            propertyData.rentalPrices = cell.property.rentalPrices;
                            propertyData.housesNb     = cell.property.housesNb;
                            propertyData.hasHostel    = cell.property.hasHostel;
                            break;

                        case Constants.PROPERTY_TYPE.PUBLIC_COMPANY:
                            propertyData.price       = cell.property.price;
                            propertyData.rentalPrice = cell.property.rentalPrice;
                            break;

                        case Constants.PROPERTY_TYPE.TRAIN_STATION:
                            propertyData.price        = cell.property.price;
                            propertyData.rentalPrices = cell.property.rentalPrices;
                    }

                    properties.push(propertyData);
                }
            }

            // messages de chat
            for (const mess of game.chat.messages) {
                chatMessages.push({
                    playerID: mess.sender ? mess.sender : -1,
                    text: mess.text,
                    createdTime: mess.createdTime
                });
            }
            // infos de reconnexion au joueur
            player.socket.emit('gameReconnectionRes', {
                gameEndTime  : game.forcedEndTime,
                bankMoney    : Constants.GAME_PARAM.BANK_INITIAL_MONEY,
                chatMessages : chatMessages,
                offers       : [],
                bids         : [],
                players      : players,
                cells        : cells,
                properties   : properties
            });

            if (game.curPlayer === player && game.turnData.canRollDiceAgain)
                player.socket.emit('gameTurnRes', { playerID: player.id, turnEndTime: game.turnData.endTime });
        });
    }
}

module.exports = Network;
