const Constants = require('../lib/constants');
const Errors = require('../lib/errors');
const Lobby = require('./lobby');
const { UserSchema, UserManager } = require('../models/user');

const mongoose = require('mongoose');
const ObjectId = require('mongoose').Types.ObjectId;

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
        this.lobbyInvitationReq(user, lobby);
        this.lobbyInvitationAcceptReq(user, lobby);
        this.lobbyKickReq(user, lobby);

        // Paramètres + Chat
        this.lobbyChangeTargetUsersNbReq(user, lobby);
        this.lobbyChangePawnReq(user, lobby);
        this.lobbyChatSendReq(user, lobby);
        this.lobbyPlayReq(user, lobby);

        // Amis
        this.lobbyFriendListReq(user, lobby);
        this.lobbyRequestedFriendListReq(user, lobby);
        this.lobbyPendingFriendListReq(user, lobby);
        this.lobbyFriendInvitationSendReq(user, lobby);
        this.lobbyFriendInvitationActionReq(user, lobby);
        // this.lobbyFriendDeleteReq(user, lobby);

        user.socket.on('lobbyReadyReq', () => {
            // réponse de création / rejoignage de lobby
            this.lobbyNewUser(user, lobby);
        });
    }

    gamePlayerListen(player, game) {
        player.user.socket.join(game.name);

        // Début/Fin + tour
        this.gameReadyReq(player, game);
        this.gameRollDiceReq(player, game);
        this.gameTurnEndReq(player, game);

        // Actions de tour asynchrones
        this.gamePropertyBuyReq(player, game);
        this.gamePropertyUpgradeReq(player, game);
        this.gamePropertyForcedMortageReq(player, game);

        // Chat + offres
        this.gameChatSendReq(player, game);
        this.gameOfferSendReq(player, game);
        this.gameOfferAcceptReq(player, game);

        // Divers
        this.gameOverbidReq(player, game);
        this.gameMortageReq(player, game);
    }

    //////////////////
    // LOBBY EVENTS //
    //////////////////

    lobbyNewUser(user, lobby) {

        if (lobby.users[0] === user) { // est l'hôte
            console.log('envoi de createdred')
            user.socket.emit('lobbyCreatedRes', {
                targetUsersNb: lobby.targetUsersNb,
                pawn: lobby.userPawn(user)
            });
            return;
        }

        // non hôte
        let messages = [];
        for (const mess of lobby.chat.messages) {
            messages.push({
                senderUserID: mess.senderUser.id,
                content: mess.content,
                createdTime: mess.createdTime
            });
        }

        let users = [];
        for (const usr of lobby.users) {
            users.push({
                nickname: usr.nickname,
                id: usr.id,
                pawn: lobby.userPawn(usr)
            });
        }

        console.log('envoi de joinedRes')
        user.socket.emit('lobbyJoinedRes', {
            targetUsersNb: lobby.targetUsersNb,
            users: users,
            messages: messages
        });

        // envoyer à tous les users du loby, sauf le nouveau
        user.socket.broadcast.to(lobby.name).emit('lobbyUserJoinedRes', {
            nickname: user.nickname,
            id: user.id,
            pawn: lobby.pawns[lobby.users.indexOf(user)]
        });
    }

    lobbyInvitationReq(user, lobby) {
        user.socket.on('lobbyInvitationReq', (data) => {
            let err = Errors.SUCCESS;
            let friendUser = null;

            if (!data.friendID)
                err = Errors.MISSING_FIELD;
            // else if (user.friends.indexOf(data.friendID) === -1)
            //     err = Errors.FRIEND_NOT_EXISTS;
            else if (lobby.users.length >= lobby.targetUsersNb)
                err = Errors.LOBBY_FULL;
            else {
                for (const user of this.GLOBAL.users) {
                    if (user.friendID === data.friendID) {
                        friendUser = user;
                        break;
                    }
                }


                if (!friendUser) {
                    err = Errors.FRIENDS.NOT_CONNECTED;

                }
                else {
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
                        invitationID: invitId,
                        senderFriendID: user.id,
                        nbUsersInLobby: lobby.users.length
                    });
                }

                user.socket.emit('lobbyInvitationRes', { error: err.code, status: err.status });
            }
        });
    }

    lobbyFriendInvitationSendReq(user, lobby) {
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
                    for (const u of this.GLOBAL.users) {
                        if (invitedUser._id == u.id) {
                            u.socket.emit('lobbyFriendInvitationReceivedRes', { id: user.id, nickname: user.nickname });
                            break;
                        }
                    }

                    return;
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
                            console.log('Erreur acceptation invitation');
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
                    userID: user.id,
                    pawn: data.pawn
                });
            }

            user.socket.emit('lobbyChangePawnRes', { error: err.code, status: err.status });
        });
    }

    lobbyChatSendReq(user, lobby) {
        user.socket.on('lobbyChatSendReq', (msg) => {
            let err = Errors.SUCCESS;

            if (!msg.content)
                err = Errors.MISSING_FIELD;
            else {
                const mess = lobby.chat.addMessage(user, msg.content, Constants.CHAT_MESSAGE_TYPE.TEXT);
                // broadcast lobby (also sender)
                console.log('tchat send req for ' + user.nickname)
                this.io.to(lobby.name).emit('lobbyChatReceiveRes', {
                    senderUserID: mess.senderUser.id,
                    content: mess.content,
                    createdTime: mess.createdTime
                });
            }

            user.socket.emit('lobbyChatSendRes', { error: err.code, status: err.status });
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
        player.user.socket.on('gameReadyReq', () => {
            player.isReady = true;
            if (game.allPlayersReady) {
                console.log('all players ready. CREATE NEW GAME');
                game.start();

                // envoyer les données initiales de jeu à tous les joueurs
                let players = [], cells = [], properties = [], cellsCounter = 0;

                for (const player of game.players) {
                    players.push({
                        nickname: player.nickname,
                        id: player.id,
                        pawn: player.pawn
                    });
                }

                for (const cell of game.cells) {
                    cells.push({
                        id: cellsCounter++,
                        type: cell.typeStr,
                        propertyID: cell.property ? cell.property.id : null
                    });

                    // propriétés
                    if (cell.type === Constants.CELL_TYPE.PROPERTY) {
                        let propertyData = {
                            id: cell.property.id,
                            type: cell.property.typeStr,
                            name: cell.property.name,
                            description: cell.property.description
                        };

                        switch (cell.property.type) {
                            case Constants.PROPERTY_TYPE.STREET:
                                propertyData.color = cell.property.color;
                                propertyData.prices = cell.property.prices;
                                propertyData.rentalPrices = cell.property.rentalPrices;
                                break;

                            case Constants.PROPERTY_TYPE.PUBLIC_COMPANY:
                                propertyData.price = cell.property.price;
                                propertyData.rentalPrice = cell.property.rentalPrice;
                                break;

                            case Constants.PROPERTY_TYPE.TRAIN_STATION:
                                propertyData.price = cell.property.price;
                                propertyData.rentalPrices = cell.property.rentalPrices;
                        }

                        properties.push(propertyData);
                    }
                }

                this.io.to(game.name).emit('gameStartedRes', {
                    gameEndTime: game.forcedEndTime,
                    players: players,
                    cells: cells,
                    properties: properties
                });
            }
        });
    }

    gameRollDiceReq(player, game) {
        player.user.socket.on('gameRollDiceReq', () => {
            let err = Errors.SUCCESS;
            if (player !== game.curPlayer)
                err = Errors.GAME.NOT_MY_TURN;
            else {
                const moneySav = []; // sauvegarder l'argent des joueurs avant rollDice()
                for (const player of game.players.length)
                    moneySav.push(player.money);

                const diceRes = game.rollDice();

                let updateMoneyList = [];
                for (let i = 0; i < game.players.length; i++) {
                    if (moneySav.length > i && game.players[i].money !== moneySav[i])
                        updateMoneyList.push({ id: game.players[i].id, money: game.players[i].money });
                }

                this.io.to(game.name).emit('gameActionRes', {
                    dicesRes: diceRes,
                    playerID: player.id,
                    cellID: player.cellPos,
                    actionMessage: game.turnData.actionMessage,
                    asyncRequestType: game.turnData.asyncRequestType,
                    asyncRequestArgs: game.turnData.asyncRequestArgs,
                    updateMoney: updateMoneyList,
                    extra: [] // tmp
                });
            }

            player.user.socket.emit('gameRollDiceRes', { error: err.code, status: err.status });
        });
    }

    gameTurnEndReq(player, game) {
        player.user.socket.on('gameTurnEndReq', (data) => {
            let err = Errors.SUCCESS;
            if (player !== game.curPlayer)
                err = Errors.GAME.NOT_MY_TURN;
            else
                game.endTurn();

            player.user.socket.emit('gameTurnEndRes', { error: err.code, status: err.status });
        });
    }

    gamePropertyBuyReq(player, game) {
        player.user.socket.on('gamePropertyBuyReq', (data) => {
            let err = Errors.SUCCESS;
            let propertyID;

            if (player !== game.curPlayer)
                err = Errors.GAME.NOT_MY_TURN;
            else if ((propertyID = game.asyncActionBuyProperty()) === -1) // achat ici
                err = Errors.UNKNOW;

            if (err === Errors.SUCCESS) {
                this.io.to(game.name).emit('gamePropertyBuyRes', {
                    propertyID: propertyID,
                    playerID: player.id,
                    playerMoney: player.money
                });
            } else
                player.user.socket.emit('gamePropertyBuyRes', { error: err.code, status: err.status });
        });
    }

    gamePropertyUpgradeReq(player, game) {
        player.user.socket.on('gamePropertyUpgradeReq', (data) => {
            let err = Errors.SUCCESS;
            let propertyID;

            if (!data.level)
                err = Errors.MISSING_FIELD;
            else if (player !== game.curPlayer)
                err = Errors.GAME.NOT_MY_TURN;
            else if ((propertyID = game.asyncActionUpgradeProperty(data.level)) === -1) // upgrade ici
                err = Errors.UNKNOW;

            if (err === Errors.SUCCESS) {
                this.io.to(game.name).emit('gamePropertyUpgradeRes', {
                    propertyID: propertyID,
                    level: data.level,
                    playerID: player.id,
                    playerMoney: player.money
                });
            } else
                player.user.socket.emit('gamePropertyUpgradeRes', { error: err.code, status: err.status });
        });
    }

    gamePropertyForcedMortageReq(player, game) {
        player.user.socket.on('gamePropertyForcedMortageReq', (data) => {
            let err = Errors.SUCCESS;
            let propertyID;

            if (!data.properties)
                err = Errors.MISSING_FIELD;
            else if (player !== game.curPlayer)
                err = Errors.GAME.NOT_MY_TURN;
            else if (!game.asyncActionManualForcedMortage(data.properties)) // hypothécation ici
                err = Errors.UNKNOW;

            if (err === Errors.SUCCESS) {
                this.io.to(game.name).emit('gamePropertyForcedMortageRes', {
                    properties: data.properties,
                    playerID: player.id,
                    playerMoney: player.money
                });
            } else
                player.user.socket.emit('gamePropertyForcedMortageRes', { error: err.code, status: err.status });
        });
    }

    gameChatSendReq(player, game) {
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
                    type: 'text',
                    playerID: player.id,
                    text: mess.content,
                    createdTime: mess.createdTime,
                    offer: null
                });
            }

            player.user.socket.emit('gameChatSendRes', { error: err.code, status: err.status });
        });
    }

    gameOfferSendReq(player, game) {
        player.user.socket.on('gameOfferSendReq', (data) => {
            let err = Errors.SUCCESS;
            // TODO
        });
    }

    gameOfferAcceptReq(player, game) {
        player.user.socket.on('gameOfferAcceptReq', (data) => {
            let err = Errors.SUCCESS;
            // TODO
        });
    }

    gameOverbidReq(player, game) {
        player.user.socket.on('gameOverbidReq', (data) => {
            let err = Errors.SUCCESS;
            // TODO
        });
    }

    gameMortageReq(player, game) {
        player.user.socket.on('gameMortageReq', (data) => {
            let err = Errors.SUCCESS;
            // TODO
        });
    }
}

module.exports = Network;
