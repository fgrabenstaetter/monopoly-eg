<template>
  <div class="lobby">
        <div class="background-container"></div>
        <div class="lobby-ui-container">
            <div class="container">
                <div class="row">
                    <div class="col">
                        <i class="logout-btn fas fa-sign-out-alt" title="Déconnexion"></i>
                    </div>
                </div>
                <div class="row">
                    <div class="col-md-3">
                        <div class="card box friendlist">
                            <div class="card-header">
                                AMIS <i class="fas fa-user-plus float-right mt-1" style="cursor:pointer;" data-toggle="modal" data-target="#addFriendModal" title="Ajouter un nouvel ami"></i>
                            </div>
                            <div class="card-body">
                                <div class="form-group">
                                    <input type="text" class="form-control" id="friendBar" placeholder="Rechercher un ami...">
                                    <i class="fa fa-search"></i>
                                </div>
                                <div class="friends-entries-container">
                                    <div v-for="friend in friendsInvitations" :key="friend.id" class="friend-request">
                                        <div class="friend-request-text">
                                            <span>{{friend.nickname}}</span> souhaite vous ajouter à sa liste d'amis
                                        </div>
                                        <div v-on:click="acceptFriendInvitation(friend.id, friend.nickname)" class="accept-button">accepter</div>
                                        <div v-on:click="rejectFriendInvitation(friend.id, friend.nickname)" class="deny-button">refuser</div>
                                    </div>
                                    <div id="friendList">
                                        <div v-for="friend in friends" :key="friend.id" class="friend-entry">
                                            <img class="friends-avatar" :src="friend.avatar" data-toggle="modal" data-target="#` + name + `Modal" />
                                            <div class="friends-name">{{friend.nickname}}</div>
                                            <div class="friend-action" v-on:click="inviteFriendInLobby(friend.id)">inviter</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-6">
                        <div class="card box grouplist">
                            <div class="card-header">
                                MON GROUPE
                            </div>
                            <div class="card-body">
                                <div class="group-entries-container">
                                    <div v-for="player in players" :key="player.id" class="group-entry" :class="{'leader': player.id==hostID}">
                                        <img class="friends-avatar" :src="player.avatar">
                                        <div class="friends-name">{{player.nickname}}</div>
                                        <div v-if="loggedUser.id == hostID && player.id != loggedUser.id" class="friend-action" v-on:click="kickPlayerFromLobby(player.id)"><i class="fas fa-times"></i></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-3">
                        <div class="card box grouplist">
                            <div class="card-header">
                                PARAMÈTRES
                            </div>
                            <div class="card-body pl-3 pr-3 pt-3 pb-3">
                                <div class="game-time-container">
                                    <div class="game-time-selector">
                                        <button class="arrow-left" v-on:click="leftGameTimeClick"></button>
                                        <div id="gameTime">{{gameTime}}</div>
                                        <button class="arrow-right" v-on:click="rightGameTimeClick"></button>
                                    </div>
                                </div>
                                <div class="nb-joueurs-container">
                                    <div class="nb-joueurs-selector">
                                        <button v-if="leftNbJ" class="arrow-left" v-on:click="leftNbJClick"></button>
                                        <div id="nbJoueurs">{{nbPlayers}}</div>
                                        <button v-if="rightNbJ" class="arrow-right" v-on:click="rightNbJClick"></button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="container">
                <div class="row">
                    <div class="col-md-4">
                        <chat-io v-bind:socket="socket"></chat-io>
                    </div>
                    <div class="col-md-8 text-right play-button-container">
                        <a class="btn btn-primary stylized play-button" :class="{'disabled': playBtn.disabled}" v-on:click="play">{{playBtn.text}}</a>
                    </div>
                    <div class="col-md-4 notification-container" id="inviteGameContainer">
                        <div v-for="invitation in lobbyInvitations" :key="invitation.id" class="card notification lobby-invitation" :id="invitation.id">
                            <div class="card-header">
                                INVITATION
                            </div>
                            <div class="card-body">
                                <p class="card-text">{{invitation.friendNickname}} vous invite à rejoindre sa partie</p>
                                <button class="btn btn-primary" v-on:click="acceptLobbyInvitation(invitation.id)">ACCEPTER</button>
                                <button class="btn btn-secondary" v-on:click="rejectLobbyInvitation(invitation.id)">REFUSER</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- Edition du profil -->
            <div class="modal" id="userSettingsModal" tabindex="-1" role="dialog" aria-hidden="true">
                <div class="modal-dialog animated bounceIn" role="document">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">Édition du profil</h5>
                            <button type="button" class="close" data-dismiss="modal" aria-label="Close" style="cursor: pointer;">
                                <span aria-hidden="true" style="cursor: pointer;">&times;</span>
                            </button>
                        </div>
                        <div class="modal-body">
                            <form id="user-settings" class="text-left">
                                <div class="form-group">
                                    <label>Pseudo</label>
                                    <input type="text" class="form-control" name="nickname" autocomplete="off" required>
                                </div>
                                <div class="form-group">
                                    <label>Adresse email</label>
                                    <input type="email" class="form-control" name="email" autocomplete="off" required>
                                </div>
                                <div class="form-group">
                                    <label>Nouveau mot de passe</label>
                                    <input type="password" class="form-control" name="password" autocomplete="off">
                                </div>
                                <div class="form-group">
                                    <label for="avatar">Avatar <small>(JPG, Max 1Mo, format carré de préférence)</small></label>
                                    <input type="file" class="form-control-file" id="avatar">
                                </div>
                                <button type="submit" class="btn btn-primary">Enregistrer</button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- Ajouter un ami -->
            <div class="modal" id="addFriendModal" tabindex="-1" role="dialog" aria-hidden="true">
                <div class="modal-dialog animated bounceIn" role="document">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">Ajouter un ami</h5>
                            <button type="button" class="close" data-dismiss="modal" aria-label="Close" style="cursor: pointer;">
                                <span aria-hidden="true" style="cursor: pointer;">&times;</span>
                            </button>
                        </div>
                        <div class="modal-body">
                            <form @submit.prevent="addFriend">
                                <div class="form-group">
                                    <input v-model="addFriendForm.nickname" type="text" class="form-control" placeholder="Pseudo..." autocomplete="off" required>
                                </div>
                                <button type="submit" class="btn btn-primary">Ajouter</button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- Modal -->
            <div class="modal-container" id="modal">
                <!--<div class="modal fade" id="Unknown67Modal" tabindex="-1" role="dialog" aria-labelledby="Unknown67ModalLabel" aria-hidden="true" data-id="1">
                    <div class="modal-dialog" role="document">
                        <div class="modal-content">
                            <div class="modal-header">
                                <h5 class="modal-title" id="Unknown67ModalLabel">Unknown67</h5>
                                <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                                    <span aria-hidden="true">&times;</span>
                                </button>
                            </div>
                            <div class="modal-body">
                                <button class="btn btn-danger delete-friend-button" data-id="1">supprimer</button>
                            </div>
                            <div class="modal-footer">
                                <button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button>
                                <button type="button" class="btn btn-primary">Save changes</button>
                            </div>
                        </div>
                    </div>
                </div>-->
            </div>
            
        </div>
        <div class="profile-overlay-container">
            <div class="profile-row">
                <div class="username" data-id="">{{loggedUser.nickname}}</div>
                <i style="display: none;color: #fff;cursor:pointer;" id="open-user-settings" class="fa fa-pen" data-toggle="modal" data-target="#userSettingsModal"></i>
                <img class="user-avatar" data-id="" :src="loggedUser.avatar">
                <i class="fa fa-cog open-settings ml-2" aria-hidden="true" data-toggle="modal" data-target="#optionsModal"></i>
            </div>
        </div>

        <!-- Game settings modal -->
        <game-settings-modal :socket="socket" :loggedUser="loggedUser" env="lobby"></game-settings-modal>
    </div>
</template>

<script>
import io from 'socket.io-client';
import ChatIO from '../components/ChatIO';
import GameSettingsModal from '../components/GameSettingsModal';

export default {
    name: 'Lobby',
    components: {
        'chat-io': ChatIO,
        'game-settings-modal': GameSettingsModal
    },
    data() {
        return {
            loggedUser: this.$store.getters.loggedUser,
            socket: io.connect(this.$store.getters.serverUrl, {
                        query: 'token=' + this.$store.getters.jwt,
                        path: '/socket.io',
                        secure: true
                    }),
            playBtn: {
                text: "JOUER!",
                loading: false,
                disabled: true
            },
            addFriendForm: {
                nickname: ""
            },
            players: [],
            friends: [],
            friendsInvitations: [],
            hostID: null,
            leftNbJ: false,
            rightNbJ: false,
            gameTime: 'Illimité',
            nbPlayers: 0,
            lobbyInvitations: []
        }
    },
    methods: {
        play() {
            if (this.hostID === this.loggedUser.id) {
                this.socket.emit('lobbyPlayReq');
                this.playBtn.loading = true;
                this.playBtn.text = "CHARGEMENT...";
            }
        },
        nickToId(nick) {
            for (const row of this.players) {
                if (row.nickname === nick)
                    return row.id;
            }
        },
        idToNick(id) {
            for (const row of this.players) {
                if (row.id === id)
                    return row.nickname;
            }
        },
        leftNbJClick() {
            if (this.hostID === this.loggedUser.id
                && this.nbPlayers > 2 && this.nbPlayers > this.players.length) {
                this.nbPlayers--;
                this.socket.emit('lobbyChangeTargetUsersNbReq', { nb: this.nbPlayers });
                
                if (this.nbPlayers === 2) {
                    this.leftNbJ = false;
                }
            }
        },
        rightNbJClick() {
            if (this.hostID === this.loggedUser.id && this.nbPlayers < 8) {
                this.nbPlayers++;
                this.socket.emit('lobbyChangeTargetUsersNbReq', { nb: this.nbPlayers });

                if (this.nbPlayers > 2) {
                    this.leftNbJ = true;
                }
            }
        },
        leftGameTimeClick() {
            if (this.gameTime === '1 h')
                this.gameTime = '30 min'
            else if (this.gameTime === 'Illimité')
                this.gameTime = '1 h';
            console.log('SOCKET GAMETIME');
        },
        rightGameTimeClick() {
            if (this.gameTime === '1 h')
                this.gameTime = 'Illimité';
            else if (this.gameTime === '30 min')
                this.gameTime = '1 h';
            console.log('SOCKET GAMETIME');
        },
        deleteLobbyInvitation(id) {
            for (const i in this.lobbyInvitations) {
                if (this.lobbyInvitations[i].id === id) {
                    this.lobbyInvitations.splice(i, 1);
                }
            }
        },
        acceptLobbyInvitation(id) {
            console.log("acceptLobbyInvitation " + id);
            this.socket.emit("lobbyInvitationAcceptReq", { invitationID: id });
            this.deleteLobbyInvitation(id);
        },
        rejectLobbyInvitation(id) {
            this.deleteLobbyInvitation(id);
        },
        addFriend() {
            if (this.addFriendForm.nickname !== '') {
                this.socket.emit('lobbyFriendInvitationSendReq', { nickname: this.addFriendForm.nickname });
                this.addFriendForm.nickname = '';
            }
        },
        deleteFriendInvitation(friendId) {
            for (const i in this.friendsInvitations) {
                if (this.friendsInvitations[i].id === friendId) {
                    this.friendsInvitations.splice(i, 1);
                }
            }
        },
        acceptFriendInvitation(friendId, nickname) {
            this.socket.emit('lobbyFriendInvitationActionReq', { action: 1, nickname: nickname });
            this.deleteFriendInvitation(friendId);
            this.socket.emit('lobbyFriendListReq');
        },
        rejectFriendInvitation(friendId, nickname) {
            this.socket.emit("lobbyFriendInvitationActionReq", { action: 0, nickname: nickname });
            this.deleteFriendInvitation(friendId);
        },
        inviteFriendInLobby(id) {
            this.socket.emit("lobbyInvitationReq", { friendID: id });
        },
        kickPlayerFromLobby(id) {
            console.log("lobby kick req => ", id);
            this.socket.emit('lobbyKickReq', { userToKickID: id });
        },
        imHost() {
            this.leftNbJ = true;
            this.rightNbJ = true;
            if (this.nbPlayers === 2 || this.nbPlayers === this.players.length)
                this.leftNbJ = false;
            if (this.nbPlayers === 8)
                this.rightNbJ = false;

            this.playBtn.disabled = false;

            // // maj l'icone leader et les boutons exclure du groupe de lobby
            // $('.grouplist .friend-action').css('display', '');
            // const els = document.querySelectorAll('.grouplist .friends-name');
            // for (const el of els) {
            //     if (el.textContent === NICKNAME) {
            //         if (!el.parentNode.classList.contains('leader'))
            //             el.parentNode.classList.add('leader');
            //         el.parentNode.querySelector('.friend-action').style.display = 'none';
            //         break;
            //     }
            // }
        }
    },
    created() {
        console.log(this.loggedUser);
        console.log(this.socket);

        this.socket.io.on('connect_error', () => {
            this.$parent.toast('Impossible de se connecter au serveur de sockets...', 'danger', 5);
            this.$router.push('Login');
        });

        this.socket.on('error', (error) => {
            if (error.type == 'UnauthorizedError' || error.code == 'invalid_token') {
                // redirect user to login page perhaps?
                this.$parent.toast('Le token a expiré', 'danger', 5);
                this.$router.push('Login');
            }
        });

        this.socket.on('unauthorized', (error) => {
            if (error.data.type == 'UnauthorizedError' || error.data.code == 'invalid_token') {
                this.$parent.toast('Le token a expiré (token invalide)', 'danger', 5);
                this.$router.push('Login');
            }
        });

        this.socket.on('notLoggedRes', () => {
            this.$router.push('Login');
        });


        this.socket.on('lobbyCreatedRes', (res) => {
            console.log('lobbyCreatedRes: ' + Object.keys(res));
            this.hostID = this.loggedUser.id;
            this.nbPlayers = res.targetUsersNb;
            this.players = [this.loggedUser];
            this.imHost();
        });

        this.socket.on('lobbyJoinedRes', (res) => {
            console.log("===");
            console.log("LOBBY JOINED RES");
            console.log(res);
            this.players = [];
            this.nbPlayers = res.targetUsersNb;
            // this.hostID = res.users[0].id;

            for (const usr of res.users) {
                usr.avatar = this.$store.getters.serverUrl + usr.avatar;
                this.players.push(usr);
            }

            console.log(this.hostID);
            this.hostID = res.users[0].id;
            console.log(this.hostID);

            this.leftNbJ = false;
            this.rightNbJ = false;
            console.log("===");
            // for (const mess of res.messages)
            //     addMsg(mess.senderUserID, mess.content, mess.createdTime);
        });




        /** Système de gestion d'amis
         * Vocabulaire :
         *  Pending: demande reçue besoin de valider/refuser
         *  Requested : demande envoyée en attente de validation/refus
         */
        // demande de la liste d'amis
        this.socket.emit('lobbyFriendListReq');
        this.socket.on('lobbyFriendListRes', (res) => {
            console.log("========== lobbyFriendListRes==============")

            for (const i in res.friends) {
                res.friends[i].avatar = this.$store.getters.serverUrl + res.friends[i].avatar
                this.friends.push(res.friends[i]);
            }
        })

        this.socket.emit('lobbyPendingFriendListReq');
        this.socket.on('lobbyPendingFriendListRes', (res) => {
            this.friendsInvitations = res.friends;
        })

        this.socket.emit('lobbyRequestedFriendListReq');
        this.socket.on('lobbyRequestedFriendListRes', (res) => {
            console.log(res);
        })


        /** Système d'interactions avec les amis
         */

        // récéption d'une demande d'ami
        this.socket.on('lobbyFriendInvitationReceivedRes', (res) => {
            // notificationSfx.play();
            this.friendsInvitations.push({id: res.id, nickname: res.nickname});
        });

        //Invitation d'un amis pour rejoindre son lobby
        this.socket.on('lobbyInvitationReceivedRes', (res) => {
            // notificationSfx.play();
            this.lobbyInvitations.push({id: res.invitationID, friendNickname: res.senderFriendNickname});
        });


        /**Gestion du lobby
         */
        this.socket.on('lobbyUserJoinedRes', (res) => {
            // userJoinedSfx.play();
            
            this.players.push({ id: res.id, nickname: res.nickname, avatar: this.$store.getters.serverUrl + res.avatar });
            // addPlayerInGroup(res.id, res.nickname, socketUrl + res.avatar);

            if (this.nbPlayers < this.players.length)
                this.nbPlayers = this.players.length;

            // if (hostID === ID)
            //     updateNbUsersArrows();
        });

        this.socket.on('lobbyUserLeftRes', (res) => {
            // userLeftSfx.play();

            console.log("LOBBY USER LEFT RES");
            console.log(res);

            if (res.userID === this.loggedUser.id) {
                // j'ai été KICK
                this.socket.emit('lobbyReadyReq');
                return;
            }

            if (this.hostID !== res.hostID) {
                // ...=> changement d'hote
            }

            this.hostID = res.hostID;
            console.log('newhost = ' + this.idToNick(res.hostID))

            // supprimer de la liste dans grouplist
            for (const i in this.players) {
                if (this.players[i].id == res.userID) {
                    this.players.splice(i, 1);
                    break;
                }
            }

            if (this.hostID === this.loggedUser.id)
                this.imHost();
        });

        this.socket.on('lobbyTargetUsersNbChangedRes', (res) => {
            this.nbPlayers = res.nb;
            // if (hostID === ID)
            //     updateNbUsersArrows();
        });

        this.socket.on('lobbyPlayRes', (res) => {
            if (res.error !== 0) {
                this.$parent.toast(`Erreur ${res.status}`, 'danger', 5);
                this.playBtn.disabled = false;
                this.playBtn.text = "JOUER!";
            }
        });

        this.socket.on('lobbyGameFoundRes', () => {
            // lobbyMusic.fade(lobbyMusic.volume(), 0, 500);
            setTimeout(() => {
                this.$router.push('Game');
            }, 500);
        });

        /**Vérifications des Res asynchrones
        */
        this.socket.on('lobbyFriendInvitationSendRes', (res) => {
            if (res.error === 0) {
                this.$parent.toast('Invitation envoyée', 'success', 3);
                // $('#addFriendModal').modal('hide');
            } else // hôte uniquement
                this.$parent.toast(`Erreur ${res.status}`, 'danger', 5);
        });

        this.socket.on("lobbyInvitationRes", (res) => {
            if (res.error === 0)
                this.$parent.toast('Invitation envoyée', 'success', 3);
            else // hôte uniquement
                this.$parent.toast(`Erreur ${res.status}`, 'danger', 5);
        });

        this.socket.on("lobbyFriendInvitationActionRes", (res) => {
            if (res.error === 0)
                console.log("lobbyFriendInvitationActionRes")
            else // hôte uniquement
                this.$parent.toast(`Erreur ${res.status}`, 'danger', 5);
        });

        this.socket.on("lobbyInvitationAcceptRes", (res) => {
            console.log("lobbyInvitationAcceptRes");
            console.log(res);
            if (res.error === 0) {
                this.socket.emit('lobbyReadyReq');

                // this.socket.emit('disconnect');
                setTimeout(() => {
                    this.socket.emit('lobbyReadyReq');
                }, 1000);
                // this.$router.go();
            } else // hôte uniquement
                this.$parent.toast(`Erreur ${res.status}`, 'danger', 5);
        });

        this.socket.on("lobbyFriendInvitationAcceptedRes", (res) => {
            this.friends.push({
                id: res.id,
                nickname: res.nickname,
                avatar: this.$store.getters.serverUrl + res.avatar
            });
        });

        this.socket.on("lobbyKickRes", (res) => {
            console.log(res);
            if (res.error === 0)
                console.log("lobbyKickRes")
            else // hôte uniquement
                this.$parent.toast(`Erreur ${res.status}`, 'danger', 5);
        });


        console.log("LOBBY READY REQ");
        this.socket.emit('lobbyReadyReq');
    }
}
</script>

