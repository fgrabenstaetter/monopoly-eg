const Constants                   = require('../lib/constants');
const Errors                      = require('../lib/errors');
const Offer                       = require('./offer');
const Bid                         = require('./bid');
const { UserSchema, UserManager } = require('../models/user');
const SocketIOFileUpload          = require("socketio-file-upload");
const FileType                    = require('file-type');
const fs                          = require('fs');
const Success                     = require('../lib/success');
const Lobby                       = require('./lobby');
const User                        = require('./user');

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

    handleConnection (user, socket) {
        if (user.socket) {
            // ancien socket toujours connecté, lui signaler
            user.socket.emit('notLoggedRes');
            console.log('[SOCKET] Ancien socket de ' + user.nickname + ' trouvé => envoi de notLoggedRes à ce dernier');
        }

        console.log('[SOCKET] Utilisateur ' + user.nickname + ' connecté');
        user.socket = socket;

        socket.on('disconnect', () => {
            console.log('[SOCKET] Utilisateur ' + user.nickname + ' déconnecté');

            // si il est dans un lobby, l'y supprimer
            for (const lobby of this.GLOBAL.lobbies) {
                if (lobby.userByID(user.id)) {
                    lobby.delUser(user); // il ne sera supprimé que si il n'a pas été invité
                    break;
                }
            }

            // si il est dans une partie de jeu, l'y déconnecter (PAS SUPPRIMER POUR RECONNEXION)
            for (const game of this.GLOBAL.games) {
                const player = game.playerByID(user.id);
                if (player) {
                    this.gamePlayerDisconnected(player, game);
                    break;
                }
            }

            user.socket = null;
        });

        // regarder si le joueur est dans une partie + !hasLeft
        for (const game of this.GLOBAL.games) {
            const player = game.playerByID(user.id);
            if (player && !player.hasLeft) {
                // le joueur est dans une partie !
                if (!player.connected) // RECONNEXION
                    this.gamePlayerReconnected(player, game);
                else // support lobby => jeu avec nouveau socket
                    this.gamePlayerListen(player, game);
                socket.emit('canReconnectToGame');
                return;
            }
        }

        // Mettre le user dans un nouveau Lobby
        this.GLOBAL.lobbies.push(new Lobby(user, this.GLOBAL));
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
        this.lobbyUpdateProfile             (user, lobby);
        this.lobbyChangeTargetUsersNbReq    (user, lobby);
        this.lobbyChangeDurationReq         (user, lobby);
        this.lobbyChatSendReq               (user, lobby);
        this.lobbyPlayReq                   (user, lobby);
        this.lobbyCancelPlayReq             (user, lobby);

        // Amis
        this.lobbyFriendListReq             (user, lobby);
        this.lobbyRequestedFriendListReq    (user, lobby);
        this.lobbyPendingFriendListReq      (user, lobby);
        this.lobbyFriendInvitationSendReq   (user, lobby);
        this.lobbyFriendInvitationActionReq (user, lobby);
        // this.lobbyFriendDeleteReq        (user, lobby);

        // Paramètres + Succès
        this.playerSettingsReq              (user);
        this.playerSuccessReq               (user);
        this.changeAvatarReq                (user);

        user.socket.on('lobbyReadyReq', () => {
            // réponse de création / rejoignage de lobby
            this.lobbyNewUser(user, lobby);
        });
    }

    lobbyUserStopListening(user, lobby) {
        user.socket.leave(lobby.name);

        // Inviter / Rejoindre / Quitter
        user.socket.removeAllListeners('lobbyInvitationReq');
        user.socket.removeAllListeners('lobbyInvitationAcceptReq');
        user.socket.removeAllListeners('lobbyKickReq');

        // Paramètres + Chat
        user.socket.removeAllListeners('lobbyUpdateProfile');
        user.socket.removeAllListeners('lobbyChangeTargetUsersNbReq');
        user.socket.removeAllListeners('lobbyChangeDurationReq');
        user.socket.removeAllListeners('lobbyChatSendReq');
        user.socket.removeAllListeners('lobbyPlayReq');
        user.socket.removeAllListeners('lobbyCancelPlayReq');

        // Amis
        user.socket.removeAllListeners('lobbyFriendListReq');
        user.socket.removeAllListeners('lobbyRequestedFriendListReq');
        user.socket.removeAllListeners('lobbyPendingFriendListReq');
        user.socket.removeAllListeners('lobbyFriendInvitationSendReq');
        user.socket.removeAllListeners('lobbyFriendInvitationActionReq');

        // Paramètres + Succès
        user.socket.removeAllListeners('playerSettingsReq');
        user.socket.removeAllListeners('playerSuccessReq');
        user.socket.removeAllListeners('changeAvatarReq');

        user.socket.removeAllListeners('lobbyReadyReq');
    }

    gamePlayerListen (player, game) {
        player.socket.join(game.name);

        // Début/Fin + tour
        this.gameReadyReq              (player, game);
        this.gameRollDiceReq           (player, game);
        this.gameTurnEndReq            (player, game);

        // Actions de tour asynchrones
        this.gamePropertyBuyReq        (player, game);
        this.gamePropertyUpgradeReq    (player, game);
        this.gamePropertyMortgageReq   (player, game);
        this.gamePropertyUnmortgageReq (player, game);
        this.gamePlayerLeavingReq      (player, game);

        // Chat + offres et enchères
        this.gameChatSendReq           (player, game);
        this.gameOfferSendReq          (player, game);
        this.gameOfferActionReq        (player, game);
        this.gameOverbidReq            (player, game);
        this.gameManualBidReq          (player, game);

        // Paramètres + Succès
        this.playerSettingsReq         (player);
        this.playerSuccessReq          (player);
    }

    gamePlayerStopListening (player, game) {
        player.socket.leave(game.name);

        // Début/Fin + tour
        player.socket.removeAllListeners('gameReadyReq');
        player.socket.removeAllListeners('gameRollDiceReq');
        player.socket.removeAllListeners('gameTurnEndReq');

        // Actions de tour asynchrones
        player.socket.removeAllListeners('gamePropertyBuyReq');
        player.socket.removeAllListeners('gamePropertyUpgradeReq');
        player.socket.removeAllListeners('gamePropertyMortgageReq');
        player.socket.removeAllListeners('gamePlayerLeavingReq');
        player.socket.removeAllListeners('gamePropertyUnmortgageReq');

        // Chat + removeAllListenersres et enchères
        player.socket.removeAllListeners('gameChatSendReq');
        player.socket.removeAllListeners('gameOfferSendReq');
        player.socket.removeAllListeners('gameOfferActionReq');
        player.socket.removeAllListeners('gameOverbidReq');
        player.socket.removeAllListeners('gameManualBidReq');

        // Paramètres + Succès
        player.socket.removeAllListeners('playerSettingsReq');
        player.socket.removeAllListeners('playerSuccessReq');
    }

    //////////////////
    // LOBBY EVENTS //
    //////////////////

    changeAvatarReq (user) {
        var uploader = new SocketIOFileUpload();
        uploader.dir = __dirname + '/../public/avatars';
        uploader.maxFileSize = 1 * 1000000; // 1Mo (taille en bytes)
        uploader.uploadValidator = (event, callback) => {
            if (event.file) {
                event.file.name = `${user.id}.jpg`;
                callback(true);
            } else
                callback(false);
        };

        const currObj = this;
        // Do something when a file is saved:
        uploader.on("saved", function(event){
            (async () => {
                let err = Errors.UPDATE_PROFILE.AVATAR_UNKNOWN;
                try {
                    const imgType = await FileType.fromFile(event.file.pathName);
                    //=> {ext: 'png', mime: 'image/png'}

                    if (imgType.mime === 'image/jpeg') {
                        err = Errors.SUCCESS;
                        fs.rename(event.file.pathName, `${uploader.dir}/${user.id}.jpg`, () => {
                            currObj.io.emit('lobbyUserAvatarUpdatedRes', { id: user.id, path: `/avatars/${user.id}.jpg` });
                        });
                    } else {
                        err = Errors.UPDATE_PROFILE.AVATAR_WRONG_TYPE;
                        fs.unlink(event.file.pathName, () => {
                            user.socket.emit('lobbyUpdateAvatarRes', { error: err.code, status: err.status });
                        });
                    }
                } catch(catchErr) {
                    user.socket.emit('lobbyUpdateAvatarRes', { error: err.code, status: err.status });
                }
            })();
        });

        // A conserver pour "catch" d'éventuelles erreurs
        uploader.on('error', (event) => {
            console.log('upload error', event);
        });

        uploader.listen(user.socket);
    }

    lobbyNewUser(user, lobby) {

        if (lobby.users[0] === user) { // est l'hôte
            user.socket.emit('lobbyCreatedRes', {
                targetUsersNb: lobby.targetUsersNb,
                duration: lobby.gameDuration
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
                id       : usr.id,
                nickname : usr.nickname,
                avatar   : User.getAvatar(user.id)
            });
        }

        user.socket.emit('lobbyJoinedRes', {
            targetUsersNb : lobby.targetUsersNb,
            duration      : lobby.gameDuration,
            users         : users,
            messages      : messages
        });

        // envoyer à tous les users du loby, sauf le nouveau
        for (const usr of lobby.users) {
            if (usr !== user) {
                usr.socket.emit('lobbyUserJoinedRes', {
                    id       : user.id,
                    nickname : user.nickname,
                    avatar   : User.getAvatar(user.id)
                });
            }
        }
    }

    lobbyInvitationReq(user, lobby) {
        user.socket.on('lobbyInvitationReq', (data) => {
            user.getFriends((friends) => {
                let err = Errors.SUCCESS;
                let friendUser = null;

                if (!data || data.friendID == null)
                    err = Errors.MISSING_FIELD;
                else if (friends.indexOf(data.friendID) === -1)
                    err = Errors.FRIENDS.NOT_EXISTS;
                else if (lobby.users.length >= lobby.maxUsersNb)
                    err = Errors.LOBBY.FULL;
                else if (!lobby.open)
                    err = Errors.LOBBY.CLOSED;
                else if (lobby.userByID(data.friendID))
                    err = Errors.FRIENDS.ALREADY_SAME_LOBBY;
                else {
                    for (const user of this.GLOBAL.users) {
                        if (user.id === data.friendID) {
                            friendUser = user;
                            break;
                        }
                    }

                    if (!friendUser || !friendUser.socket) {
                        err = Errors.FRIENDS.NOT_CONNECTED;
                    } else {
                        for (const game of this.GLOBAL.games) {
                            const tmp = game.playerByID(data.friendID);
                            if (tmp && !tmp.hasLeft) {
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

    lobbyInvitationAcceptReq(user, lobby) {
        user.socket.on('lobbyInvitationAcceptReq', (data) => {
            let err = Errors.SUCCESS;
            let friendLobby = null;
            if (data)
                data.invitationID = parseInt(data.invitationID);

            if (!data || isNaN(data.invitationID))
                err = Errors.MISSING_FIELD;
            else {
                const invitObj = lobby.delInvitation(data.invitationID);
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

                    if (!friendLobby || !friendLobby.open)
                        err = Errors.LOBBY.CLOSED;
                    else if (friendLobby.userByID(user.id))
                        err = Errors.LOBBY.ALREADY_IN_FRIEND_LOBBY;
                    else if (friendLobby.users.length >= friendLobby.maxUsersNb)
                        err = Errors.LOBBY.FULL;
                    else {
                        // quitter son lobby
                        for (const lobby of this.GLOBAL.lobbies) {
                            const usr = lobby.userByID(user.id);
                            if (usr) {
                                lobby.delUser(user);
                                this.lobbyUserStopListening(user, lobby);
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

            if (!data || data.userToKickID == null)
                err = Errors.MISSING_FIELD;
            else if (data.userToKickID === user.id)
                err = Errors.UNKNOW;
            else {
                userToKick = lobby.userByID(data.userToKickID);
                if (!userToKick)
                    err = Errors.LOBBY.NOT_IN_LOBBY;
            }

            user.socket.emit('lobbyKickRes', { error: err.code, status: err.status });

            if (err.code === Errors.SUCCESS.code) {
                lobby.delUser(userToKick); // lui envoie l'event socket lobbyUserLeftRes
                // le remettre dans un nouveau lobby solo
                this.GLOBAL.lobbies.push(new Lobby(userToKick, this.GLOBAL));
            }
        });
    }

    lobbyUpdateProfile(user, lobby) {
        user.socket.on('lobbyUpdateProfileReq', (data) => {
            if (!data.nickname || !data.email)
                return;

            if (data.nickname == user.nickname && data.email == user.email && !data.password) {
                user.socket.emit('lobbyUpdateProfileRes', { error: Errors.SUCCESS.code, status: Errors.SUCCESS.status, user: null });
                return;
            }

            UserManager.updateProfile(user.id, data.nickname, data.email, data.password, (err, userUpdated) => {
                user.socket.emit('lobbyUpdateProfileRes', { error: err.code, status: err.status, user: userUpdated });

                if (err == Errors.SUCCESS) {
                    user.nickname = userUpdated.nickname;
                    user.email = userUpdated.email;
                    this.io.emit('lobbyUserNicknameUpdatedRes', { id: userUpdated._id, nickname: userUpdated.nickname });
                }
            });
        });
    }

    lobbyChangeTargetUsersNbReq(user, lobby) {
        user.socket.on('lobbyChangeTargetUsersNbReq', (data) => {
            let err = Errors.SUCCESS;
            if (data)
                data.nb = parseInt(data.nb);

            if (!data || isNaN(data.nb))
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

    lobbyChangeDurationReq (user, lobby) {
        user.socket.on('lobbyChangeDurationReq', (data) => {
            let err = Errors.SUCCESS;
            if (data)
                data.newDuration !== null ? data.newDuration = parseInt(data.newDuration) : null;

            if (!data || isNaN(data.newDuration))
                err = Errors.MISSING_FIELD;
            else if (!lobby.changeDuration(data.newDuration))
                err = Errors.LOBBY.WRONG_DURATION;
            else {
                this.io.to(lobby.name).emit('lobbyDurationChangedRes', {
                    newDuration: data.newDuration
                });
            }

            user.socket.emit('lobbyChangeDurationRes', { error: err.code, status: err.status });
        });
    }

    lobbyChatSendReq(user, lobby) {
        user.socket.on('lobbyChatSendReq', (data) => {
            let err = Errors.SUCCESS;

            if (!data || !data.content)
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
            else if (!lobby.open)
                err = Errors.LOBBY.CLOSED;
            else {
                lobby.searchGame();
                this.io.to(lobby.name).emit('lobbyPlayRes', { error: err.code, status: err.status });
            }

            if (err !== Errors.SUCCESS)
                user.socket.emit('lobbyPlayRes', { error: err.code, status: err.status });
        });
    }

    lobbyCancelPlayReq(user, lobby) {
        user.socket.on('lobbyCancelPlayReq', (data) => {
            let err = Errors.SUCCESS;

            if (!lobby.isHost(user))
                err = Errors.UNKNOW; // n'est pas l'hôte
            else if (this.GLOBAL.matchmaking.queue[lobby.targetUsersNb - 2].indexOf(lobby) === -1)
                err = Errors.LOBBY.NOT_IN_MATCHMAKING;
            else {
                lobby.open = true;
                this.GLOBAL.matchmaking.delLobby(lobby, false);
                this.io.to(lobby.name).emit('lobbyCancelPlayRes', { error: err.code, status: err.status });
            }

            if (err !== Errors.SUCCESS)
                user.socket.emit('lobbyCancelPlayRes', { error: err.code, status: err.status });
        });
    }

    //////////
    // AMIS //
    //////////

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
                    friends.push({
                        id: friendsObj[i].friend._id,
                        nickname: friendsObj[i].friend.nickname,
                        avatar: User.getAvatar(friendsObj[i].friend.id)
                    });
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

                for (let i = 0; i < friendsObj.length; i++)
                    friends.push({ id: friendsObj[i].friend._id, nickname: friendsObj[i].friend.nickname });

                user.socket.emit('lobbyPendingFriendListRes', { friends: friends });
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
                                u.socket.emit('lobbyFriendInvitationAcceptedRes', {
                                    id: user.id,
                                    nickname: user.nickname,
                                    avatar: User.getAvatar(user.id)
                                });
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


    /////////////////
    // GAME EVENTS //
    /////////////////

    gameReadyReq(player, game) {
        player.socket.on('gameReadyReq', () => {
            console.log(' -- READY REQ DE DÉBUT');
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
                let players = [], cells = [], properties = [], taxes = [], cellsCounter = 0;

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
                        propertyID : cell.property ? cell.property.id : null,
                        taxID      : cell.tax ? cell.tax.id : null
                    });

                    if (cell.type === Constants.CELL_TYPE.PROPERTY) {
                        let propertyData = {
                            id          : cell.property.id,
                            type        : cell.property.type,
                            name        : cell.property.name
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

                    } else if (cell.type === Constants.CELL_TYPE.TAX) {
                        taxes.push({
                            id          : cell.tax.id,
                            description : cell.tax.name,
                            money       : cell.tax.money
                        });
                    }
                }

                this.io.to(game.name).emit('gameStartedRes', {
                    gameEndTime    : game.forcedEndTime,
                    duration       : game.maxDuration,
                    playersMoney   : Constants.GAME_PARAM.PLAYER_INITIAL_MONEY,
                    bankMoney      : Constants.GAME_PARAM.BANK_INITIAL_MONEY,
                    moneyFromStart : Constants.GAME_PARAM.GET_MONEY_FROM_START,
                    players        : players,
                    cells          : cells,
                    properties     : properties,
                    taxes          : taxes
                });
            }
        });
    }

    gameRollDiceReq(player, game) {
        player.socket.on('gameRollDiceReq', (data) => {
            let err = Errors.SUCCESS;
            if (player !== game.curPlayer)
                err = Errors.GAME.NOT_MY_TURN;
            else if (game.ended)
                err = Errors.GAME.ENDED;
            else {
                const useExitJailCard = (data && data.useExitJailCard) ? true : false;
                this.gameTurnAction(player, game, useExitJailCard);
            }

            player.socket.emit('gameRollDiceRes', { error: err.code, status: err.status });
        });
    }

    gameTurnEndReq(player, game) {
        player.socket.on('gameTurnEndReq', (data) => {
            let err = Errors.SUCCESS;
            if (player !== game.curPlayer)
                err = Errors.GAME.NOT_MY_TURN;
            else if (game.ended)
                err = Errors.GAME.ENDED;
            else
                game.endTurn();

            player.socket.emit('gameTurnEndRes', { error: err.code, status: err.status });
        });
    }

    // n'est pas une écoute d'event !
    gameTurnAction (player, game, useExitJailCard = false) {
        const nbJailEscapeCardsSave = player.nbJailEscapeCards;
        const cellPosSave = player.cellPos;
        const moneySav = []; // sauvegarder l'argent des joueurs avant rollDice()
        const wasInPrison = player.isInPrison;
        for (const playr of game.players)
            moneySav.push(playr.money);

        const diceRes = game.rollDice(useExitJailCard);

        if (!diceRes) {
            player.socket.emit('gameRollDiceRes', { error: Errors.UNKNOW.code, status: Errors.UNKNOW.status });
            return;
        }

        // cellPosTmp + cartes chance/communauté
        const extra             =  {};
        const tmpCellPos        =  (cellPosSave + diceRes[0] + diceRes[1]) % 40;

        const tmpCell           =  game.cells[tmpCellPos];
        const tmpCellIsCard     =  [Constants.CELL_TYPE.CHANCE, Constants.CELL_TYPE.COMMUNITY].indexOf(tmpCell.type) !== -1;
        const camePrisonShould  =  tmpCellIsCard || tmpCell.type === Constants.CELL_TYPE.GOPRISON;

        const useTmpCell        =  ( (!player.isInPrison || (camePrisonShould && !wasInPrison && player.isInPrison) )
                                    && player.cellPos !== tmpCellPos) ? true : false;

        const cellToProcess     = useTmpCell ? tmpCell : game.curCell;

        if (tmpCellIsCard) {
            // carte chance / communauté à ajouter à la réponse socket
            if (cellToProcess.type === Constants.CELL_TYPE.CHANCE) {
                const drawnCards = game.chanceDeck.drawnCards;
                const cardToSend = drawnCards[drawnCards.length - 1];
                extra.newCard = {
                    type: 'chance',
                    description: cardToSend.description
                }

            } else if (cellToProcess.type === Constants.CELL_TYPE.COMMUNITY) {
                const drawnCards = game.communityChestDeck.drawnCards;
                const cardToSend = drawnCards[drawnCards.length - 1];
                extra.newCard = {
                    type: 'community',
                    description: cardToSend.description
                }
            }

            if (useTmpCell && !player.isInPrison) {
                // exécuter le nécéssaire pour la case sur laquelle on a été deplacé
                game.makeTurnAfterMove(diceRes, player, tmpCellPos);
            }
        }

        // calcul les modifs
        let updateMoneyList = [];
        for (let i = 0; i < game.players.length; i ++) {
            if (moneySav.length > i && game.players[i].money !== moneySav[i])
                updateMoneyList.push({ playerID: game.players[i].id, money: game.players[i].money });
        }

        if (nbJailEscapeCardsSave !== player.nbJailEscapeCards)
            extra.nbJailEscapeCards = player.nbJailEscapeCards;

        if (!wasInPrison && player.isInPrison)
            extra.goJail = true;

        if (player.cellPos < cellPosSave && !player.isInPrison)
            extra.gainMoneyFromStart = true;

        const res = {
            dicesRes         : diceRes,
            playerID         : player.id,
            cellPosTmp       : useTmpCell ? tmpCellPos : null,
            cellPos          : player.cellPos,
            turnEndTime      : game.turnData.endTime,
            actionMessage    : game.turnData.actionMessage,
            asyncRequestType : game.turnData.asyncRequestType,
            asyncRequestArgs : game.turnData.asyncRequestArgs,
            updateMoney      : updateMoneyList,
            extra            : extra
        }

        this.io.to(game.name).emit('gameActionRes', res);
        game.networkLastGameActionRes = res;
    }

    gamePropertyBuyReq(player, game) {
        player.socket.on('gamePropertyBuyReq', (data) => {
            let err = Errors.SUCCESS;
            let propertyID;

            if (player !== game.curPlayer)
                err = Errors.GAME.NOT_MY_TURN;
            else {
                switch (game.asyncActionBuyProperty()) {
                    case 1: err = Errors.UNKNOW;                     break ;
                    case 2: err = Errors.GAME.PROPERTY_ALREADY_SOLD; break ;
                    case 3: err = Errors.GAME.NOT_ENOUGH_FOR_BUY;    break ;
                }
            }

            if (err === Errors.SUCCESS) {
                this.io.to(game.name).emit('gamePropertyBuyRes', {
                    propertyID  : game.curCell.property.id,
                    playerID    : player.id,
                    playerMoney : player.money,
                    bankMoney   : game.bank.money
                });
            } else
                player.socket.emit('gamePropertyBuyRes', { error: err.code, status: err.status });
        });
    }

    gamePropertyUpgradeReq(player, game) {
        player.socket.on('gamePropertyUpgradeReq', (data) => {
            let err = Errors.SUCCESS;

            if (!data || !data.list)
                err = Errors.MISSING_FIELD;
            else if (player !== game.curPlayer)
                err = Errors.GAME.NOT_MY_TURN;
            else {
                switch (game.asyncActionUpgradeProperty(data.list)) {
                    case 1: err = Errors.UNKNOW;                          break ;
                    case 2: err = Errors.GAME.UPGRADE_INVALID_PROPERTY;   break ;
                    case 3: err = Errors.GAME.UPGRADE_NOT_ENOUGH_MONEY;   break ;
                    case 4: err = Errors.GAME.UPGRADE_NOT_MONOPOLY;       break ;
                    case 5: err = Errors.GAME.UPGRADE_PROPERTY_MORTGAGED; break ;
                }
            }

            if (err === Errors.SUCCESS) {
                this.io.to(game.name).emit('gamePropertyUpgradedRes', {
                    playerID    : player.id,
                    playerMoney : player.money,
                    bankMoney   : game.bank.money,
                    list        : data.list
                });
            }

            player.socket.emit('gamePropertyUpgradeRes', { error: err.code, status: err.status });
        });
    }

    gamePropertyMortgageReq(player, game) {
        player.socket.on('gamePropertyMortgageReq', (data) => {
            let err = Errors.SUCCESS;
            let propertyID;

            if (!data || !data.properties)
                err = Errors.MISSING_FIELD;
            else if (player !== game.curPlayer)
                err = Errors.GAME.NOT_MY_TURN;
            else {
                for (const id of data.properties) {
                    const prop = player.propertyByID(id);
                    if (!prop)
                        err = Errors.UNKNOW;
                    else if (prop.isMortgaged)
                        err = Errors.GAME.PROPERTY_IS_MORTGAGED;

                    if (err !== Errors.SUCCESS)
                        break;
                }

                if (err === Errors.SUCCESS && !game.asyncActionManualMortgage(data.properties)) // hypothécation ici
                    err = Errors.UNKNOW;
            }

            player.socket.emit('gamePropertyMortgageRes', { error: err.code, status: err.status });
        });
    }

    gamePropertyUnmortgageReq(player, game) {
        player.socket.on('gamePropertyUnmortgageReq', (data) => {
            let err = Errors.SUCCESS, prop;
            if (data)
                data.propertyID = parseInt(data.propertyID);

            if (!data || isNaN(data.propertyID))
                err = Errors.MISSING_FIELD;
            else if (player !== game.curPlayer)
                err = Errors.GAME.NOT_MY_TURN;
            else if (!(prop = player.propertyByID(data.propertyID))) // hypothécation ici
                err = Errors.UNKNOW;
            else if (!prop.isMortgaged)
                err = Errors.GAME.NOT_MORTGAGED;
            else if (player.money < prop.unmortgagePrice)
                err = Errors.GAME.NOT_ENOUGH_FOR_UNMORTGAGE;
            else if (!prop.unmortage(game))
                err = Errors.UNKNOW;
            else { // succès
                this.io.to(game.name).emit('gamePropertyUnmortgagedRes', {
                    playerID    : player.id,
                    propertyID  : data.propertyID,
                    playerMoney : player.money,
                    bankMoney   : game.bank.money
                });
            }

            player.socket.emit('gamePropertyUnmortgageRes', { error: err.code, status: err.status });
        });
    }

    gameChatSendReq(player, game) {
        player.socket.on('gameChatSendReq', (data) => {
            let err = Errors.SUCCESS;

            if (!data || !data.text)
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
            if (data) {
                data.price = parseInt(data.price);
                data.propertyID = parseInt(data.propertyID);
            }

            let err = Errors.SUCCESS, recvr, prop;
            if (!data || data.receiverID == null || isNaN(data.price) || isNaN(data.propertyID))
                err = Errors.MISSING_FIELD;
            else if (!(recvr = game.playerByID(data.receiverID)) ||
                     (data.propertyID === -1 && recvr.nbJailEscapeCards === 0) ||
                     (data.propertyID >= 0 && !(prop = recvr.propertyByID(data.propertyID))))
                err = Errors.UNKNOW;
            else if (data.price > player.money)
                err = Errors.GAME.NOT_ENOUGH_FOR_OFFER;
            else if (recvr.failure)
                err = Errors.GAME.PLAYER_IN_FAILURE;
            else if (!Offer.canSend(player, recvr, game))
                err = Errors.GAME.OFFER_LIMIT_REACHED;
            else {
                const offer = new Offer(game, player, recvr, prop, data.price);
                this.io.to(game.name).emit('gameOfferReceiveRes', {
                    receiverID : offer.receiver.id,
                    offerID    : offer.id,
                    price      : offer.amount,
                    propertyID : offer.property ? offer.property.id : -1,
                    makerID    : offer.maker.id
                });
            }

            player.socket.emit('gameOfferSendRes', { error: err.code, status: err.status });
        });
    }

    gameOfferActionReq(player, game) {
        player.socket.on('gameOfferActionReq', (data) => {
            let err = Errors.SUCCESS, offer;
            if (data)
                data.offerID = parseInt(data.offerID);

            if (!data || isNaN(data.offerID) || data.accept == null)
                err = Errors.MISSING_FIELD;
            else if (player.failure)
                err = Errors.GAME.PLAYER_IN_FAILURE;
            else if (!(offer = Offer.offerByID(game, data.offerID)) || offer.receiver !== player)
                err = Errors.UNKNOW;
            else if (offer.maker.money < offer.amount)
                err = Errors.GAME.NOT_ENOUGH_FOR_OFFER;
            else if ((data.accept && !offer.accept()) || (!data.accept && !offer.expired())) // res envoyé si succès
                err = Errors.UNKNOW;

            player.socket.emit('gameOfferActionRes', { error: err.code, status: err.status });
        });
    }

    gameOverbidReq(player, game) {
        player.socket.on('gameOverbidReq', (data) => {
            if (data) {
                data.price = parseInt(data.price);
                data.bidID = parseInt(data.bidID);
            }

            let err = Errors.SUCCESS;
            if (!data || isNaN(data.price) || isNaN(data.bidID))
                err = Errors.MISSING_FIELD;
            else if (player.failure)
                err = Errors.GAME.PLAYER_IN_FAILURE;
            else if (player.money < data.price)
                err = Errors.BID.NOT_ENOUGH_MONEY;
            else {
                const bid = Bid.bidByID(game, data.bidID);
                if (!bid)
                    err = Errors.BID.ENDED;
                else if (bid.initialPropertyOwner && bid.initialPropertyOwner === player)
                    err = Errors.BID.CANNOT_OVERBID_MY;
                else {
                    if (!bid.updateBid(player, data.price))
                        err = Errors.UNKNOW;
                    else {
                        this.io.to(game.name).emit('gameBidRes', {
                            bidID           : bid.id,
                            propertyID      : bid.property.id,
                            propertyOwnerID : bid.property.owner ? bid.property.owner.id : null,
                            playerID        : player.id,
                            text            : bid.text,
                            price           : data.price
                        });
                    }
                }
            }

            player.socket.emit('gameOverbidRes', {error: err.code, status: err.status});
        });
    }

    gameManualBidReq (player, game) {
        player.socket.on('gameManualBidReq', (data) => {
            let err = Errors.SUCCESS, prop;
            if (data) {
                data.initialPrice = parseInt(data.initialPrice);
                data.propertyID = parseInt(data.propertyID);
            }

            if (!data || isNaN(data.initialPrice) || isNaN(data.propertyID))
                err = Errors.MISSING_FIELD;
            else if (player.failure)
                err = Errors.GAME.PLAYER_IN_FAILURE;
            else if (game.alreadyOneManualBid)
                err = Errors.BID.ONE_MANUAL_MAX;
            else if (!(prop = player.propertyByID(data.propertyID)))
                err = Errors.UNKNOW;
            else if (prop.isMortgaged)
                err = Errors.GAME.PROPERTY_IS_MORTGAGED;
            else {
                new Bid(prop, data.initialPrice, game, true);
                // réponse envoyée depuis le constructeur de Bid
            }

            player.socket.emit('gameManualBidRes', { error: err.code, status: err.status });
        });
    }

    gamePlayerLeavingReq (player, game) {
        player.socket.on('gamePlayerLeavingReq', (data) => {
            let err = Errors.SUCCESS;
            game.playerFailure(player);
            player.hasLeft = true;

            player.socket.emit('gamePlayerLeavingRes', { error: err.code, status: err.status });
            this.io.to(game.name).emit('gamePlayerHasLeftRes', {
                playerID: player.id
            });

            let nbPlayersLeft = 0;
            for (const player of game.players) {
                if (player.hasLeft)
                    nbPlayersLeft++;
            }
            if (nbPlayersLeft === game.players.length)
                game.delete();
        });
    }

    // UTILIES METHODS

    gamePlayerDisconnected (player, game) {
        if (!game.allPlayersReady)
            return;

        console.log(player.nickname + ' s\'est déconnecté du jeu !');
        player.connected = false;
        this.io.to(game.name).emit('gamePlayerDisconnectedRes', { playerID: player.id });
    }

    gamePlayerReconnected (player, game) {
        if (!game.allPlayersReady)
            return;

        const oldSock = player.socket;

        setTimeout( () => {
            if (player.socket !== oldSock || !player.socket.connected) {
                console.log('Reconnexion au jeu trop rapide, déconnexion du socket')
                player.socket.disconnect();
                return;
            }

            console.log(player.nickname + ' s\'est reconnecté au jeu !');
            player.connected = true;
            this.gamePlayerListen(player, game);
            player.socket.broadcast.to(game.name).emit('gamePlayerReconnectedRes', { playerID: player.id });
        }, 400);


        player.socket.on('gameReadyReq', () => {
            console.log(' -- READY REQ DE RECONNEXION');
            let players = [], cells = [], properties = [], chatMessages = [], bids = [], offers = [], cellsCounter = 0;

            for (const player of game.players) {
                let playerProperties = [];
                for (const prop of player.properties)
                    playerProperties.push(prop.id);

                players.push({
                    nickname          : player.nickname,
                    id                : player.id,
                    pawn              : player.pawn,
                    money             : player.money,
                    properties        : playerProperties,
                    nbJailEscapeCards : player.nbJailEscapeCards,
                    cellPos           : player.cellPos,
                    connected         : player.connected,
                    failure           : player.failure,
                    hasLeft           : player.hasLeft,
                    isInJail          : player.isInPrison ? 4 - player.remainingTurnsInJail : false
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
                        description : cell.property.description,
                        isMortgaged : cell.property.isMortgaged
                    };

                    switch (cell.property.type) {
                        case Constants.PROPERTY_TYPE.STREET:
                            propertyData.color        = cell.property.color;
                            propertyData.prices       = cell.property.prices;
                            propertyData.rentalPrices = cell.property.rentalPrices;
                            propertyData.level        = cell.property.curUpgradeLevel;
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

            // messages de chat
            for (const mess of game.chat.messages) {
                chatMessages.push({
                    playerID    : mess.sender ? mess.sender.id : -1,
                    text        : mess.text,
                    createdTime : mess.createdTime
                });
            }

            for (const bid of game.bids) {
                bids.push({
                    bidID    : bid.id,
                    playerID : bid.player ? bid.player.id : null,
                    text     : bid.text,
                    price    : bid.amountAsked
                });
            }

            for (const offer of game.offers) {
                offers.push({
                    offerID    : offer.id,
                    makerID    : offer.maker.id,
                    receiverID : offer.receiver.id,
                    propertyID : offer.property.id,
                    price      : offer.amount
                });
            }

            // infos de reconnexion au joueur
            player.socket.emit('gameReconnectionRes', {
                gameEndTime    : game.forcedEndTime,
                duration       : game.maxDuration,
                bankMoney      : game.bank.money,
                chatMessages   : chatMessages,
                moneyFromStart : Constants.GAME_PARAM.GET_MONEY_FROM_START,
                offers         : offers,
                bids           : bids,
                players        : players,
                cells          : cells,
                properties     : properties
            });

            if (game.startedTime) { // partie commencée
                if (game.networkLastGameActionRes) // il y a déjà eu une action de tour
                    player.socket.emit('gameActionRes', game.networkLastGameActionRes);

                if (game.curPlayer === player) {
                    player.socket.emit('gameTurnRes', {
                        playerID         : game.curPlayer.id,
                        turnEndTime      : game.turnData.endTime,
                        canRollDiceAgain : game.canRollDiceAgain
                    });
                }
            }
        });
    }

    // Settings
    playerSettingsReq (user) {
        user.socket.on('playerSettingsReq', (data) => {
            if (typeof data.graphicsQuality === 'undefined' || typeof data.autoZoom === 'undefined'
                || typeof data.musicLevel === 'undefined' || typeof data.sfxLevel === 'undefined')
                return;

            UserSchema.findById(user.id, (error, userMongo) => {
                if (error || !userMongo)
                    return;

                let gQuality = parseInt(data.graphicsQuality);
                gQuality = ([0,1,2].includes(gQuality)) ? gQuality : 1;
                userMongo.settings.graphicsQuality = gQuality;

                userMongo.settings.autoZoom = Boolean(data.autoZoom);

                let musicLevel = parseInt(data.musicLevel);
                musicLevel = (musicLevel >= 0 && musicLevel <= 100) ? musicLevel : 100;
                userMongo.settings.musicLevel = musicLevel;

                let sfxLevel = parseInt(data.sfxLevel);
                sfxLevel = (sfxLevel >= 0 && sfxLevel <= 100) ? sfxLevel : 100;
                userMongo.settings.sfxLevel = sfxLevel;

                userMongo.save((err) => {
                    return;
                });
            });
        });

    }

    // Success
    playerSuccessReq (user) {
        user.socket.on('playerSuccessReq', () => {
            UserSchema.findById(user.id, (err, usr) => {
                if (err || !usr)
                    return;
                let res = [];
                for (const succ of Success) {
                    const obj = {
                        description : succ.description,
                        difficulty  : succ.difficulty,
                        exp         : succ.exp,
                        completed   : usr.success.indexOf(succ.id) !== -1 ? true : false
                    }
                }

                user.socket.emit('playerSuccessRes', { success: res });
            });
        });
    }
}

module.exports = Network;
