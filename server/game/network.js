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

    userNoLobbyListen (user) {

        // lobbyCreate
        user.socket.on('lobbyCreateReq', (data) => {
            // ne peut échouer ?
            this.lobbies.push(new Lobby(0, this, user, this.matchmaking));
            user.socket.emit('lobbyCreateRes');
        });

        // lobbyFriendAcceptInvitation
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
                        for (const usr of lobby.users) {
                            if (usr.nickname === invitObj.from) {
                                friendLobby = lobby;
                                break;
                            }
                        }
                        if (friendLobby)
                            break;
                    }

                    if (!friendLobby)
                        err = Errors.NETWORK.LOBY_CLOSED;
                    else if (friendLobby.users.length >= friendLobby.maxUsersNb)
                        err = Errors.NETWORK.LOBBY_FULL;
                }

                if (err.code === Errors.SUCCESS.code)
                    friendLobby.addUser(user);
                user.socket.emit('lobbyFriendAcceptInvitationRes', { error: err.code, status: err.status });
            }
        });

    }

    userNoLobbyStopListening (user) {
        user.socket.off('lobbyCreateReq');
        user.socket.off('lobbyFriendAcceptInvitationReq');
    }

    lobbyUserListen (user, lobby) {

        // lobbyInviteFriend
        user.socket.on('lobbyInviteFriendReq', (data) => {
            let err = Errors.SUCCESS;
            let friendUser = null;

            if (!data.friendPseudo)
                err = Errors.MISSING_FIELD;
            else if (user.friends.indexOf(data.friendPseudo) === -1)
                err = Errors.FRIEND_NOT_EXISTS;
            else if (lobby.users.length >= lobby.maxUsersNb)
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

        // lobbyChatMessage
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

        // lobbyKick
        user.socket.on('lobbyKickReq', (data) => {
            let err = Errors.SUCCESS;
            let userToKick = null;

            if (!data.playerToKickPseudo)
                err = Errors.MISSING_FIELD;
            else {
                for (const user of lobby.users) {
                    if (user.nickname === data.playerToKickPseudo) {
                        userToKick = user;
                        break;
                    }
                }
                if (!userToKick)
                    err = Errors.NETWORK.NOT_IN_LOBBY;
            }

            if (err.code === Errors.SUCCESS.code) {
                lobby.delUser(userToKick);
                userToKick.socket.emit('lobbyKickedRes');
            }
            user.socket.emit('lobbyKickRes', { error: err.code, status: err.status });
        });

        // lobbyPlay
        user.socket.on('lobbyPlayReq', (data) => {
            // !!! WARNING data attributs ignoré pour l'instant (provisoire)
            let err = Errors.SUCCESS;

            if (lobby.users[0] !== user)
                err = Errors.UNKNOW;
            else if (lobby.users.length < lobby.targetUsersNb)
                err = Errors.LOBBY_NOT_FULL;

            if (err.code === Errors.SUCCESS.code) {
                lobby.searchGame();
                this.io.to(user.room).emit('lobbyPlayRes', { error: Errors.SUCCESS.code, status: Errors.SUCCESS.status });
            } else
                user.socket.emit('lobbyPlayRes', { error: err.code, status: err.status });
        });
    }

    lobbyStopUserListening (user) {
        user.socket.off('lobbyInviteFriendReq');
        user.socket.off('lobbyChatMessageReq');
        user.socket.off('lobbyKickReq');
        user.socket.off('lobbyPlayReq');
    }

    gamePlayerListen (player, game) {

    }

    gamePlayerStopListening (player) {

    }
}

module.exports = Network;
