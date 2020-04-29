<template>
  <div class="game">
    <div class="background-container"></div>
    <div class="board-container">
      <gameboard ref="gameboard"></gameboard>
    </div>
    <div class="ingame-ui-container">
      <div class="container-fluid top-bar">
        <div class="row">
          <div class="col-md-6">
            <div class="offers-container">

              <div v-for="offer in offers" :key="offer.offerID" class="offer">
                <div class="message">{{offer.sellerNickname}} propose de vous acheter {{offer.propertyName}} pour {{offer.price}}€</div>
                <div class="form">
                  <button v-on:click="offerAccept(offer.offerID)">Accepter</button>
                  <button v-on:click="discardOffer(offer.offerID)">Refuser</button>
                </div>
              </div>

            </div>
          </div>

          <div class="col-md-6">
            <div class="profile-overlay-container">
              <div class="profile-row">
                <div class="username">{{loggedUser.nickname}}</div>
                <i
                  style="display: none;color: #fff;cursor:pointer;"
                  id="open-user-settings"
                  class="fa fa-pen"
                  data-toggle="modal"
                  data-target="#userSettingsModal"
                ></i>
                <img class="user-avatar" :src="loggedUser.avatar" />
                <i
                  class="fa fa-cog open-settings ml-2"
                  aria-hidden="true"
                  data-toggle="modal"
                  data-target="#optionsModal"
                ></i>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="container-fluid players-list-container pl-5 pr-5">
        <div class="player-list" v-if="gameMounted">
          <player-entry
            v-for="player in players"
            :key="player.id"
            :player="player"
            :isCurrent="currentPlayerID == player.id"
            :loggedUser="loggedUser"
            :socket="socket"
          ></player-entry>
        </div>
      </div>
      <div class="container-fluid bottom-container pl-5 pr-5" style="z-index: 10;">
        <div class="row">
          <div class="col-md-4">
            <chat-io v-if="gameMounted" v-bind:socket="socket" env="game" ref="chat"></chat-io>
          </div>
          <div class="col-md-4"></div>
          <div class="col-md-4">
            <div class="row notification-container">
              <div class="col-md-12">
                <div v-for="(notif, index) in turnNotifications" :key="index">
                  <div v-if="notif.type == 'text'">
                    <div class="card notification event" :class="{'disabled': !imCurrentPlayer}">
                      <div
                        v-if="notif.title"
                        class="card-header"
                        :class="[notif.color ? notif.color : '']"
                      >
                        <div class="title">{{notif.title}}</div>
                      </div>
                      <div class="card-body" :class="{'no-header': !notif.title}">
                        <div class="col-md-12 text-center value">
                          <p>{{notif.content}}</p>
                        </div>
                        <button class="btn btn-primary" v-on:click="discardTurnNotif(index)">OK</button>
                      </div>
                    </div>
                  </div>

                  <!-- type: 'saleCard',
                        cardType: 'station',
                        propertyID: property.id,
                        propertyName: property.name,
                  price: price-->
                  <div v-if="notif.type == 'saleCard'">
                    <div class="card notification sale" :class="{disabled: !imCurrentPlayer}">
                      <div class="card-header" :class="notif.cardType">
                        <div class="title">{{notif.propertyName}}</div>
                      </div>
                      <div class="card-body">
                        <div class="row">
                          <div class="col-md-12 text-center value">
                            <p class="state">À VENDRE</p>
                            <p>{{notif.price}} €</p>
                          </div>
                        </div>
                        <button
                          class="btn btn-primary accept"
                          v-on:click="saleCardBuyProperty(index)"
                        >ACHETER</button>
                        <button
                          class="btn btn-secondary reject"
                          v-on:click="saleCardReject(index)"
                        >NE RIEN FAIRE</button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div class="row action-button-container">
              <div class="col-md-12 text-right">
                <div class="sortie-parlement">Sortie du parlement</div>
                <action-button ref="actionBtn" v-once></action-button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Popup d'Enchères -->
      <div id="bid-popup-container">

        <div v-for="bid in bids" :key="bid.bidID" class="bid-popup">
          <div class="bid-form">
            <div v-if="!bid.launcherNickname" class="content">
                Une enchère est lancée pour {{bid.propertyName}}
            </div>
            <div v-else class="content">
                {{bid.launcherNickname}} lance une enchère pour {{bid.propertyName}}. Prix de départ : {{bid.startingPrice}}
            </div>

            <form @submit.prevent="sendBid(bid)">
                <div class="bid-input">
                    <input v-model="bid.myPrice" :disabled="bid.disabled" type="text" placeholder="Prix">€
                    <button :disabled="bid.disabled" type="submit" class="bid-validation">Enchérir</button>
                    <button :disabled="bid.disabled" class="bid-cancel" v-on:click="rejectBid(bid)">Passer</button>
                </div>
            </form>
          </div>

          <div v-if="bid.textContent" class="bid-info" style="color:#fff;font-size: 13px;font-weight: bold;text-align:left;width:100%;">
            Résultat : {{bid.textContent}}
          </div>
        </div>
      </div>

      <!-- Dices -->
      <dices ref="dices" v-once></dices>

      <!-- Slash text -->
      <splash-text ref="splashText" v-once></splash-text>

      <!-- Ecran de fin -->
      <div v-if="endGame" class="end-game-background"></div>
      <div v-if="endGame" class="end-game-screen">
        <div class="header">
          <h5>Fin de la partie !</h5>
        </div>
        <div class="content">
          <div class="winner">{{endGame.winnerNickname}}</div>
          <div class="subtitle">a gagné la partie !</div>
          <div class="info">
            <div class="label">Temps de jeu</div>
            <div class="value">{{endGame.gameTime}}</div>
          </div>
          <div class="info">
            <div class="label">Info</div>
            <div class="value">Valeur</div>
          </div>
          <router-link to="/Lobby" class="btn stylized">Revenir au lobby</router-link>
        </div>
      </div>

      <!--
            <script>
                const player = {
                    id: 1,
                    nickname: 'Michel',
                    money: 1000
                }
                createPlayerEntry(player);
                initProperty();
                createProperty("1", "red", "Avenue", "1");
                createProperty("1", "red", "Avenue2", "2");
                createProperty("1", "red", "Avenue3", "3");
                createProperty("1", "station", "Université", "8");
                createProperty("1", "station", "Université2", "5");
                createProperty("1", "station", "Université3", "6");
                createProperty("1", "station", "Université4", "7");
                createProperty("1", "company", "Syndicat Des Eaux et de l'Assainissement", "7");
                createProperty("1", "company", "Eléctricité de Strasbourg", "7");

                hideLoaderOverlay();
                displayPropertyInfos(JSON.parse('{"id":0,"type":"company","name":"Eau","description":"Quelle magnifique rue !","color":"brown","prices":{"empty":60,"house":50,"hostel":250},"rentalPrices":{"empty":2,"house":[10,30,90,160],"hostel":250},"housesNb":0}'));
                openBidPopup(1, "Nombeaucoupbeaucoupbeaucoupbeaucoupbeaucouptroplongcanerentrepas", "caaussic'estbeaucouptroplongmaisvraimentvraimenttroplongattentioncavadepasserjelesenscavadepassercavadepasserauttention");
            </script>
      -->
    </div>

    <full-screen-loader v-if="loading"></full-screen-loader>

    <!-- Game settings modal -->
    <game-settings-modal v-if="gameMounted" :socket="socket" :loggedUser="loggedUser" env="game" ref="gameSettings"></game-settings-modal>
  </div>
</template>

<script>
import io from "socket.io-client";
import FullScreenLoader from '../components/FullScreenLoader';
import GameBoard from "../components/GameBoard";
import GameSettingsModal from "../components/GameSettingsModal";
import ActionButton from "../components/ActionButton";
import PlayerEntry from "../components/PlayerEntry";
import Dices from "../components/Dices";
import ChatIO from "../components/ChatIO";
import SplashText from "../components/SplashText";
import { Howl } from "howler";
import "odometer/themes/odometer-theme-default.css";

export default {
  name: "Game",
  components: {
    'full-screen-loader': FullScreenLoader,
    'gameboard': GameBoard,
    'action-button': ActionButton,
    'game-settings-modal': GameSettingsModal,
    'player-entry': PlayerEntry,
    'dices': Dices,
    'splash-text': SplashText,
    'chat-io': ChatIO
  },
  data() {
    return {
      gameMounted: false,
      CST: {
        PAWNS: [
          "tracteur",
          "boat",
          "moto",
          "camion",
          "montgolfiere",
          "citroen C4",
          "overboard",
          "schoolbus"
        ],
        PLAYERS_COLORS: [
          "yellow",
          "#d43333",
          "#006aff",
          "#22d406",
          "white",
          "violet",
          "cyan",
          "orange"
        ],
        CELL_PRISON: 10
      },
      loading: true,
      loggedUser: this.$store.getters.loggedUser,
      socket: io.connect(this.$store.getters.serverUrl, {
            query: "token=" + this.$store.getters.jwt,
            path: "/socket.io",
            secure: true
      }),
      players: [],
      cells: [],
      properties: [],
      gameEndTime: null,
      turnNotifications: [],
      currentPlayerID: 0,
      audio: {
        background: null,
        sfx: {}
      },
      offers: [],
      bids: [],
      endGame: false
    };
  },
  computed: {
    imCurrentPlayer: function() {
      return this.currentPlayerID === this.loggedUser.id;
    }
  },
  methods: {
    nickToId(nick) {
      for (const i in this.players) {
        if (this.players[i].nickname == nick) return this.players[i].id;
      }
      return null;
    },

    idToNick(id) {
      for (const i in this.players) {
        if (this.players[i].id == id) return this.players[i].nickname;
      }
      return null;
    },

    getPlayerById(id) {
      for (const i in this.players) {
        if (this.players[i].id == id) return this.players[i];
      }
      return null;
    },

    getPlayerPropertyById(player, propertyID) {
        for (const i in player.properties) {
            if (player.properties[i].id == propertyID)
                return player.properties[i];
        }
        return null;
    },

    getCellById(id) {
      for (const i in this.cells) {
        if (this.cells[i].id == id) return this.cells[i];
      }
      return null;
    },

    getPropertyById(id) {
      for (const i in this.properties) {
        if (this.properties[i].id == id) return this.properties[i];
      }
      return null;
    },

    getPropertyByCellId(cellId) {
      let cell = this.getCellById(cellId);
      for (const i in this.properties) {
        if (this.properties[i].id == cell.propertyID) return this.properties[i];
      }
      return null;
    },

    getCellByProperty(property) {
      for (const i in this.cells) {
        if (this.cells[i].propertyID == property.id) return this.cells[i];
      }
      return null;
    },

    gameRollDiceReq() {
      if (!this.imCurrentPlayer) return;
      this.turnNotifications = [];
      this.socket.emit("gameRollDiceReq");
    },

    gameTurnEndReq() {
      if (!this.imCurrentPlayer) return;
      this.socket.emit("gameTurnEndReq");
    },

    discardTurnNotif(index) {
      if (!this.imCurrentPlayer) return;
      this.turnNotifications.splice(index, 1);
    },

    saleCardBuyProperty(notifIndex) {
      if (!this.imCurrentPlayer) return;
      this.socket.emit("gamePropertyBuyReq");
      this.turnNotifications.splice(notifIndex, 1);
    },

    saleCardReject(notifIndex) {
      if (!this.imCurrentPlayer) return;
      this.discardTurnNotif(notifIndex);
    },

    discardOffer(offerID) {
        for (const i in this.offers) {
            if (this.offers[i].offerID == offerID) {
                this.offers.splice(i, 1);
                return;
            }
        }
    },

    offerAccept(offerID) {
      this.socket.emit('gameOfferAcceptReq', { offerID: parseInt(offerID) });
      console.log('gameOfferAcceptReq');
      this.discardOffer(offerID);
      // [A FAIRE] CHANGER COULEUR DRAPEAU
    },

    sendBid(bid) {
      if (bid.myPrice < bid.startingPrice) {
        this.$parent.toast(`Votre enchère doit être ≥ ${bid.startingPrice}€`, 'danger', 3);
        return;
      }

      this.socket.emit('gameOverbidReq', { bidID: bid.bidID, price: parseInt(bid.myPrice) });
      this.$set(bid, 'disabled', true);
    },

    rejectBid(bid) {
      this.socket.emit('gameOverbidReq', { bidID: bid.bidID, price: 0 });
      this.$set(bid, 'disabled', true);
    },

    playMusic() {
      this.audio.background = new Howl({
        src:
          "/assets/audio/musics/on-my-way-by-kevin-macleod-from-filmmusic-io.mp3",
        volume: this.loggedUser.settings.musicLevel / 100,
        autoplay: true,
        loop: true
      });
    },

    setMusicLevel(level) {
        this.audio.background.volume(level / 100);
    },

    stopMusic() {
      this.audio.background.fade(this.audio.background.volume(), 0, 500);
      this.audio.background.stop();
    },

    loadSfx() {
      this.audio.sfx.rollDices = new Howl({
        src: ["/assets/audio/sfx/shake-and-roll-dice-soundbible.mp3"],
        autoplay: false,
        loop: false,
        volume: this.loggedUser.settings.sfxLevel / 100
      });
      this.audio.sfx.cashRegister = new Howl({
        src: ["/assets/audio/sfx/cash-register-youtube-gaming-sound-fx.mp3"],
        autoplay: false,
        loop: false,
        volume: this.loggedUser.settings.sfxLevel /100
      });
    },

    setSfxLevel(level) {
        for (let [key] of Object.entries(this.audio.sfx))
            key.volume(level / 100);
    },

    /**
     * Indique au serveur que l'on est prêt à commencer la partie côté client
     */
    gameReady() {
        setTimeout(() => {
          console.log('gameReadyReq');
          this.socket.emit('gameReadyReq');
        }, 2000);
    },

    pushGameOfferReceive(offer) {
      const buyer = this.getPlayerById(offer.makerID);
      const receiver = this.getPlayerById(offer.receiverID);
      const property = this.getPropertyById(offer.propertyID);

      if (!buyer || !receiver || !property) return;

      if (receiver.id == this.loggedUser.id) {
        this.offers.push({
          buyerNickname: buyer.nickname,
          propertyName: property.name,
          price: offer.price,
          offerID: offer.offerID
        });
      } else {
        this.$refs.chat.messages.push({
          senderUserID: -1,
          content: `${buyer.nickname} propose à ${receiver.nickname} de lui acheter ${property.name} pour ${offer.price}€ !`,
          createdTime: new Date()
        })
      }
    },

    pushGameBid(bid) {
      // Premier message uniquement
      if (bid.playerID == null) {
        // La propriété appartient déjà à quelqu'un
        if (bid.propertyOwnerID) {
            const propertyOwner = this.getPlayerById(bid.propertyOwnerID);
            if (!propertyOwner) return;

            this.bids.push({
                launcherNickname: propertyOwner.nickname,
                startingPrice: bid.price,
                disabled: (bid.propertyOwnerID == this.loggedUser.id),
                myPrice: '',
                propertyName: bid.text,
                textContent: "",
                bidID: bid.bidID
            });
        } else { // Enchère automatique (par de launcher)
            this.bids.push({
                launcherNickname: null,
                startingPrice: 0,
                disabled: false,
                myPrice: '',
                propertyName: bid.text,
                textContent: "",
                bidID: bid.bidID
            });
        }
      }
    },

    /**
     * Quitter volontairement la partie
     */
    quitGame() {
      this.socket.emit("gamePlayerLeavingReq");
      this.socket.on("gamePlayerLeavingRes", res => {
        if (res.error === 0) {
          this.$refs.gameSettings.closeModal();
          setTimeout(() => {
            this.$router.push("Lobby");
          }, 800);
        } else {
          this.$parent.toast(res.status, "danger", 5);
        }
      });
    },

    /**
     * Continue le tour de jeu (gameActionRes) après le premier déplacement
     * @param data Données de gameActionRes
     * @param currPlayer Joueur courant
     * @param cellPos2 Position #2 (le cas échéant)
     */
    gameActionResAfterFirstMovement(data, currPlayer, cellPos2) {
      // Mise à jour des soldes (le cas échéant)
      if (data.updateMoney && data.updateMoney.length > 0) {
        this.audio.sfx.cashRegister.play();
        data.updateMoney.forEach(row => {
          const player = this.getPlayerById(row.playerID);
          if (player) {
            this.$set(player, "money", row.money);
          }
        });
      }

      // Récupération de la propriété sur laquelle le joueur est tombé (le cas échéant)
      const property = this.getPropertyByCellId(data.cellPos);

      let afficherMessageAction = false;
      // asyncRequestType à gérer ici
      if (data.asyncRequestType && property) {
        if (data.asyncRequestType == "canBuy") {
          let price = data.asyncRequestArgs[0];
          let notification = {
            type: "saleCard",
            cardType: "company eau",
            propertyID: property.id,
            propertyName: property.name,
            price: price
          };

          if (property.type == "publicCompany") {
            if (property.name == "Eléctricité de Strasbourg") {
              notification.cardType = "company electricite";
            } else {
              notification.cardType = "company eau";
            }
          } else if (property.type == "trainStation") {
            notification.cardType = "station";
          } else {
            notification.cardType = property.color;
          }

          this.turnNotifications.push(notification);
        } else if (data.asyncRequestType == "shouldMortgage") {
          // le montant de loyer à payer (donc à obtenir avec argent actuel + hypothèque de propriétés)
          // let totalMoneyToHave = data.asyncRequestArgs[0];
        } else {
          afficherMessageAction = true;
        }
      } else {
        afficherMessageAction = true;
      }

      // Affichage du message d'action donné par le serveur
      if (afficherMessageAction && data.actionMessage) {
        this.turnNotifications.push({
          title: null,
          content: data.actionMessage,
          type: "text"
        });
      }

      // Traitement des extras
      if (typeof data.extra !== "undefined") {
        // Si on est tombé sur une carte (chance / communauté)
        if (typeof data.extra.newCard !== "undefined") {
          let notification = {
            content: data.extra.newCard.description,
            color: "blue",
            type: "text"
          };

          if (data.extra.newCard.type == "chance")
            notification.title = "Carte chance";
          else notification.title = "Carte communauté";

          this.turnNotifications.push(notification);
        }

        // Nb de cartes sortie de prison si il a changé
        if (typeof data.extra.nbJailEscapeCards !== "undefined")
          currPlayer.nbJailEscapeCards = data.extra.nbJailEscapeCards;

        if (typeof data.extra.goJail !== "undefined" && data.extra.goJail) {
          cellPos2 = null;
          currPlayer.isInJail = 1;
          setTimeout(() => {
            this.$refs.gameboard.deletePawn(this.CST.PAWNS[currPlayer.pawn]);
            setTimeout(() => {
              this.$refs.gameboard.loaderPawn(
                this.CST.PAWNS[currPlayer.pawn],
                this.CST.CELL_PRISON
              );
              return this.gameActionResAfterSecondMovement(data, currPlayer);
            }, 1000);
          }, 1000);
        }
      }

      if (cellPos2 !== null && cellPos2 != currPlayer.cellPos) {
        this.$refs.gameboard.movement(
          this.CST.PAWNS[currPlayer.pawn],
          cellPos2.toString(),
          () => {
            currPlayer.cellPos = cellPos2;
            this.gameActionResAfterSecondMovement(data, currPlayer);
          }
        );
      } else {
        this.gameActionResAfterSecondMovement(data, currPlayer);
      }
    },

    /**
     * Termine le gameActionRes (et vérifie si un double a été fait avec les dés)
     * @param data Données de gameActionRes
     * @param currPlayer Joueur actuel
     */
    gameActionResAfterSecondMovement(data, currPlayer) {
      if (data.playerID === this.loggedUser.id)
        this.$refs.actionBtn.progressReset(false);

      if (currPlayer.isInJail) currPlayer.isInJail++; // On augmente le nb de tours du joueur en prison

      console.log("=== fin gameActionRes ===");
    }
  },
  beforeDestroy() {
    this.stopMusic();
    this.socket.removeAllListeners();
    console.log("REMOVE ALL LISTENERS FROM GAME");
    this.socket.disconnect();
  },
  mounted() { 
    this.gameMounted = true;

    this.playMusic();
    this.loadSfx();

    this.loading = false; // DEBUG
    this.players = [];
    const gameboard = this.$refs.gameboard;


    this.$parent.initSocketConnexion(this.socket);

    this.socket.on('gameStartedRes', (data) => {

        this.players = data.players;
        this.cells = data.cells;
        this.properties = data.properties;
        console.log(this.properties);
        this.gameEndTime = data.gameEndTime;

        console.log('Le jeu a démarré !');
        console.log(data);

        // Level par défaut des propriétés = 0 (car non upgrade)
        for (const i in data.properties) {
            data.properties[i].level = 0;
            data.properties[i].ownerID = null;
            data.properties[i].isMortgage = 0;
            // this.$set(this.properties, i, data.properties[i]);
        }

        // Génération de la liste de joueurs
        data.players.forEach((player, index) => {
            // Champs par défaut du joueur
            // player.properties = [];
            this.$set(player, 'properties', []);
            this.$set(player, 'money', data.playersMoney);
            // player.money = data.playersMoney;
            player.cellPos = 0;
            player.color = this.CST.PLAYERS_COLORS[index];
            player.isInJail = false;
            // this.$set(this.player, index, player);
            this.$refs.gameboard.loaderPawn(this.CST.PAWNS[player.pawn], player.cellPos.toString());
        });

        this.loading = false;

        this.$refs.actionBtn.progressInitialize();
    });


    // Données de reconnexion
    this.socket.on('gameReconnectionRes', (res) => {
        console.log(' --- RECONNEXION res');
        console.log(res);

        this.players = res.players;
        this.cells = res.cells;
        this.properties = res.properties;
        this.gameEndTime = res.gameEndTime;

        for (const i in this.properties)
            this.properties[i].ownerID = null;

        // Génération de la liste de joueurs
        this.players.forEach((player, index) => {
            gameboard.loaderPawn(this.CST.PAWNS[player.pawn], player.cellPos);
            player.color = this.CST.PLAYERS_COLORS[index];
            player.isInJail = false;

            for (const i in player.properties) {
              const propertyObj = this.getPropertyById(player.properties[i]);
              const cell = this.getCellByProperty(propertyObj)
              if (propertyObj && cell)
                gameboard.loaderFlag("d" + cell.id, player.color);

                console.log("PROPERTY");
                console.log(propertyObj);
                console.log("========");
                if (propertyObj.level == 0) {
                  if (propertyObj.level == 5) {
                    gameboard.loaderHotelProperty(cell.id);
                  } else {
                    if (propertyObj.level >= 1)
                      gameboard.loaderHouseProperty(cell.id, 1);
                    if (propertyObj.level >= 2)
                      gameboard.loaderHouseProperty(cell.id, 2);
                    if (propertyObj.level >= 3)
                      gameboard.loaderHouseProperty(cell.id, 3);
                    if (propertyObj.level >= 4)
                      gameboard.loaderHouseProperty(cell.id, 4);
                  }
                }
            }
        });

        res.chatMessages.forEach((msg) => {
            this.$refs.chat.messages.push({
                senderUserID: msg.playerID,
                content: msg.text,
                createdTime: msg.createdTime
            });
        });

        res.offers.forEach((offer) => {
          this.pushGameOfferReceive(offer);
        });

        res.bids.forEach((bid) => {
          this.pushGameBid(bid);
        });

        this.$refs.actionBtn.progressInitialize();

        this.loading = false;
    });


    this.socket.on('gameTurnRes', (data) => {
        if (this.loading) return;

        console.log(data);
        let currentTimestamp = Date.now();
        let turnTimeSeconds = Math.floor((data.turnEndTime - currentTimestamp) / 1000);
        console.log('Le tour se terminera dans ' + turnTimeSeconds + ' secondes (' + currentTimestamp + ' - ' + data.turnEndTime + ')');

        // On vide toutes les notifications (au cas-où)
        this.turnNotifications = [];
        this.currentPlayerID = data.playerID;
        const player = this.getPlayerById(data.playerID);

        if (player) {
            // afficher décompte de temps du tour
            if (this.currentPlayerID == this.loggedUser.id) {
                this.$refs.actionBtn.progressReset();
                this.$refs.splashText.trigger(`<img src="/assets/img/pawns/${this.CST.PAWNS[player.pawn]}.png" width="320"><br>C'est à vous de jouer !`, 'white');
                this.$refs.actionBtn.progressStart(turnTimeSeconds);
            } else {
                this.$refs.splashText.trigger(`<img src="/assets/img/pawns/${this.CST.PAWNS[player.pawn]}.png" width="320"><br>C'est au tour de ${player.nickname} !`, 'white');
                this.$refs.actionBtn.progressFinish();
            }
        }
    });


    this.socket.on('gameActionRes', (data) => {
        if (this.loading) return;

        console.log("=== gameActionRes ===");
        console.log(data);

        console.log("Action déclenchée par " + this.idToNick(data.playerID) + " => " + data.actionMessage);

        const currPlayer = this.getPlayerById(data.playerID);
        if (!currPlayer) {
            console.log('JOUEUR INTROUVABLE');
            return;
        }

        if (currPlayer.id == this.loggedUser.id) {
            console.log("[BOUTON D'ACTION] Initialisation (dans gameActionRes)");
            if (data.dicesRes[0] != data.dicesRes[1])
                this.$refs.actionBtn.progressSetStateTerminer();
            else
                this.$refs.actionBtn.progressSetStateRelancer();
        }

        if (currPlayer.isInJail && currPlayer.isInJail > 3)
            currPlayer.isInJail = false;

        const totalDices = data.dicesRes[0] + data.dicesRes[1];
        console.log(currPlayer.nickname + " a fait un " + totalDices.toString() + " avec les dés et se rend à la case " + data.cellPos);

        const cellPos1 = data.cellPosTmp ? data.cellPosTmp : data.cellPos;
        const cellPos2 = data.cellPosTmp ? data.cellPos : null;

        // Lancement de l'animation des dés
        this.audio.sfx.rollDices.play();
        this.$refs.dices.triggerDices(data.dicesRes[0], data.dicesRes[1], () => {// Déplacement du pion du joueur

            // On ne déplace le joueur que s'il doit aller sur une nouvelle case (et s'il n'est pas en prison)
            if (!currPlayer.isInJail && cellPos1 != currPlayer.cellPos) {
                console.log("movement(" + this.CST.PAWNS[currPlayer.pawn] + ", " + cellPos1.toString() + ");");
                currPlayer.cellPos = cellPos1;
                this.$refs.actionBtn.progressPause();
                gameboard.movement(this.CST.PAWNS[currPlayer.pawn], cellPos1.toString(), () => {
                    this.$refs.actionBtn.progressResume();
                    this.gameActionResAfterFirstMovement(data, currPlayer, cellPos2);
                });
            } else {
                this.gameActionResAfterFirstMovement(data, currPlayer, cellPos2);
            }
        });
    });


    // Terrain vierge acheté
    this.socket.on("gamePropertyBuyRes", (data) => {
        if (this.loading) return;

        console.log("gamePropertyBuyRes");
        console.log(data);
        if (typeof data.error !== "undefined") {
            this.turnNotifications.push({
                type: 'text',
                title: data.status,
                color: 'brown',
                content: 'Impossible d\'acheter'
            });
            return;
        }

        const property = this.getPropertyById(data.propertyID);
        const cell = this.getCellByProperty(property);
        if (property && cell) {
            const player = this.getPlayerById(data.playerID);
            property.ownerID = player.id;
            player.properties.push(property.id);
            gameboard.loaderFlag("d" + cell.id, player.color);

            if (data.playerMoney != player.money) {
                this.audio.sfx.cashRegister.play();
                this.$set(player, 'money', data.playerMoney);
            }

            // Retirer la notificationCard chez tous les autres joueurs (après animation du bouton ACHETER)
            this.turnNotifications = [];
            // $('.notification-container')
            //     .find('.notification.sale[data-property-id="' + property.id + '"] .btn-primary')
            //     .animate({ zoom: '130%' }, 250, function () {
            //         $(this).animate({ zoom: '100%' }, 250, function () {
            //             setTimeout(function () {
            //                 $('.notification-container').find('.notification.sale[data-property-id="' + property.id + '"]').fadeOut('fast', () => {
            //                     $(this).remove();
            //                 });
            //             }, 300);
            //         });
            //     });

        }
    });


    // Un joueur s'est déconnecté
    this.socket.on('gamePlayerDisconnectedRes', (data) => {
        if (this.loading) return;

        console.log('gamePlayerDisconnectedRes');
        const player = this.getPlayerById(data.playerID);
        if (player) {
            this.$set(player, 'disconnected', true);
            console.log(`${player.nickname} s'est déconnecté`);
        }
    });

    // Un joueur s'est reconnecté
    this.socket.on('gamePlayerReconnectedRes', (data) => {
        if (this.loading) return;

        const player = this.getPlayerById(data.playerID);
        if (player)
            this.$set(player, 'disconnected', false);
    });

    // Player failure
    this.socket.on('gamePlayerFailureRes', (res) => {
        if (this.loading) return;

        console.log('gamePlayerFailureRes');

        const player = this.getPlayerById(res.playerID);
        if (player) {
            this.$refs.splashText.trigger(`<i class="fas fa-skull-crossbones"></i><br>${player.nickname} a fait faillite !`, '#DB1311');

            // Toutes les propriétés sont à nouveau à vendre
            this.properties.forEach((property) => {
                if (property.ownerID == player.id)
                    property.ownerID = null;
            });

            // Reset des propriétés du joueur
            this.$set(player, 'properties', []);

            // Simple texte d'annonce
            this.$set(player, 'failure', true);
        }
    });

    // On a reçu une offre d'achat
    this.socket.on("gameOfferReceiveRes", (res) => {
        this.pushGameOfferReceive(res);
    });

    // Offre accpeptée check
    this.socket.on("gameOfferAcceptRes", (res) => {
        if (res.error === 0)
            console.log("gameOfferAcceptRes")
        else
            this.$parent.toast(`Erreur : ${res.status}`, 'danger', 5);
    });

    // Offre envoyée check
    this.socket.on("gameOfferSendRes", (res) => {
        if (res.error === 0)
            console.log("gameOfferSendRes")
        else // hôte uniquement
            this.$parent.toast(`Erreur achat : ${res.status}`, 'danger', 5);
    });

    // Offre (d'achat) terminée
    this.socket.on('gameOfferFinishedRes', (res) => {
      const buyer = this.getPlayerById(res.makerID);
      const property = this.getPropertyById(res.propertyID);

      if (!buyer || !property) return;

      if (res.receiverID == null) { // Offre a expiré
        // Si on a reçu cette offre, on la supprime + notification
        if (this.offers.length) {
          for (const i in this.offers) {
            if (this.offers[i].offerID == res.offerID) {
              this.offers.splice(i, 1);
              this.$parent.toast(`La proposition d'achat de ${buyer.nickname} pour ${property.name} a expiré`, 'danger', 5);
              break;
            }
          }
        }
      } else {
        const receiver = this.getPlayerById(res.receiverID);
        if (!receiver) return;

        // Transfert argent
        this.$set(buyer, 'money', parseInt(buyer.money) - parseInt(res.price));
        this.$set(receiver, 'money', parseInt(receiver.money) + parseInt(res.price));

        // Transfert propriétés
        for (const i in receiver.properties) {
          if (receiver.properties[i] == property.id) {
            receiver.properties.splice(i, 1);
            break;
          }
        }
        property.ownerID = buyer.id;
        buyer.properties.push(property.id);

        // Notifications de réussite
        if (buyer.id == this.loggedUser.id) {
          this.$parent.toast(`${receiver.nickname} a accepté de vous vendre ${property.name} !`, 'success', 4);
        } else if (receiver.id == this.loggedUser.id) {
          this.$parent.toast(`Vous avez vendu ${property.name} à ${buyer.nickname} !`, 'success', 4);
        }

        this.$refs.chat.messages.push({
            senderUserID: -1,
            content: `${buyer.nickname} a acheté ${property.name} à ${receiver.nickname} pour ${res.price} !`,
            createdTime: new Date()
        });
      }

    });

    // Edition de mes propriétés check
    this.socket.on('gamePropertyUpgradeRes', (res) => {
      // alert('gamePropertyUpgradeRes');
      console.log(res);
      if (res.error === 0)
        console.log('gamePropertyUpgradeRes OK');
      else
        this.$parent.toast(`Erreur : ${res.status}`, 'danger', 4);
    });

    // Edition des propriétés d'un joueur
    this.socket.on('gamePropertyUpgradedRes', (res) => {
      // alert('gamePropertyUpgradedRes');
      console.log('gamePropertyUpgradedRes');
      console.log(res);
      const player = this.getPlayerById(res.playerID);
      if (!player) return;

      this.$set(player, 'money', res.playerMoney);

      for (const i in res.list) {
        const edit = res.list[i]; // { propertyID: int, level: int }
        const property = this.getPropertyById(edit.propertyID);
        const cell = this.getCellByProperty(property);
        if (!property || !cell) continue;

        const oldLevel = property.level;
        this.$set(property, 'level', edit.level); // Nouveau level

        // Màj des maisons sur le plateau 3D
        if (property.level > oldLevel) {
          // Amélioration
          if (property.level == 1) {
              gameboard.loaderHouseProperty(cell.id, 1);
          } else if (property.level == 2) {
              if (oldLevel < 1) gameboard.loaderHouseProperty(cell.id, 1);

              gameboard.loaderHouseProperty(cell.id, 2);
          } else if (property.level == 3) {
              if (oldLevel < 1) gameboard.loaderHouseProperty(cell.id, 1);
              if (oldLevel < 2) gameboard.loaderHouseProperty(cell.id, 2);

              gameboard.loaderHouseProperty(cell.id, 3);
          } else if (property.level == 4) {
              if (oldLevel < 1) gameboard.loaderHouseProperty(cell.id, 1);
              if (oldLevel < 2) gameboard.loaderHouseProperty(cell.id, 2);
              if (oldLevel < 3) gameboard.loaderHouseProperty(cell.id, 3);

              gameboard.loaderHouseProperty(cell.id, 4);
          } else if (property.level == 5) {
              for (let k = 0; k < oldLevel; k++) {
                gameboard.deleteHouse(cell.id, k+1);
              }
              gameboard.loaderHotelProperty(cell.id);
          }
        }

        // gameboard.loaderHouseProperty(nbcase, nhouse);
        // gameboard.loaderHotelProperty(ncase)

        // gameboard.deleteHouse(ncase, nhouse)

        // gameboard.deleteHotel(ncase);
      }
    });

    // Ouverture d'une enchère ou nouvelle enchère d'un joueur
    this.socket.on('gameBidRes', (res) => {
        console.log('gameBidRes');
        this.pushGameBid(res);
    });

    // Fin d'une enchère
    this.socket.on('gameBidEndedRes', (res) => {
        console.log('gameBidEndedRes');
        let bid;
        let bidIndex;
        for (const i in this.bids) {
            if (this.bids[i].bidID == res.bidID) {
                bid = this.bids[i];
                bidIndex = i;
                break;
            }
        }

        if (!bid) return;

        this.$set(bid, 'disabled', true);

        if (res.playerID == null) {
            this.$set(bid, 'textContent', 'Le terrain n\'a pas été acheté...');
        } else {
            const property = this.getPropertyById(res.propertyID);
            const cell = this.getCellByProperty(property);

            if (!property || !cell) return;

            // Suppression de la propriété de l'ancien propriétaire (le cas échéant)
            if (res.propertyOldOwnerID) {
              const oldOwner = this.getPlayerById(res.propertyOldOwnerID);
              const propertyIndex = oldOwner.properties.indexOf(property.id);
              if (propertyIndex > -1) oldOwner.properties.splice(propertyIndex, 1);
              gameboard.deleteFlag(`d${cell.id}`);
            }

            // Attribution du propriété au vainqueur de l'enchère
            const winner = this.getPlayerById(res.playerID);
            if (winner) {
              this.$set(bid, 'textContent', `Le joueur ${winner.nickname} a remporté l'enchère pour ${res.price}€ !`);

              property.ownerID = res.playerID;
              winner.properties.push(property.id);

              gameboard.loaderFlag(`d${cell.id}`, winner.color);

              this.$set(winner, 'money', res.playerMoney);
            }
        }

        setTimeout(() => {
            this.bids.splice(bidIndex, 1);
        }, 5000);
    });


    // Enchère manuelle check
    this.socket.on('gameManualBidRes', (res) => {
      if (res.error === 0)
        this.$parent.toast('Enchère créée !', 'success', 3);
      else
        this.$parent.toast(`Erreur lors de la création de l'enchère : ${res.status}`, 'danger', 5);
    });


    // Hypothèque Erreur
    this.socket.on("gamePropertyMortgageRes", (res) => {
        console.log("gamePropertyMortgageRes");
        console.log(res);
        if (res.error !== 0) {
            this.$parent.toast(`Erreur hypothèque : ${res.status}`, 'danger', 4);
        }
    });

    // Hypothèque OK
    this.socket.on("gamePropertyMortgagedRes", (res) => {
        console.log("gamePropertyMortgagedRes");
        console.log(res);

        const player = this.getPlayerById(res.playerID);
        if (player) {
            this.$set(player, 'money', res.playerMoney);
            for (const i in res.properties) {
                // Modifier "isMortgaged" dans la liste globale des propriétés
                const property = this.getPropertyById(res.properties[i]);
                this.$set(property, 'isMortgaged', true);

                // Modifier "isMortgaged" dans la propriété de l'utilisateur
                if (property.ownerID) {
                    const playerProperty = this.getPlayerPropertyById(player, property.id);
                    // const propertyOwner = this.getPlayerById(property.ownerID);
                    if (playerProperty) {
                        this.$set(playerProperty, 'isMortgaged', true);
                    }
                }

                this.$parent.toast(`Propriété ${property.name} hypothéquée`, 'success', 4);
            }
        }
    });

    // Faire leverl'hypothèque ERREUR
    this.socket.on("gamePropertyUnmortgageRes", (res) => {
        console.log("gamePropertyUnmortgageRes");
        console.log(res);
        if (res.error !== 0) {
            this.$parent.toast(`Erreur rachat hypothèque : ${res.status}`, 'danger', 4);
        }
    });

    // Faire lever l'hypotheque OK
    this.socket.on("gamePropertyUnmortgagedRes", (res) => {
        const player = this.getPlayerById(res.playerID);
        const property = this.getPropertyById(res.propertyID);

        if (player && property) {
            this.$set(player, 'money', res.playerMoney);
            this.$set(property, 'isMortgaged', false);
            this.$parent.toast(`Hypothèque levée pour ${property.name}`, 'success', 4);

            const playerProperty = this.getPlayerPropertyById(player, property.id);
            if (playerProperty) {
                this.$set(playerProperty, 'isMortgaged', false);
            }
        }
    });


    // Fin de partie
    this.socket.on('gameEndRes', (res) => {
      let seconds = Math.floor((res.duration / 1000) % 60),
          minutes = Math.floor((res.duration / (1000 * 60)) % 60),
          hours = Math.floor((res.duration / (1000 * 60 * 60)) % 24);

        let gameTime = '';
        if (hours > 0)
          gameTime += `${hours}h `;

        gameTime += `${minutes}min ${seconds}sec`;

        this.endGame = {
          winnerNickname: this.idToNick(res.winnerID),
          gameTime: gameTime,
          endType: res.type // 'failure' (dernier en vie) ou 'timeout'
        }
    });

    // Un joueur quitte la partie
    this.socket.on('gamePlayerHasLeftRes', (res) => {
        if (this.loading) return;

        console.log("=== PLAYER LEFT ===");
        const player = this.getPlayerById(res.playerID);
        if (player) {
            console.log('PLAYER LEFT IS')
            console.log(player);
            this.$refs.chat.messages.push({
                senderUserID: -1,
                content: `${player.nickname} a quitté la partie :/`,
                createdTime: new Date()
            });

            for (const i in this.players) {
                if (this.players[i].id == player.id) {
                    this.players.splice(i, 1);
                    return;
                }
            }
        }
    });

    this.socket.on('gameSuccessCompletedRes', (data) => {
        const html = `
            <div style="display: flex; align-items: center;">
                <i class="fas fa-trophy" style="font-size: 3em; color: orange; margin-right: 0.4em;"></i>
                <div>
                    <div style="font-size: 1.2em; margin-bottom: 0.6em;">
                        <b>Succès validé </b>
                        <div>` + data.description + `</div>
                    </div>
                    <i>Difficultée ` + data.difficulty + `/3</i><span style="margin-left: 2em; color:yellow; font-weight: bold">+ ` + data.exp + ` EXP
                </div>
            </div>
        `;
        setTimeout( () => {
            this.$parent.toast(html,  'success', 10);
        }, 6e3);
    });
  }
};
</script>
