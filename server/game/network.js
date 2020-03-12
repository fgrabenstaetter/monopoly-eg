const Constants = require('../lib/constants');
const Errors    = require('../lib/errors');
const { UserSchema, UserManager } = require('../models/user');
const Lobby     = require('./lobby');

/**
 * Simplifie et centralise toutes les communications socket
 */
class Network {

    /**
     * @param io L'instance globale socket.io du serveur
     * @param GLOBAL L'instance globale de données du serveur
     */
    constructor (io, GLOBAL) {
        this.io = io;
        this.GLOBAL = GLOBAL;
    }

    /////////////////////
    // GENERAL METHODS //
    /////////////////////

    lobbyUserListen (user, lobby) {
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
        this.lobbyRequestedFriendListReq      (user, lobby);
        this.lobbyFriendInvitationSendReq   (user, lobby);
        this.lobbyFriendInvitationActionReq (user, lobby);
        // this.lobbyFriendDeleteReq(user, lobby);

        user.socket.on('lobbyReadyReq', () => {
            // réponse de création / rejoignage de lobby
            this.lobbyNewUser(user, lobby);
        });
    }

    lobbyUserStopListening (user, lobby) {
        // Inviter / Rejoindre / Quitter
        user.socket.off('lobbyInvitationReq');
        user.socket.off('lobbyInvitationAcceptReq');
        user.socket.off('lobbyKickReq');

        // Paramètres + Chat
        user.socket.off('lobbyChangeTargetUsersNbReq');
        user.socket.off('lobbyChangePawnReq');
        user.socket.off('lobbyChatSendReq');
        user.socket.off('lobbyPlayReq');

        // Amis
        user.socket.off('lobbyFriendInvitationSendReq');
        user.socket.off('lobbyFriendInvitationActionReq');
        // user.socket.off('lobbyFriendDeleteReq');

        user.socket.leave(lobby.name);
    }

    gamePlayerListen (player, game) {
        player.user.socket.join(game.name);

        // Début/Fin + tour
        this.gameReadyReq                     (player, game);
        this.gameRollDiceReq                  (player, game);
        this.gameTurnEndReq                   (player, game);

        // Actions de tour asynchrones
        this.gameTurnPropertyBuyReq           (player, game);
        this.gameTurnPropertyUpgradeReq       (player, game);
        this.gameTurnPropertyForcedMortageReq (player, game);

        // Chat + offres
        this.gameChatSendReq                  (player, game);
        this.gameOfferSendReq                 (player, game);
        this.gameOfferAcceptReq               (player, game);

        // Divers
        this.gameOverbidReq                   (player, game);
        this.gameMortageReq                   (player, game);
    }

    gamePlayerStopListening (player, game) {
        // Début/Fin + tour
        player.user.socket.off('gameReadyReq');
        player.user.socket.off('gameRollDiceReq');
        player.user.socket.off('gameTurnEndReq');

        // Actions de tour asynchrones
        player.user.socket.off('gameTurnPropertyBuyReq');
        player.user.socket.off('gameTurnPropertyUpgradeReq');
        player.user.socket.off('gameTurnPropertyForcedMortageReq');

        // Chat + offres
        player.user.socket.off('gameChatSendReq');
        player.user.socket.off('gameOfferSendReq');
        player.user.socket.off('gameOfferAcceptReq');

        // Divers
        player.user.socket.off('gameOverbidReq');
        player.user.socket.off('gameMortageReq');

        player.user.socket.leave(game.name);
    }

    //////////////////
    // LOBBY EVENTS //
    //////////////////

    lobbyNewUser (user, lobby) {

        if (lobby.users[0] === user) { // est l'hôte
            console.log('envoi de createdred')
            user.socket.emit('lobbyCreatedRes', {
                targetUsersNb : lobby.targetUsersNb,
                pawn          : lobby.userPawn(user)
            });
            return;
        }

        // non hôte
        let messages = [];
        for (const mess of lobby.chat.messages) {
            messages.push({
                senderUserID : mess.senderUser.id,
                content      : mess.content,
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

        console.log('envoi de joinedRes')
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

    lobbyInvitationReq (user, lobby) {
        user.socket.on('lobbyInvitationReq', (data) => {
            let err = Errors.SUCCESS;
            let friendUser = null;

            if (!data.friendID)
                err = Errors.MISSING_FIELD;
            else if (user.friends.indexOf(data.friendID) === -1)
                err = Errors.FRIEND_NOT_EXISTS;
            else if (lobby.users.length >= lobby.targetUsersNb)
                err = Errors.LOBBY_FULL;
            else {
                for (const user of this.GLOBAL.users) {
                    if (user.friendID === data.friendID) {
                        friendUser = user;
                        break;
                    }
                }

                if (!friendUser)
                    err = Errors.FRIEND_NOT_CONNECTED;
                else {
                    for (const game of this.GLOBAL.games) {
                        const tmp = game.playerByID(data.friendID);
                        if (tmp) {
                            err = Errors.FRIEND_IN_GAME;
                            break;
                        }
                    }
                }

                if (err.code === Errors.SUCCESS.code) {
                    const invitId = lobby.addInvitation(user.id, data.friendID);
                    friendUser.socket.emit('lobbyInvitationReceivedRes', {
                        invitationID   : invitId,
                        senderFriendID : user.id,
                        nbUsersInLobby : lobby.users.length
                    });
                }

                user.socket.emit('lobbyInvitationRes', { error: err.code, status: err.status });
            }
        });
    }

    lobbyFriendInvitationSendReq (user, lobby) {
        user.socket.on('lobbyFriendInvitationSendReq', (data) => {
            console.log('"' + user.nickname + '" invite "' + data.nickname + '" en ami');

            UserSchema.findOne({ nickname: data.nickname }, (error, invitedUser) => {
                if (error || !invitedUser) {
                    console.log('Ami à inviter "' + data.nickname + '" non trouvé :/');
                    user.socket.emit('lobbyFriendInvitationSendRes', { error: Errors.FRIENDS.NOT_EXISTS.code, status: Errors.FRIENDS.NOT_EXISTS.status });
                    return;
                }

                console.log('Envoi de l\'invitation à "' + invitedUser.nickname + '"');

                UserSchema.requestFriend(user.id, invitedUser._id, (error, friendships) => {
                    if (error) {
                        console.log('Erreur lors de l\'envoi de l\'invitation');
                        user.socket.emit('lobbyFriendInvitationSendRes', { error: Errors.FRIENDS.REQUEST_ERROR.code, status: Errors.FRIENDS.REQUEST_ERROR.status });
                        return;
                    }

                    console.log('Invitation envoyée avec succès !');
                    user.socket.emit('lobbyFriendInvitationSendRes', { error: Errors.SUCCESS.code, status: Errors.SUCCESS.status });

                    // Envoi temps réel (si utilisateur connecté)
                    for (const lobby of this.GLOBAL.lobbies) {
                        const invitedUserInLobby = lobby.userByID(invitedUser);
                        if (invitedUserInLobby) {
                            invitedUserInLobby.socket.emit('lobbyFriendInvitationReceivedRes', { id: user.id, nickname: user.nickname });
                            break;
                        }
                    }

                    return;
                });
            });
        });
    }

    lobbyFriendInvitationActionReq (user, lobby) {
        user.socket.on('lobbyFriendInvitationActionReq', (data) => {

            let action = data.action; // 0 = reject; 1 = accept
            let userNickname = data.nickname;

            UserSchema.findOne({ nickname: userNickname }, (error, invitedByUser) => {
                if (error || !invitedByUser) {
                    user.socket.emit('lobbyFriendInvitationActionRes', { error: Errors.FRIENDS.NOT_EXISTS.code, status: Errors.FRIENDS.NOT_EXISTS.status });
                    return;
                }

                if (action) { // accept
                    UserSchema.requestFriend(user._id, invitedByUser._id, (error, friendships) => {
                        if (error) {
                            console.log('Erreur acceptation invitation');
                            user.socket.emit('lobbyFriendInvitationActionRes', { error: Errors.FRIENDS.REQUEST_ERROR.code, status: Errors.FRIENDS.REQUEST_ERROR.status });
                            return;
                        }

                        console.log('Invitation acceptée pour "' + invitedByUser.nickname + '"');
                        user.socket.emit('lobbyFriendInvitationActionRes', { error: Errors.SUCCESS.code, status: Errors.SUCCESS.status });
                        return;
                    });
                } else { // reject
                    UserSchema.removeFriend(user._id, invitedByUser._id);
                    console.log('Requête rejetée avec succès');
                    user.socket.emit('lobbyFriendInvitationActionRes', { error: Errors.SUCCESS.code, status: Errors.SUCCESS.status });
                    return;
                }
            });
        });
    }

    lobbyInvitationAcceptReq (user, lobby) {
        user.socket.on('lobbyInvitationAcceptReq', (data) => {
            let err = Errors.SUCCESS;
            let friendLobby = null;

            if (!data.invitationID)
                err = Errors.MISSING_FIELD;
            else {
                const invitObj = lobby.delInvitation(data.invitationID);
                if (!invitObj)
                    err = Errors.LOBBY.INVITATION_NOT_EXISTS;
                else if (invitObj.to !== user.id)
                    err = Errors.UNKNOW;
                else {
                    for (const lobby of this.GLOBAL.lobbies) {
                        const usr = lobby.userByID(invitObj.from);
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

                if (err.code === Errors.SUCCESS.code)
                    friendLobby.addUser(user);

                user.socket.emit('lobbyInvitationAcceptRes', { error: err.code, status: err.status });
            }
        });
    }

    lobbyKickReq (user, lobby) {
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

    lobbyChangeTargetUsersNbReq (user, lobby) {
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

    lobbyChangePawnReq (user, lobby) {
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

    lobbyChatSendReq (user, lobby) {
        user.socket.on('lobbyChatSendReq', (msg) => {
            let err = Errors.SUCCESS;

            if (!msg.content)
                err = Errors.MISSING_FIELD;
            else {
                const mess = lobby.chat.addMessage(user, msg.content, Constants.CHAT_MESSAGE_TYPE.TEXT);
                // broadcast lobby (also sender)
                console.log('tchat send req for ' + user.nickname)
                this.io.to(lobby.name).emit('lobbyChatReceiveRes', {
                    senderUserID : mess.senderUser.id,
                    content      : mess.content,
                    createdTime  : mess.createdTime
                });
            }

            user.socket.emit('lobbyChatSendRes', { error: err.code, status: err.status });
        });
    }

    lobbyPlayReq (user, lobby) {
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

    lobbyFriendListReq (user, lobby) {
        user.socket.on('lobbyFriendListReq', () => {
            let friends = [];
            let nbInserted = 0;

            UserSchema.findById(user.id, (error, userMongo) => {
                if (!error && userMongo) {
                    userMongo.getFriends(userMongo, {}, (error, friendsObj) => {
                        if (!friendsObj || error) {
                            user.socket.emit('lobbyFriendListRes', { error: Errors.FRIENDS.REQUEST_ERROR.code, status: Errors.FRIENDS.REQUEST_ERROR.status });
                            return;
                        }

                        // Aucun ami (-> renvoie liste vide)
                        if (friendsObj.length == 0) {
                            user.socket.emit('lobbyFriendListRes', { friends: [] });
                            return;
                        }

                        for (let i = 0; i < friendsObj.length; i ++) {
                            // const friend = userMongo.friends[i];
                            UserSchema.findOne({ id: friendsObj[i]._id }, (error, friend) => {
                                if (friend && !error)
                                    friends.push({ id: friend.id, nickname: friend.nickname });

                                nbInserted++;
                                if (nbInserted === userMongo.friends.length)
                                    user.socket.emit('lobbyFriendListRes', { friends: friends });
                            });
                        }
                    });
                }
            });
        });
    }

    lobbyRequestedFriendListReq (user, lobby) {
        user.socket.on('lobbyRequestedFriendListReq', () => {
            let friends = [];
            let nbInserted = 0;

            UserSchema.findById(user.id, (error, userMongo) => {
                if (!error && userMongo) {
                    UserSchema.getRequestedFriends(userMongo, (error, friendsObj) => {
                        if (!friendsObj || error) {
                            user.socket.emit('lobbyRequestedFriendListRes', { error: Errors.FRIENDS.REQUEST_ERROR.code, status: Errors.FRIENDS.REQUEST_ERROR.status });
                            return;
                        }

                        // Aucun ami (-> renvoie liste vide)
                        if (friendsObj.length == 0) {
                            user.socket.emit('lobbyRequestedFriendListRes', { friends: [] });
                            return;
                        }

                        for (let i = 0; i < friendsObj.length; i ++) {
                            // const friend = userMongo.friends[i];
                            UserSchema.findOne({ id: friendsObj[i]._id }, (error, friend) => {
                                if (friend && !error)
                                    friends.push({ id: friend.id, nickname: friend.nickname });

                                nbInserted++;
                                if (nbInserted === userMongo.friends.length)
                                    user.socket.emit('lobbyRequestedFriendListRes', { friends: friends });
                            });
                        }
                    });
                }
            });
        });
    }

    /////////////////
    // GAME EVENTS //
    /////////////////

    gameReadyReq (player, game) {
        player.user.socket.on('gameReadyReq', () => {
            player.isReady = true;
            if (game.allPlayersReady) {
                console.log('all players ready. CREATE NEW GAME');
                game.start();

                // envoyer les données initiales de jeu à tous les joueurs
                let players = [], cells = [], properties = [], cellsCounter = 0;

                for (const player of game.players) {
                    players.push({
                        nickname : player.user.nickname,
                        id       : player.user.id,
                        pawn     : player.pawn
                    });
                }

                for (const cell of game.cells) {
                    cells.push({
                        id         : cellsCounter ++,
                        type       : cell.typeStr,
                        propertyID : cell.property ? cell.property.id : null
                    });

                    // propriétés
                    if (cell.type === Constants.CELL_TYPE.PROPERTY) {
                        let propertyData = {
                            id          : cell.property.id,
                            type        : cell.property.typeStr,
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
                                propertyData.rentalPrice = cell.property.rentalPrice;
                                break;

                            case Constants.PROPERTY_TYPE.TRAIN_STATION:
                                propertyData.price        = cell.property.price;
                                propertyData.rentalPrices = cell.property.rentalPrices;
                        }

                        properties.push(propertyData);
                    }
                }

                this.io.to(game.name).emit('gameStartedRes', {
                    gameEndTime : game.forcedEndTime,
                    players     : players,
                    cells       : cells,
                    properties  : properties
                });
            }
        });
    }

    gameRollDiceReq (player, game) {
        player.user.socket.on('gameRollDiceReq', () => {
            let err = Errors.SUCCESS;
            if (player !== game.curPlayer)
                err = Errors.GAME.NOT_MY_TURN;
            else {
                const diceRes = game.rollDice();
                this.io.to(game.name).emit('gameActionRes', {
                    playerID : player.user.id,
                    dicesRes       : diceRes,
                    cellID         : player.cellInd,
                    gameMessage    : 'vide pour linstant',
                    actionType     : 0, // tmp
                    updateMoney    : [ ], // tmp
                    extra          : [ ] // tmp
                });
            }

            player.user.socket.emit('gameRollDiceRes', { error: err.code, status: err.status });
        });
    }

    gameTurnEndReq (player, game) {
        player.user.socket.on('gameTurnEndReq', (data) => {
            let err = Errors.SUCCESS;
            if (player !== game.curPlayer)
                err = Errors.GAME.NOT_MY_TURN;
            else
                game.endTurn();

            player.user.socket.emit('gameTurnEndRes', { error: err.code, status: err.status });
        });
    }

    gameTurnPropertyBuyReq (player, game) {
        player.user.socket.on('gameTurnPropertyBuyReq', (data) => {
            let err = Errors.SUCCESS;
            let propertyID;

            if (player !== game.curPlayer)
                err = Errors.GAME.NOT_MY_TURN;
            else if ((propertyID = game.curPlayerBuyProperty()) === -1) // achat ici
                err = Errors.UNKNOW;

            if (err === Errors.SUCCESS) {
                this.io.to(game.name).emit('gameTurnPropertyBuyRes', {
                    propertyID  : propertyID,
                    playerID    : player.user.id,
                    playerMoney : player.money
                });
            } else
                player.user.socket.emit('gameTurnPropertyBuyRes', { error: err.code, status: err.status });
        });
    }

    gameTurnPropertyUpgradeReq (player, game) {
        player.user.socket.on('gameTurnPropertyUpgradeReq', (data) => {
            let err = Errors.SUCCESS;
            let propertyID;

            if (!data.level)
                err = Errors.MISSING_FIELD;
            else if (player !== game.curPlayer)
                err = Errors.GAME.NOT_MY_TURN;
            else if ((propertyID = game.curPlayerUpgradeProperty(data.level)) === -1) // upgrade ici
                err = Errors.UNKNOW;

            if (err === Errors.SUCCESS) {
                this.io.to(game.name).emit('gameTurnPropertyUpgradeRes', {
                    propertyID  : propertyID,
                    level       : data.level,
                    playerID    : player.user.id,
                    playerMoney : player.money
                });
            } else
                player.user.socket.emit('gameTurnPropertyUpgradeRes', { error: err.code, status: err.status });
        });
    }

    gameTurnPropertyForcedMortageReq (player, game) {
        player.user.socket.on('gameTurnPropertyForcedMortageReq', (data) => {
            let err = Errors.SUCCESS;
            let propertyID;

            if (!data.properties)
                err = Errors.MISSING_FIELD;
            else if (player !== game.curPlayer)
                err = Errors.GAME.NOT_MY_TURN;
            else if ((propertyID = game.curPlayerBuyProperty()) === -1) // achat ici
                err = Errors.UNKNOW;

            if (!game.curPlayerManualForcedMortage(data.properties))
                err = Errors.UNKNOW;

            if (err === Errors.SUCCESS) {
                this.io.to(game.name).emit('gameTurnPropertyForcedMortageRes', {
                    properties  : data.properties,
                    playerID    : player.user.id,
                    playerMoney : player.money
                });
            } else
                player.user.socket.emit('gameTurnPropertyForcedMortageRes', { error: err.code, status: err.status });
        });
    }

    gameChatSendReq (player, game) {
        player.user.socket.on('gameChatSendReq', (data) => {
            let err = Errors.SUCCESS;
            if (!data.text)
                err = Errors.MISSING_FIELD;
            else if (!game.allPlayersReady)
                err = Errors.GAME.NOT_STARTED;
            else {
                // envoyer le message (texte brut)
                const mess = game.chat.addMessage(player.user, data.text, Constants.CHAT_MESSAGE_TYPE.TEXT);
                this.io.to(game.name).emit('gameChatReceiveRes', {
                    type        : 'text',
                    playerID    : player.user.id,
                    text        : mess.content,
                    createdTime : mess.createdTime,
                    offer       : null
                });
            }

            player.user.socket.emit('gameChatSendRes', { error: err.code, status: err.status });
        });
    }

    gameOfferSendReq (player, game) {
        player.user.socket.on('gameOfferSendReq', (data) => {
            let err = Errors.SUCCESS;

        });
    }

    gameOfferAcceptReq (player, game) {
        player.user.socket.on('gameOfferAcceptReq', (data) => {
            let err = Errors.SUCCESS;

        });
    }

    gameOverbidReq (player, game) {
        player.user.socket.on('gameOverbidReq', (data) => {
            let err = Errors.SUCCESS;

        });
    }

    gameMortageReq (player, game) {
        player.user.socket.on('gameMortageReq', (data) => {
            let err = Errors.SUCCESS;

        });
    }
}

module.exports = Network;
