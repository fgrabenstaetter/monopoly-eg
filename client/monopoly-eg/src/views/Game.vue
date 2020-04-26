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
        <div class="player-list">
          <player-entry
            v-for="player in players"
            :key="player.id"
            v-bind:player="player"
            v-bind:isCurrent="currentPlayerID == player.id"
          ></player-entry>
        </div>
      </div>
      <div class="container-fluid bottom-container pl-5 pr-5" style="z-index: 10;">
        <div class="row">
          <div class="col-md-4">
            <chat-io v-bind:socket="socket" env="game" ref="chat"></chat-io>
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
                <action-button ref="actionBtn" v-once></action-button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Overview card -->
      <div class="overview-card" data-id>
        <div class="header"></div>
        <div class="content"></div>
        <div class="buy-button btn stylized" data-toggle="modal" data-target="#buyModal">ACHETER</div>
        <div
          class="sell-button btn stylized"
          style="display: none;"
          data-toggle="modal"
          data-target="#sellModal"
        >VENDRE</div>
        <div class="mortgage-button btn stylized" style="display: none;">HYPOTHÉQUER</div>
        <div class="buyback-button btn stylized" style="display: none;">RACHETER</div>
      </div>

      <div
        class="modal"
        id="buyModal"
        tabindex="-1"
        role="dialog"
        aria-labelledby="buyModalLabel"
        aria-hidden="true"
        data-id="1"
      >
        <div class="modal-dialog animated bounceIn" role="document">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title" id="buyModalLabel">Proposer un prix</h5>
              <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                <span aria-hidden="true">&times;</span>
              </button>
            </div>
            <form id="overviewCardBuyForm">
              <div class="modal-body">
                <div class="form-group">
                  <input type="hidden" id="overviewCardBuyFormPropertyId" />
                  <input
                    type="text"
                    class="form-control"
                    id="overviewCardBuyFormPrice"
                    aria-describedby="helpId"
                    placeholder="Votre prix ici..."
                  />
                </div>
              </div>
              <div class="modal-footer">
                <!--<button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button>-->
                <button type="button" class="btn btn-primary send">Envoyer</button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <div
        class="modal"
        id="sellModal"
        tabindex="-1"
        role="dialog"
        aria-labelledby="sellModalLabel"
        aria-hidden="true"
        data-id="1"
      >
        <div class="modal-dialog animated bounceIn" role="document">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title" id="sellModalLabel">Proposer un prix</h5>
              <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                <span aria-hidden="true">&times;</span>
              </button>
            </div>
            <form id="overviewCardSellForm">
              <div class="modal-body">
                <div class="form-group">
                  <input type="hidden" id="overviewCardSellFormPropertyId" />
                  <input
                    type="text"
                    class="form-control"
                    id="overviewCardSellFormPrice"
                    aria-describedby="helpId"
                    placeholder="Votre prix ici..."
                  />
                </div>
              </div>
              <div class="modal-footer">
                <!--<button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button>-->
                <button type="button" class="btn btn-primary send">Envoyer</button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <!-- Popup d'Enchères -->
      <div id="bid-popup-container">
        <div v-for="bid in bids" :key="bid.bidID" class="bid-popup">
          <div class="bid-form">
            <div class="content">Une enchère est lancée pour {{bid.propertyName}}</div>
            <div class="bid-input">
              <input type="text" placeholder="Prix">€
              <button disabled='disabled' class="bid-validation" v-on:click="sendBid(bid.bidID)">Enchérir</button>
              <button class="bid-cancel" v-on:click="rejectBid(bid.bidID)">Passer</button>
            </div>
          </div>
        </div>
      </div>

      <!-- Dices -->
      <dices ref="dices" v-once></dices>

      <splash-text ref="splashText" v-once></splash-text>

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
    <game-settings-modal :socket="socket" :loggedUser="loggedUser" env="game"></game-settings-modal>
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
// import JQuery from 'jquery'

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
      players: [
        {
          nickname: "",
          money: 0,
          properties: []
        }
      ],
      cells: [],
      properties: [],
      gameEndTime: null,
      turnNotifications: [],
      currentPlayerID: 0,
      audio: {
        background: null,
        sfx: {}
      },
      offers: [
        {
          buyerNickname: "Moi",
          propertyName: "blabla",
          price: 100,
          offerID: 1
        },
        {
          buyerNickname: "Moi2",
          propertyName: "une autre rue",
          price: 200,
          offerID: 2
        }
      ],
      bids: [
        {
          propertyName: "Test",
          bidID: 1
        },
        {
          propertyName: "Test2",
          bidID: 2
        }
      ]
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

    sendBid(bidID) {
      alert('sendBid' + bidID);
    },

    rejectBid(bidID) {
      alert('rejectBid' + bidID);
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
        volume: this.loggedUser.settings.sfxLevel
      });
      this.audio.sfx.cashRegister = new Howl({
        src: ["/assets/audio/sfx/cash-register-youtube-gaming-sound-fx.mp3"],
        autoplay: false,
        loop: false,
        volume: this.loggedUser.settings.sfxLevel
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
        // alert('board ready');
        this.socket.emit('gameReadyReq');
    },

    /**
     * Quitter volontairement la partie
     */
    quitGame() {
      this.socket.emit("gamePlayerLeavingReq");
      this.socket.on("gamePlayerLeavingRes", res => {
        if (res.error === 0) this.$router.push("Lobby");
        else this.$parent.toast(res.status, "danger", 5);
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
        } else if (data.asyncRequestType == "canUpgrade") {
          // le prix d'amélioration CUMULÉ selon le niveau désiré, si niveau déjà aquis ou pas les moyens => vaut null
          // let level1Price = data.asyncRequestArgs[0];
          // let level2Price = data.asyncRequestArgs[1];
          // let level3Price = data.asyncRequestArgs[2];
          // let level4Price = data.asyncRequestArgs[3];
          // let level5price = data.asyncRequestArgs[4];
          // createUpgradeCard(property.id, property.color, property.name, (currPlayer.id != ID));
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
              return this.gameActionResAfterSecondMovement(data);
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
    this.socket.disconnect();
  },
  mounted() {
    
    this.playMusic();
    this.loadSfx();

    // let $ = JQuery
    this.loading = false; // DEBUG
    this.players = [];
    const gameboard = this.$refs.gameboard;

    console.log(gameboard);

    // setInterval(() => {
    //     this.players[0].money += 100;
    //     this.$set(this.players, 0, this.players[0]);
    // }, 1000);

    // gameboard.loaderPawn('montgolfiere', 0);
    // gameboard.loaderPawn('boat', 0);

    // setTimeout(() => {
    //     gameboard.movement('boat', 5, () => {
    //         gameboard.movement('montgolfiere', 10, () => {});
    //     });
    // }, 3000)

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
    this.socket.on('gameReconnectionRes', (data) => {
        console.log(' --- RECONNEXION DATA');
        console.log(data);

        this.players = data.players;
        this.cells = data.cells;
        this.properties = data.properties;
        this.gameEndTime = data.gameEndTime;

        // Génération de la liste de joueurs
        this.players.forEach((player, index) => {
            gameboard.loaderPawn(this.CST.PAWNS[player.pawn], player.cellPos);
            player.color = this.CST.PLAYERS_COLORS[index];
            player.isInJail = false;
            // player.properties = [];
            this.$set(player, 'properties', []);
        });

        for (const i in this.properties) {
            // this.properties[i].level = 0;
            // this.properties[i].ownerID = null;
            if (this.properties[i].ownerID) {
                console.log()
                const player = this.getPlayerById(this.properties[i].ownerID);
                if (player) {
                    console.log(`=== PROPERTY ${this.properties[i].name} belongs to ${player.nickname}`);
                    player.properties.push(this.properties[i]);
                }
            }
        }

        data.players.forEach((player, index) => {
            player.properties.forEach((playerProperty) => {
                console.log("PROPERTY");
                console.log(playerProperty);    
                let property = this.getPropertyById(playerProperty);
                if (property) {
                    property.ownerID = player.id;
                    // MANQUE ACCÈS A LA COULEUR DU JOUEUR
                    let cell = this.getCellByProperty(property)
                    gameboard.loaderFlag("d" + cell.id, player.color);
                    this.players[index].properties.push(property);
                    // if (property.type == "publicCompany") {
                    //     createProperty(player.id, 'company', property.name, property.id);
                    // } else if (property.type == "trainStation") {
                    //     createProperty(player.id, 'station', property.name, property.id);
                    // } else {
                    //     createProperty(player.id, property.color, property.name, property.id);
                    // }
                }
            });
        });

        data.chatMessages.forEach((msg) => {
            this.$refs.chat.messages.push({
                senderUserID: msg.playerID,
                content: msg.text,
                createdTime: msg.createdTime
            });
        });

        /**
         * Reste à gérer à la reconnexion :
         * - bids
         * - offers
         * - couleur des cases pour celles déjà achetées
         */

        // hideLoaderOverlay();

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
            player.properties.push(property);
            console.log(player.properties);
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

    // On a reçue une offre d'achat
    this.socket.on("gameOfferReceiveRes", (res) => {
        this.offers.push({
          buyerNickname: this.idToNick(res.makerID),
          propertyName: this.getPropertyById(res.propertyID).name,
          price: res.price,
          offerID: res.offerID
        });
        // addPurchaseOffer(res.offerID, idToNick(res.makerID), idToNick(res.receiverID), getPropertyById(res.propertyID).name, res.price);
    });


    this.socket.on("gameOfferAcceptRes", (res) => {
        if (res.error === 0)
            console.log("gameOfferAcceptRes")
        else
            this.$parent.toast(`Erreur : ${res.status}`, 'danger', 5);
    });

    // Fin de partie
    this.socket.on('gameEndRes', (res) => {
        if (this.loading) return;

        const winner = this.getPlayerById(res.winnerID);
        const type = res.type; // 'failure' (dernier en vie) ou 'timeout'
        const duration = res.duration * 1.66667e-5; // durée totale du jeu en minutes

        alert('Fin de la partie (' + type + ') après ' + duration + ' minutes de jeu');
        alert(winner.nickname + ' a gagné, félicitations !');
        this.stopMusic();

        setTimeout(() => {
            this.$router.push('Lobby');
        }, 500);
    });

    // Un joueur quitte la prtie
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

  }
};
</script>