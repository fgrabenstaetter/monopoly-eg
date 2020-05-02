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
                <div class="message">{{offer.buyerNickname}} propose de vous acheter {{offer.propertyName}} pour {{offer.price}}€</div>
                <div class="form">
                  <button @click="offerAccept(offer.offerID)">Accepter</button>
                  <button @click="rejectOffer(offer.offerID)">Refuser</button>
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
            <chat-io env="game" ref="chat"></chat-io>
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
                        <!-- <button class="btn btn-primary" v-if="imCurrentPlayer" @click="discardTurnNotif(index)">OK</button> -->
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
                          v-if="imCurrentPlayer"
                          @click="saleCardBuyProperty(index)"
                        >ACHETER</button>
                        <button
                          class="btn btn-secondary reject"
                          v-if="imCurrentPlayer"
                          @click="discardTurnNotif(index)"
                        >NE RIEN FAIRE</button>
                      </div>
                    </div>
                  </div>

                  <div v-if="notif.type == 'bonusJail'" class="card notification event">
                    <div class="card-body" :class="{'no-header': !notif.title}">
                      <div class="col-md-12 text-center value">
                        <p>Voulez-vous utiliser votre bonus « Sortir du Parlement » ?</p>
                      </div>
                      <button v-if="imCurrentPlayer" @click="acceptUseBonusJail(index)" class="btn btn-primary accept-btn">Oui</button>
                      <button v-if="imCurrentPlayer" @click="discardTurnNotif(index)" class="btn btn-primary deny-btn">Non</button>
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
                    <input v-model="bid.myPrice" :disabled="bid.disabled" type="text" @keypress="isNumber($event)" placeholder="Prix">€
                    <button :disabled="bid.disabled" type="submit" class="bid-validation">Enchérir</button>
                    <button :disabled="bid.disabled" class="bid-cancel" @click="rejectBid(bid)">Passer</button>
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
      <div v-if="endGame" class="end-game-background">
        <div class="pyro">
          <div class="before"></div>
          <div class="after"></div>
        </div>
      </div>
      <div v-if="endGame" class="end-game-screen">
        <div class="header">
          <div class="winner">{{endGame.winnerNickname}}</div>
        </div>
        <div class="content">
          <div class="subtitle">a gagné la partie !</div>
          <div class="info">
            <div class="label">Temps de jeu</div>
            <div class="value">{{endGame.gameTime}}</div>
          </div>
          <router-link to="/lobby" class="btn stylized">Revenir au lobby</router-link>
        </div>
      </div>
    </div>

    <!-- Resolution overlay -->
    <div class="resolution-overlay-container">
      <div>
        Oups... c'est petit ici
        <br />Pense à étendre la fenêtre du jeu pour en profiter pleinement!
      </div>
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

/**
 * @vuese
 * @group Views
 * Ecran de jeu dans lequel se déroule une partie (contenant HUD, plateau, chat, etc.)
 */
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
      // @vuese
      // Indique si le jeu a été 'mounted' (écran chargé) par Vue
      gameMounted: false,
      // @vuese
      // Constantes du jeu (pions, couleurs des joueurs, etc.)
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
          { name: 'yellow', hex: '#FDFF00' },
          { name: 'red', hex: '#d43333' },
          { name: 'blue', hex: '#006aff' },
          { name: 'green', hex: '#22d406' },
          { name: 'white', hex: '#FFFFFF' },
          { name: 'purple', hex: '#F576F4' },
          { name: 'cyan', hex: '#59FFFF' },
          { name: 'orange', hex: '#F8A100' }
          // "yellow",
          // "#d43333",
          // "#006aff",
          // "#22d406",
          // "white",
          // "violet",
          // "cyan",
          // "orange"
        ],
        CELL_PRISON: 10
      },
      // @vuese
      // Affiche l'écran de chargement
      loading: true,
      // @vuese
      // Utilisateur connecté (chargé depuis le store Vuex)
      loggedUser: this.$store.getters.loggedUser,
      // @vuese
      // socket client utilisé pour les communications
      socket: null,
      // @vuese
      // Liste des joueurs dans la partie (envoyée par le serveur)
      players: [],
      // @vuese
      // Liste des cellules du plateau de jeu (envoyée par le serveur)
      cells: [],
      // @vuese
      // Liste des propriétés du plateau de jeu (envoyée par le serveur)
      properties: [],
      // @vuese
      // Somme remportée par un joueur lorsqu'il passe par la case départ (envoyée par le serveur)
      moneyFromStart: null,
      // @vuese
      // Timestamp de fin de la partie (envoyé par le serveur)
      gameEndTime: null,
      // @vuese
      // Temps restant avant la fin de la partie
      gameRemainingTime: null,
      // @vuese
      // Timer (contenant un setInterval()) de la partie
      gameTimer: null,
      // @vuese
      // Notifications du tour en cours (apparaissent sur la droite de l'écran)
      turnNotifications: [],
      // @vuese
      // Identifiant du joueur courant
      currentPlayerID: 0,
      // @vuese
      // Flag indiquant si l'on souhaite utiliser notre carte bonus "Sortir du parlement" lors du prochain lancé de dés
      useBonusJail: false,
      // @vuese
      // Liste des offres d'achat reçues de la part d'autres joueurs
      offers: [],
      // @vuese
      // Liste d'enchères en cours
      bids: [],
      // @vuese
      // Ressources audio du jeu
      audio: {
        background: null,
        sfx: {
          rollDices: null,
          cashRegister: null,
          buttonClick: null
        }
      },
      // @vuese
      // Indique si la partie est terminée (affiche l'écran de fin si true)
      endGame: false
    };
  },
  computed: {
    imCurrentPlayer: function() {
      return this.currentPlayerID === this.loggedUser.id;
    }
  },
  methods: {
    /**
     * @vuese
     * Récupère l'ID d'un joueur à partir de son pseudo (null si non trouvé)
     * @arg Le pseudo du joueur
     */
    nickToId(nick) {
      for (const i in this.players) {
        if (this.players[i].nickname == nick) return this.players[i].id;
      }
      return null;
    },

    /**
     * @vuese
     * Récupère le pseudo d'un joueur à partir de son ID (null si non trouvé)
     * @arg L'ID du joueur
     */
    idToNick(id) {
      for (const i in this.players) {
        if (this.players[i].id == id) return this.players[i].nickname;
      }
      return null;
    },

    /**
     * @vuese
     * Récupère un objet 'player' (joueur) à partir de son ID (null si non trouvé)
     * @arg L'ID du joueur
     */
    getPlayerById(id) {
      for (const i in this.players) {
        if (this.players[i].id == id) return this.players[i];
      }
      return null;
    },

    /**
     * @vuese
     * Récupère un objet 'cell' (case du plateau) à partir de son ID (null si non trouvé)
     * @arg L'ID de la case
     */
    getCellById(id) {
      for (const i in this.cells) {
        if (this.cells[i].id == id) return this.cells[i];
      }
      return null;
    },

    /**
     * @vuese
     * Récupère un objet 'property' (propriété) à partir de son ID (null si non trouvé)
     * @arg L'ID de la propriété
     */
    getPropertyById(id) {
      for (const i in this.properties) {
        if (this.properties[i].id == id) return this.properties[i];
      }
      return null;
    },

    /**
     * @vuese
     * Récupère un objet 'property' (propriété) à partir de l'ID d'une 'cell' (case du plateau) (null si non trouvé)
     * @arg L'ID de la case dont on souhaite récupérer la propriété "associée"
     */
    getPropertyByCellId(cellId) {
      let cell = this.getCellById(cellId);
      for (const i in this.properties) {
        if (this.properties[i].id == cell.propertyID) return this.properties[i];
      }
      return null;
    },

    /**
     * @vuese
     * Récupère un objet 'cell' (case du plateau) à partir d'une 'property' (propriété)
     * @arg La propriété dont on souhaite récupérer la case
     */
    getCellByProperty(property) {
      for (const i in this.cells) {
        if (this.cells[i].propertyID == property.id) return this.cells[i];
      }
      return null;
    },

    /**
     * @vuese
     * Met en place le timer de la partie
     * @arg Le timestamp de fin de la partie (en ms)
     */
    initGameTimer(gameEndTime) {
      if (!gameEndTime) return;

      const timeMs = gameEndTime - Date.now();

      let seconds = Math.floor((timeMs / 1000) % 60),
          minutes = Math.floor((timeMs / (1000 * 60)) % 60),
          hours = Math.floor((timeMs / (1000 * 60 * 60)) % 24);
        
      minutes += 60 * hours;

      this.gameRemainingTime = {min: minutes, sec: seconds};
      
      if (!this.gameTimer) {
        this.gameTimer = setInterval(() => {
          if (this.gameRemainingTime.min > 0 && this.gameRemainingTime.sec >= 0) {
            this.$set(this.gameRemainingTime, 'sec', this.gameRemainingTime.sec - 1);
            if (this.gameRemainingTime.sec == -1) {
              this.$set(this.gameRemainingTime, 'sec', 59);
              this.$set(this.gameRemainingTime, 'min', this.gameRemainingTime.min - 1);
            }
          } else {
            clearInterval(this.gameTimer);
          }
        }, 1000)
      }
    },

    /**
     * @vuese
     * Envoie une requête de lancement de dés
     */
    gameRollDiceReq() {
      if (!this.imCurrentPlayer) return;
      this.turnNotifications = [];
      this.socket.emit("gameRollDiceReq", { useExitJailCard: this.useBonusJail });
      this.useBonusJail = false;
    },

    /**
     * @vuese
     * Signale la fin de notre tour de jeu (pour pouvoir manuellement passer la main au joueur suivant)
     */
    gameTurnEndReq() {
      if (!this.imCurrentPlayer) return;
      this.socket.emit("gameTurnEndReq");
    },

    /**
     * @vuese
     * Supprime une notification de tour ('turn notification') de la liste des notifications (et donc du HUD)
     * @arg L'index de la notification à supprimer
     */
    discardTurnNotif(index) {
      this.audio.sfx.buttonClick.play();
      if (!this.imCurrentPlayer) return;
      this.turnNotifications.splice(index, 1);
    },

    /**
     * @vuese
     * Envoi une requête d'achat (après être tombé sur la case d'un terrain vierge) et supprime la notification associée
     * @arg L'index de la notification concernée
     */
    saleCardBuyProperty(notifIndex) {
      if (!this.imCurrentPlayer) return;
      this.socket.emit("gamePropertyBuyReq");
      this.turnNotifications.splice(notifIndex, 1);
    },

    /**
     * @vuese
     * Indique que l'on utilisera notre carte bonus "Sortir du parlement" au prochain lancement de dés
     * @arg L'index de la notification concernée (qui sera supprimée)
     */
    acceptUseBonusJail(notifIndex) {
      this.useBonusJail = true;
      this.discardTurnNotif(notifIndex);
    },

    /**
     * @vuese
     * Efface une offre d'achat faite par un autre joueur dans notre liste
     * @arg L'ID de l'offre concernée (et non pas l'index !)
     */
    discardOffer(offerID) {
        for (const i in this.offers) {
            if (this.offers[i].offerID == offerID) {
                this.offers.splice(i, 1);
                return;
            }
        }
    },

    /**
     * @vuese
     * Refuse une offre d'achat faite par un autre joueur
     * @arg L'ID de l'offre concernée
     */
    rejectOffer(offerID) {
      this.audio.sfx.buttonClick.play();
      this.socket.emit('gameOfferActionReq', { offerID: parseInt(offerID), accept: false });
      console.log('gameOfferActionReq reject');
      this.discardOffer(offerID);
    },

    /**
     * @vuese
     * Accepte une offre d'achat faite par un autre joueur et supprime la notification associée
     * @arg L'ID de l'offre concernée
     */
    offerAccept(offerID) {
      this.audio.sfx.buttonClick.play();
      this.socket.emit('gameOfferActionReq', { offerID: parseInt(offerID), accept: true });
      console.log('gameOfferActionReq accept');
      this.discardOffer(offerID);
    },

    /**
     * @vuese
     * Envoi notre participation à une enchère en cours
     * @arg L'objet 'bid' contenant l'enchère à laquelle on participe
     */
    sendBid(bid) {
      if (!bid.myPrice) return;
      const myPrice = parseInt(bid.myPrice);
      const myPlayer = this.getPlayerById(this.loggedUser.id);
      if (!myPlayer) return;

      if (myPrice < bid.startingPrice) {
        this.$parent.toast(`Votre enchère doit être ≥ ${bid.startingPrice}€`, 'danger', 3);
        return;
      } else if (myPrice > myPlayer.money) {
        this.$parent.toast(`Vous n'avez pas autant d'argent !`, 'danger', 3);
        return;
      }

      this.socket.emit('gameOverbidReq', { bidID: bid.bidID, price: parseInt(myPrice) });
      this.$set(bid, 'disabled', true);
    },

    /**
     * @vuese
     * Rejette la participation à une enchère ("passer" l'enchère) et envoie une participation à 0€ au serveur
     * @arg L'objet 'bid' contenant l'enchère que l'on souhaite passer
     */
    rejectBid(bid) {
      this.audio.sfx.buttonClick.play();
      this.socket.emit('gameOverbidReq', { bidID: bid.bidID, price: 0 });
      this.$set(bid, 'disabled', true);
    },

    /**
     * @vuese
     * Lance la musique de fond du jeu
     */
    playMusic() {
      this.audio.background = new Howl({
        src:
          "/assets/audio/musics/on-my-way-by-kevin-macleod-from-filmmusic-io.mp3",
        volume: this.loggedUser.settings.musicLevel / 100,
        autoplay: true,
        loop: true
      });
    },

    /**
     * @vuese
     * Modifie le volume de la musique
     * @arg Pourcentage du volume (entier de 0 à 100)
     */
    setMusicLevel(level) {
        this.audio.background.volume(level / 100);
    },

    /**
     * @vuese
     * Coupe la musique de fond (en fondu)
     */
    stopMusic() {
      this.audio.background.fade(this.audio.background.volume(), 0, 500);
      this.audio.background.stop();
    },

    /**
     * @vuese
     * Précharge tous les effets sonores (SFX) du jeu
     */
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
      this.audio.sfx.buttonClick = new Howl({
        src: ['/assets/audio/sfx/buttonClick.mp3'],
        autoplay: false,
        loop: false,
        volume: this.loggedUser.settings.sfxLevel / 100
      });
    },

    /**
     * @vuese
     * Modifie le volume des effets sonores
     * @arg Pourcentage du volume (entier de 0 à 100)
     */
    setSfxLevel(level) {
      for (let [key] of Object.entries(this.audio.sfx)) {
        if (typeof this.audio.sfx[key].volume === 'function')
          this.audio.sfx[key].volume(level / 100);
      }
    },

    /**
     * @vuese
     * Indique au serveur que l'on est prêt à commencer la partie côté client (et donc à recevoir les sockets du serveur)
     */
    gameReady() {
        console.log('boardReady');
    },

    /**
     * @vuese
     * Ajoute une offre d'achat à notre liste
     * @arg L'offre à ajouter (objet 'offer')
     */
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
      }
    },

    /**
     * @vuese
     * Ajoute une enchère à notre liste
     * @arg Enchère à ajouter (objet 'bid')
     */
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
     * @vuese
     * Quitte volontairement la partie et de manière définitive (en le signalant au serveur)
     */
    quitGame() {
      this.socket.emit("gamePlayerLeavingReq");
      this.socket.on("gamePlayerLeavingRes", res => {
        if (res.error === 0) {
          this.$refs.gameSettings.closeModal();
          setTimeout(() => {
            this.$router.push("/lobby");
          }, 800);
        } else {
          this.$parent.toast(res.status, "danger", 5);
        }
      });
    },

    /**
     * @vuese
     * Continue le tour de jeu (gameActionRes) après le premier déplacement
     * @arg data : données de gameActionRes ; currPlayer : joueur courant ; cellPos2 : position #2 (le cas échéant)
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
          this.turnNotifications.push({
            title: 'Attention !',
            content: 'Plus assez d\'argent : vous devez hypothéquer avant la fin de votre tour !',
            type: 'text'
          });
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
          type: 'text'
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

        if (typeof data.extra.gainMoneyFromStart !== "undefined") {
          this.turnNotifications.push({
              type: 'text',
              title: 'Case départ',
              color: 'green',
              content: `${currPlayer.nickname} gagne ${this.moneyFromStart}€ en passant par la case départ`
          });
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

              if (currPlayer.id == this.loggedUser.id) {
                this.$refs.actionBtn.progressSetStateTerminer();
              }

              return this.gameActionResAfterSecondMovement(data);
            }, 800);
          }, 800);
        }
      }

      if (cellPos2 !== null && cellPos2 != currPlayer.cellPos) {
        this.$refs.gameboard.movement(
          this.CST.PAWNS[currPlayer.pawn],
          cellPos2.toString(),
          () => {
            currPlayer.cellPos = cellPos2;
            this.gameActionResAfterSecondMovement(data);
          }
        );
      } else {
        this.gameActionResAfterSecondMovement(data);
      }
    },

    /**
     * @vuese
     * Termine le gameActionRes (et vérifie si un double a été fait avec les dés)
     * @arg Données de 'gameActionRes'
     */
    gameActionResAfterSecondMovement(data) {
      if (data.playerID === this.loggedUser.id)
        this.$refs.actionBtn.progressReset(false);

      console.log("=== fin gameActionRes ===");
    },

    isNumber(evt) {
      evt = (evt) ? evt : window.event;
      var charCode = (evt.which) ? evt.which : evt.keyCode;
      if (charCode < 48 || charCode > 57)
        evt.preventDefault();
    }
  },
  beforeDestroy() {
    this.stopMusic();
    this.socket.close();
  },
  mounted() {
    this.socket = io.connect(this.$store.getters.serverUrl, {
            query: "token=" + this.$store.getters.jwt,
            path: "/socket.io",
            secure: true
      });

    this.gameMounted = true;

    this.$refs.chat.initSocket();

    this.playMusic();
    this.loadSfx();

    // this.loading = false; // DEBUG
    this.players = [];
    const gameboard = this.$refs.gameboard;


    this.$parent.initSocketConnexion(this.socket);

    this.socket.on('gameStartedRes', (data) => {

        this.players = data.players;
        this.cells = data.cells;
        this.properties = data.properties;
        this.moneyFromStart = data.moneyFromStart;
        this.gameEndTime = data.gameEndTime;
        this.initGameTimer(this.gameEndTime);

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
            this.$set(player, 'nbJailEscapeCards', 0);
            this.$set(player, 'properties', []);
            this.$set(player, 'money', data.playersMoney);
            this.$set(player, 'failure', false);
            this.$set(player, 'hasLeft', false);
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
        this.moneyFromStart = res.moneyFromStart;
        this.gameEndTime = res.gameEndTime;
        this.initGameTimer(this.gameEndTime);

        for (const i in this.properties)
            this.properties[i].ownerID = null;

        // Génération de la liste de joueurs
        this.players.forEach((player, index) => {
            player.color = this.CST.PLAYERS_COLORS[index];

            if (player.hasLeft || player.failure) return; // Ne pas charger son pion, propriétés, etc.

            gameboard.loaderPawn(this.CST.PAWNS[player.pawn], player.cellPos);

            for (const i in player.properties) {
              const propertyObj = this.getPropertyById(player.properties[i]);
              const cell = this.getCellByProperty(propertyObj)
              if (propertyObj && cell)
                gameboard.loaderFlag(cell.id, player.color.hex);

                if (propertyObj.level == 5) {
                  gameboard.loaderHotelProperty(cell.id);
                } else if (propertyObj.level != 0) {
                  for (let i = 1; i <= propertyObj.level; i++)
                    gameboard.loaderHouseProperty(cell.id, i);
                }

                if (propertyObj.isMortgaged)
                  gameboard.loaderHypotheque(cell.id);
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
            if (data.dicesRes[0] != data.dicesRes[1]) {
              this.$refs.actionBtn.progressSetStateTerminer();
            } else {
              const turnTimeSeconds = Math.floor((data.turnEndTime - Date.now()) / 1000);
              this.$refs.actionBtn.progressSetStateRelancer();
              this.$refs.actionBtn.progressStart(turnTimeSeconds);
            }
        }

        if (currPlayer.isInJail) {
          if (currPlayer.isInJail >= 3) { // Sortie de prison
              if (currPlayer.id == this.loggedUser.id)
                this.$parent.toast('Votre session au parlement est terminée !', 'success', 3);
              currPlayer.isInJail = false;
          } else {
            currPlayer.isInJail++; // On augmente le nb de tours du joueur en prison

            if (currPlayer.nbJailEscapeCards > 0)
              this.turnNotifications.push({ type: 'bonusJail' }); // Proposer au joueur d'utiliser sa carte 'sortie de prison'
          }
        }

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

    this.socket.on('gameRollDiceReq', (err) => {
      if (err.code !== 0) {
        this.$parent.toast(`Erreur : ${err.status}`, 'danger', 5);
      }
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
            gameboard.loaderFlag(cell.id, player.color.hex);

            if (data.playerMoney != player.money) {
                this.audio.sfx.cashRegister.play();
                this.$set(player, 'money', data.playerMoney);
            }

            // Retirer la notificationCard chez tous les autres joueurs (après animation du bouton ACHETER)
            this.turnNotifications = [];
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
        console.log(res);

        const player = this.getPlayerById(res.playerID);
        if (!player) return;
        
        this.$set(player, 'failure', true);

        this.$refs.splashText.trigger(`<i class="fas fa-skull-crossbones"></i><br>${player.nickname} a fait faillite !`, '#DB1311');

        // Toutes les propriétés sont à nouveau à vendre
        // Suppr propriétés
        for (const i in player.properties) {
          const property = this.getPropertyById(player.properties[i]);
          if (property) {
            this.$set(property, 'ownerID', null);
            const cell = this.getCellByProperty(property);
            if (cell) gameboard.deleteFlag(cell.id);

            if (property.isMortgaged)
              gameboard.deleteHypotheque(cell.id);
          }
        }
        this.$set(player, 'properties', []);

        // Suppression du pion
        gameboard.deletePawn(this.CST.PAWNS[player.pawn]);

        // Suppr pion
        gameboard.deletePawn(this.CST.PAWNS[player.pawn]);
    });

    // On a reçu une offre d'achat
    this.socket.on("gameOfferReceiveRes", (res) => {
        this.pushGameOfferReceive(res);
    });

    // Offre accpeptée check
    this.socket.on("gameOfferActionRes", (res) => {
        if (res.error === 0)
            console.log("gameOfferActionRes")
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
      const receiver =  this.getPlayerById(res.receiverID);
      const property = this.getPropertyById(res.propertyID);
      const cell = this.getCellByProperty(property);

      if (!buyer || !receiver || !property || !cell) return;

      if (res.accepted) {
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

        // Transfert de drapeau
        gameboard.deleteFlag(cell.id);
        gameboard.loaderFlag(cell.id, buyer.color.hex);

        // Notifications
        if (receiver.id == this.loggedUser.id) {
          this.$parent.toast(`Vous avez vendu ${property.name} à ${buyer.nickname} !`, 'success', 4);
        } else if (buyer.id == this.loggedUser.id) {
          this.$parent.toast(`${receiver.nickname} a accepté de vous vendre ${property.name} pour ${res.price}€`, 'success', 5);
        }
      } else {
        // Notifications (de refus)
        if (receiver.id == this.loggedUser.id) {
          this.$parent.toast(`La proposition d'achat de ${buyer.nickname} pour ${property.name} a expiré`, 'danger', 4);
        } else if (buyer.id == this.loggedUser.id) {
          this.$parent.toast(`${receiver.nickname} a refusé de vous vendre ${property.name} pour ${res.price}€`, 'danger', 5);
          // this.$parent.toast(`La proposition d'achat de ${buyer.nickname} pour ${property.name} a expiré`, 'danger', 5);
        }
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

      this.turnNotifications.push({
          type: 'text',
          title: 'Amélioration',
          color: 'green',
          content: `${player.nickname} a édité ses propriétés !`
      });

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
          if (property.level == 5) {
              for (let k = 1; k <= oldLevel; k++) {
                gameboard.deleteHouse(cell.id, k);
              }
              gameboard.loaderHotelProperty(cell.id);
          } else {
            for (let i = oldLevel + 1; i <= property.level; i++)
              gameboard.loaderHouseProperty(cell.id, i);
          }

          // if (property.level == 1) {
          //     gameboard.loaderHouseProperty(cell.id, 1);
          // } else if (property.level == 2) {
          //     if (oldLevel < 1) gameboard.loaderHouseProperty(cell.id, 1);

          //     gameboard.loaderHouseProperty(cell.id, 2);
          // } else if (property.level == 3) {
          //     if (oldLevel < 1) gameboard.loaderHouseProperty(cell.id, 1);
          //     if (oldLevel < 2) gameboard.loaderHouseProperty(cell.id, 2);

          //     gameboard.loaderHouseProperty(cell.id, 3);
          // } else if (property.level == 4) {
          //     if (oldLevel < 1) gameboard.loaderHouseProperty(cell.id, 1);
          //     if (oldLevel < 2) gameboard.loaderHouseProperty(cell.id, 2);
          //     if (oldLevel < 3) gameboard.loaderHouseProperty(cell.id, 3);

          //     gameboard.loaderHouseProperty(cell.id, 4);
          // } else if (property.level == 5) {
          //     for (let k = 0; k < oldLevel; k++) {
          //       gameboard.deleteHouse(cell.id, k+1);
          //     }
          //     gameboard.loaderHotelProperty(cell.id);
          // }
        } else {
          // Détruire les maisons / hotel
          if (oldLevel == 5) {
              gameboard.deleteHotel(cell.id);
              for (let k = 1; k <= property.level; k++) {
                gameboard.loaderHouseProperty(cell.id, k);
              }
          } else {
            for (let i = oldLevel; i > property.level; i--)
              gameboard.deleteHouse(cell.id, i);
          }
        }
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
        console.log(res);
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
              if (oldOwner) {
                const propertyIndex = oldOwner.properties.indexOf(property.id);
                if (propertyIndex > -1) oldOwner.properties.splice(propertyIndex, 1);
                
                gameboard.deleteFlag(cell.id);

                if (res.propertyOldOwnerMoney)
                  this.$set(oldOwner, 'money', res.propertyOldOwnerMoney);
              }
            }

            // Attribution du propriété au vainqueur de l'enchère
            const winner = this.getPlayerById(res.playerID);
            if (winner) {
              this.$set(bid, 'textContent', `Le joueur ${winner.nickname} a remporté l'enchère pour ${res.price}€ !`);

              property.ownerID = res.playerID;
              winner.properties.push(property.id);

              gameboard.loaderFlag(cell.id, winner.color.hex);

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

    this.socket.on("gamePropertyMortgagedRes", (res) => {
        console.log('GAME FORCED MORTGAGE RES !!!!!!!!!!!!!!!!!!!!!!!!!!!');
        console.log(res);
    });

    // Hypothèque OK
    this.socket.on("gamePropertyMortgagedRes", (res) => {
        console.log("gamePropertyMortgagedRes");
        console.log(res);

        const player = this.getPlayerById(res.playerID);
        if (!player) return;

        this.$set(player, 'money', res.playerMoney);
        let mortgagedPropertiesNames = [];
        for (const i in res.properties) {
            const property = this.getPropertyById(res.properties[i]);
            const cell = this.getCellByProperty(property);
            if (!property || ! cell) continue;

            // Modifier "isMortgaged" dans la liste globale des propriétés
            this.$set(property, 'isMortgaged', true);

            // Cône plateau
            gameboard.loaderHypotheque(cell.id);

            // Ajout aux propriétés hypothéquées
            mortgagedPropertiesNames.push(property.name);
        }

        if (player.id == this.loggedUser.id) {
          const autoStr = res.auto ? ' automatiquement' : '';
          if (mortgagedPropertiesNames.length == 1) {
            this.$parent.toast(`Propriété ${mortgagedPropertiesNames[0]} hypothéquée${autoStr}`, 'success', 3);
          } else {
            this.$parent.toast(`Propriétés hypothéquées${autoStr} : ${mortgagedPropertiesNames.join(', ')}`, 'success', 5);
          }
        }
    });

    // En cas d'hypothèque forcée (si un paiement doit être fait)
    this.socket.on('gameForcedMortgageRes', (res) => {
      this.$parent.toast(`Hypothèque forcée : ${res.message}`, 'danger', 5);
      
      const player = this.getPlayerById(res.playerID);
      if (!player) return;
      this.$set(player, 'money', res.playerMoney);

      if (res.rentalOwner) {
        const rentalOwner = this.getPlayerById(res.rentalOwner.id);
        if (!rentalOwner) return;
        this.$set(rentalOwner, 'money', res.rentalOwner.money);
      } 
    })

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
        const cell = this.getCellByProperty(property);

        if (!player || !property || !cell) return;

        this.$set(player, 'money', res.playerMoney);
        this.$set(property, 'isMortgaged', false);

        gameboard.deleteHypotheque(cell.id);

        if (player.id == this.loggedUser.id)
          this.$parent.toast(`Hypothèque levée pour ${property.name}`, 'success', 4);
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
        if (!player)  return;

        console.log('PLAYER LEFT IS')
        console.log(player);

        // Notification
        this.$refs.chat.messages.push({
            senderUserID: -1,
            content: `${player.nickname} a quitté la partie :/`,
            createdTime: new Date()
        });

        this.$set(player, 'hasLeft', true);
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


    setTimeout(() => {
      console.log('gameReadyReq');
      this.socket.emit('gameReadyReq');
    }, 1000);

  }
};
</script>
