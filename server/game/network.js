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
        //

        // réponse de création / rejoignage de lobby
        this.lobbyNewUser(user, lobby);
    }

    lobbyUserStopListening (user) {
        user.socket.off('lobbyInvitationReq');
        user.socket.off('lobbyInvitationAcceptReq');
        user.socket.off('lobbyKickReq');

        user.socket.off('lobbyChangeTargetUsersNbReq');
        user.socket.off('lobbyChangePawnReq');
        user.socket.off('lobbyChatSendReq');
        user.socket.off('lobbyPlayReq');
    }

    gamePlayerListen (player, game) {

    }

    gamePlayerStopListening (player) {

    }

    lobbyNewUser (user, lobby) {

        if (lobby.users[0] === user) { // est l'hôte
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
                senderNickname: mess.senderUser.nickname,
                text: mess.content,
                createdTime: mess.createdTime
            });
        }

        let users = [];
        for (const usr of lobby.users) {
            users.push({
                nickname: usr.nickname,
                pawn: lobby.userPawn(usr)
            });
        }

        user.socket.emit('lobbyJoinedRes', {
            targetUsersNb: lobby.targetUsersNb,
            pawn: lobby.userPawn(user),
            players: users,
            messages: messages
        });

        // envoyer à tous les users du loby, sauf le nouveau
        user.socket.broadcast.to(lobby.name).emit('lobbyPlayerJoinedRes', {
            nickname: user.nickname,
            pawn: lobby.pawns[lobby.users.indexOf(user)]
        });
    }

    lobbyInvitationReq (user, lobby) {
        user.socket.on('lobbyInvitationReq', (data) => {
            let err = Errors.SUCCESS;
            let friendUser = null;

            if (!data.friendNickname)
                err = Errors.MISSING_FIELD;
            else if (user.friends.indexOf(data.friendNickname) === -1)
                err = Errors.FRIEND_NOT_EXISTS;
            else if (lobby.users.length >= lobby.targetUsersNb)
                err = Errors.LOBBY_FULL;
            else {
                for (const user of this.users) {
                    if (user.nickname === data.friendNickname) {
                        friendUser = user;
                        break;
                    }
                }

                if (!friendUser)
                    err = Errors.FRIEND_NOT_CONNECTED;
                else {
                    for (const game of this.games) {
                        const tmp = game.playerByNickname(data.friendNickname);
                        if (tmp) {
                            err = Errors.FRIEND_IN_GAME;
                            break;
                        }
                    }
                }

                if (err.code === Errors.SUCCESS.code) {
                    const invitId = lobby.addInvitation(user.nickname, data.friendNickname);
                    friendUser.socket.emit('lobbyInvitationReceivedRes', {
                        invitationID: invitId,
                        senderFriendNickname: user.nickname,
                        nbUsersInLobby: lobby.users.length
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
                    else {
                        // ferme le lobby de user
                        for (const lobby of this.lobbies) {
                            const usr = lobby.userByNickname(user);
                            if (usr) {
                                lobby.delete();
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

            if (!data.userToKickNickname)
                err = Errors.MISSING_FIELD;
            else {
                const userToKick = lobby.userByNickname(data.playerToKickPseudo);
                if (!userToKick)
                    err = Errors.NETWORK.NOT_IN_LOBBY;
            }

            if (err.code === Errors.SUCCESS.code) {
                this.io.to(userToKick.room).emit('lobbyUserLeftRes', {
                    nickname: userToKick.nickname,
                    host: lobby.users[0].nickname
                });
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
                err = Errors.PAWN_ALREADY_USED;
            else {
                this.io.to(lobby.name).emit('lobbyPlayerPawnChangedRes', {
                    nickname: user.nickname,
                    pawn: data.pawn
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
                // broadcast lobby
                user.socket.to(lobby.name).emit('lobbyChatReceiveRes', {
                    sender: mess.senderUser.nickname,
                    content: mess.content,
                    createdTime: mess.createdTime
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
                err = Errors.LOBBY_NOT_FULL;

            if (err.code === Errors.SUCCESS.code) {
                this.io.to(lobby.name).emit('lobbyPlayRes', { error: Errors.SUCCESS.code, status: Errors.SUCCESS.status });
                lobby.searchGame();
            } else
                user.socket.emit('lobbyPlayRes', { error: err.code, status: err.status });
        });
    }
}

module.exports = Network;
