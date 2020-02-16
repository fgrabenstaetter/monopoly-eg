const Constants = require('../lib/constants');
const Errors = require('../lib/errors');
const Lobby = require('./lobby');

/**
 * Simplifie et centralise toutes les communications socket
 */
class Network {

    /**
     * @param io L'instance globale socket.io du serveur
     * @param users Le tableau global de users du serveur
     * @param lobbies Le tableau global de lobbies du serveur
     * @param games Le tableau global de games du serveur
     * @param matchmaking L'instance globale de matchmaking du serveur
     */
    constructor (io, users, lobbies, games, matchmaking) {
        this.io = io;
        this.users = users;
        this.lobbies = lobbies;
        this.games = games;
        this.matchmaking = matchmaking;
    }

    lobbyUserListen (user, lobby) {
        this.lobbyFriendAcceptInvitation(user, lobby);
        this.lobbyInviteFriend(user, lobby);
        this.lobbyChatMessage(user, lobby);
        this.lobbyChangeTargetUsersNb(user, lobby);
        this.lobbyChangePawn(user, lobby);
        this.lobbyKick(user, lobby);
        this.lobbyPlay(user, lobby);
    }

    lobbyUserStopListening (user) {
        user.socket.off('lobbyFriendAcceptInvitationReq');
        user.socket.off('lobbyInviteFriendReq');
        user.socket.off('lobbyChatMessageReq');
        user.socket.off('lobbyChangeTargetUsersNbReq');
        user.socket.off('lobbyChangePawnReq');
        user.socket.off('lobbyKickReq');
        user.socket.off('lobbyPlayReq');
    }

    gamePlayerListen (player, game) {

    }

    gamePlayerStopListening (player) {

    }

    lobbyFriendAcceptInvitationReq (user, lobby) {
        user.socket.on('lobbyFriendAcceptInvitationReq', (data) => {
            let err = Errors.SUCCESS;
            let friendLobby = null;

            if (!data.invitationID)
                err = Errors.MISSING_FIELD;
            else {
                const invitObj = Lobby.delInvitation(data.invitationID);
                if (!invitObj)
                    err = Errors.NETWORK.INVITATION_NOT_EXISTS;
                else if (invitObj.to !== user.nickname)
                    err = Errors.UNKNOW;
                else {
                    for (const lobby of this.lobbies) {
                        const usr = lobby.userByNickname(invitObj.from);
                        if (usr) {
                            friendLobby = lobby;
                            break;
                        }
                    }

                    if (!friendLobby)
                        err = Errors.NETWORK.LOBY_CLOSED;
                    else if (friendLobby.users.length >= friendLobby.targetUsersNb)
                        err = Errors.NETWORK.LOBBY_FULL;
                }

                if (err.code === Errors.SUCCESS.code) {
                    friendLobby.addUser(user);

                    let messages = [];
                    for (const mess of friendLobby.chat.messages) {
                        messages.push({
                            senderNickname: mess.senderUser.nickname,
                            text: mess.content,
                            createdTime: mess.createdTime
                        });
                    }

                    let users = [];
                    for (let i = 0, l = friendLobby.users.length; i < l; i ++) {
                        users.push({
                            nickname: friendLobby.users[i].nickname,
                            pawn: friendLobby.pawns[i]
                        });
                    }

                    user.socket.emit('lobbyJoinedRes', {
                        targetUsersNb: friendLobby.targetUsersNb,
                        pawn: friendLobby.nextPawn,
                        players: users,
                        messages: messages
                    });

                    // envoyer à tous les users du loby, sauf le nouveau
                    user.socket.broadcast.to(user.room).emit('lobbyPlayerJoinedRes', {
                        nickname: user.nickname,
                        pawn: friendLobby.pawns[friendLobby.users.indexOf(user)]
                    });
                }

                user.socket.emit('lobbyFriendAcceptInvitationRes', { error: err.code, status: err.status });
            }
        });
    }

    lobbyInviteFriendReq (user, lobby) {
        user.socket.on('lobbyInviteFriendReq', (data) => {
            let err = Errors.SUCCESS;
            let friendUser = null;

            if (!data.friendPseudo)
                err = Errors.MISSING_FIELD;
            else if (user.friends.indexOf(data.friendPseudo) === -1)
                err = Errors.FRIEND_NOT_EXISTS;
            else if (lobby.users.length >= lobby.targetUsersNb)
                err = Errors.LOBBY_FULL;
            else {
                for (const user of this.users) {
                    if (user.nickname === friendPseudo) {
                        friendUser = user;
                        break;
                    }
                }

                if (!friendUser)
                    err = Errors.FRIEND_NOT_CONNECTED;
                else {
                    let inGame = false;
                    for (const game of this.games) {
                        for (const player of game) {
                            if (player.user.nickname === data.friendPseudo) {
                                inGame = true;
                                break;
                            }
                        }
                        if (inGame) {
                            err = Errors.FRIEND_IN_GAME;
                            break;
                        }
                    }
                }

                if (err.code === Errors.SUCCESS.code)
                    lobby.addUser(friendUser);

                user.socket.emit('lobbyInviteFriendRes', { error: err.code, status: err.status });
            }
        });
    }

    lobbyChatMessageReq (user, lobby) {
        user.socket.on('lobbyChatMessageReq', (data) => {
            if (!data.text) {
                user.socket.emit('lobbyChatMessageRes', { error: Errors.MISSING_FIELD.code, status: Errors.MISSING_FIELD.status });
                return;
            }

            const mess = chat.addMessage(user, data.text, Constants.CHAT_MESSAGE_TYPE.TEXT);
            // broadcast lobby
            this.io.to(user.room).emit('lobbyChatMessageRes', {
                error: Errors.SUCCESS.code,
                status: Errors.SUCCESS.status,
                senderPseudo: mess.senderUser.nickname,
                text: mess.content,
                createdTime: mess.createdTime
            });
        });
    }

    lobbyKickReq (user, lobby) {
        user.socket.on('lobbyKickReq', (data) => {
            let err = Errors.SUCCESS;
            let userToKick = null;

            if (!data.playerToKickPseudo)
                err = Errors.MISSING_FIELD;
            else {
                const userToKick = lobby.userByNickname(data.playerToKickPseudo);
                if (!userToKick)
                    err = Errors.NETWORK.NOT_IN_LOBBY;
            }

            if (err.code === Errors.SUCCESS.code) {
                this.io.to(userToKick.room).emit('lobbyKickedRes', { nickname: userToKick.nickname });
                lobby.delUser(userToKick);
            }
            user.socket.emit('lobbyKickRes', { error: err.code, status: err.status });
        });
    }

    lobbyChangeTargetUsersNbReq (user, lobby) {
        user.socket.on('lobbyChangeTargetUsersNbReq', (data) => {
            let err = Errors.SUCCESS;
            if (!data.nb)
                err = Errors.MISSING_FIELD;
            else if (lobby.users.indexOf(user) !== 0)
                err = Errors.UNKNOW; // n'est pas l'hôte
            else {
                lobby.changeTargetUsersNb(data.nb);
                this.io.to(user.room).emit('lobbyTargetUsersNbChangedRes', { nb: lobby.targetUsersNb });
            }

            user.socket.emit('lobbyChangeTargetUsersNbRes', { error: err.code, status: err.status });
        });
    }

    lobbyChangePawnReq (user, lobby) {
        user.socket.on('lobbyChangePawnReq', (data) => {
            let err = Errors.SUCCESS;

            if (!data.pawn)
                err = Errors.MISSING_FIELD;
            else if (lobby.pawns.indexOf(data.pawn) !== -1)
                err = Errors.PAWN_ALREADY_USED;
            else {
                lobby.pawns[lobby.users.indexOf(user)] = data.pawn;
                this.io.to(user.room).emit('lobbyPlayerPawnChangedRes', {
                    nickname: user.nickname,
                    pawn: data.pawn
                });
            }

            user.socket.emit('lobbyChangePawnRes', { error: err.code, status: err.status });
        });
    }

    lobbyPlayReq (user, lobby) {
        user.socket.on('lobbyPlayReq', (data) => {
            let err = Errors.SUCCESS;

            if (lobby.users[0] !== user)
                err = Errors.UNKNOW; // n'est pas l'hôte
            else if (lobby.users.length < lobby.targetUsersNb)
                err = Errors.LOBBY_NOT_FULL;

            if (err.code === Errors.SUCCESS.code) {
                this.io.to(user.room).emit('lobbyPlayRes', { error: Errors.SUCCESS.code, status: Errors.SUCCESS.status });
                lobby.searchGame();
            } else
                user.socket.emit('lobbyPlayRes', { error: err.code, status: err.status });
        });
    }
}

module.exports = Network;
