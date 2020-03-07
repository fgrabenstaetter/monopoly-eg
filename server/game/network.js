const Constants = require('../lib/constants');
const Errors    = require('../lib/errors');
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
        this.lobbyInvitationReq          (user, lobby);
        this.lobbyInvitationAcceptReq    (user, lobby);
        this.lobbyKickReq                (user, lobby);

        // Paramètres + Chat
        this.lobbyChangeTargetUsersNbReq (user, lobby);
        this.lobbyChangePawnReq          (user, lobby);
        this.lobbyChatSendReq            (user, lobby);
        this.lobbyPlayReq                (user, lobby);

        // Amis
        // this.lobbyFriendInviteReq(user, lobby);
        // this.lobbyFriendInvitationActionReq(user, lobby);
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
        // user.socket.off('lobbyFriendInviteReq');
        // user.socket.off('lobbyFriendInvitationActionReq');
        // user.socket.off('lobbyFriendDeleteReq');

        user.socket.leave(lobby.name);
    }

    gamePlayerListen (player, game) {
        player.user.socket.join(game.name);

        this.gameReadyReq       (player, game);
        this.gameRollDiceReq    (player, game);
        this.gameTurnEndReq     (player, game);
        this.gameChatSendReq    (player, game);
        this.gameOfferSendReq   (player, game);
        this.gameOfferAcceptReq (player, game);
        this.gameOverbidReq     (player, game);
        this.gameMortageReq     (player, game);
    }

    gamePlayerStopListening (player, game) {
        player.user.socket.off('gameReadyReq');
        player.user.socket.off('gameRollDiceReq');
        player.user.socket.off('gameTurnEndReq');
        player.user.socket.off('gameChatSendReq');
        player.user.socket.off('gameOfferSendReq');
        player.user.socket.off('gameOfferAcceptReq');
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
                        const tmp = game.playerByNickname(data.friendID);
                        if (tmp) {
                            err = Errors.FRIEND_IN_GAME;
                            break;
                        }
                    }
                }

                if (err.code === Errors.SUCCESS.code) {
                    const invitId = lobby.addInvitation(user.nickname, data.friendID);
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
                else if (invitObj.to !== user.nickname)
                    err = Errors.UNKNOW;
                else {
                    for (const lobby of this.GLOBAL.lobbies) {
                        const usr = lobby.userByNickname(invitObj.from);
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
                            const usr = lobby.userByNickname(user);
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
                let players = [], cells = [], properties = [], cards = [], cellsCounter = 0;

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

                // for (const card of game.cards) {
                //     cards.push({
                //         id          : card.id,
                //         type        : card.typeStr,
                //         name        : card.name,
                //         description : card.description
                //     });
                // }

                this.io.to(game.name).emit('gameStartedRes', {
                    gameEndTime : game.forcedEndTime,
                    players     : players,
                    cells       : cells,
                    properties  : properties,
                    cards       : cards
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
