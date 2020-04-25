<template>
  <div class="game">
    <div class="background-container"></div>
    <div class="board-container">
      <gameboard ref="gameboard"></gameboard>
    </div>
    <div class="ingame-ui-container">
      <div class="container-fluid players-list-container pl-5 pr-5">
        <div class="player-list">
            <player-entry v-for="player in players" :key="player.id" v-bind:player="player" v-bind:isCurrent="currentPlayerID == player.id"></player-entry>
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


                <div v-for="(notif, index) in turnNotifications" :key="index" class="card notification event">

                    <div v-if="notif.type == 'text'">
                        <div v-if="notif.title" class="card-header" :class="notif.color ? notif.color : ''">
                            <div class="title">{{notif.title}}</div>
                        </div>
                        <div class="card-body">
                            <div class="col-md-12 text-center value">
                                <p>{{notif.content}}</p>
                            </div>
                            <button class="btn btn-primary" v-on:click="discardTurnNotif(index)">OK</button>
                        </div>
                    </div>


                        <!-- type: 'saleCard',
                        cardType: 'station',
                        propertyID: property.id,
                        propertyName: property.name,
                        price: price -->
                    <div v-if="notif.type == 'saleCard'">
                        <div class="card notification sale">
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
                                <button class="btn btn-primary accept" v-on:click="saleCardBuyProperty(index)">ACHETER</button>
                                <button class="btn btn-secondary reject" v-on:click="saleCardReject(index)">NE RIEN FAIRE</button>
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
      <div id="bid-popup-container"></div>

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
        <img class="user-avatar" :src="loggedUser.avatar">
        <i
          class="fa fa-cog open-settings ml-2"
          aria-hidden="true"
          data-toggle="modal"
          data-target="#optionsModal"
        ></i>
      </div>
    </div>

    <div v-if="loading" class="loader-overlay-container">
      <div class="boxes">
        <div class="box">
          <div></div>
          <div></div>
          <div></div>
          <div></div>
        </div>
        <div class="box">
          <div></div>
          <div></div>
          <div></div>
          <div></div>
        </div>
        <div class="box">
          <div></div>
          <div></div>
          <div></div>
          <div></div>
        </div>
        <div class="box">
          <div></div>
          <div></div>
          <div></div>
          <div></div>
        </div>
      </div>
    </div>

    <div class="profile-modals-container">
      <!-- Options -->
      <div
        class="modal"
        id="optionsModal"
        tabindex="-1"
        role="dialog"
        aria-labelledby="optionsModalLabel"
        aria-hidden="true"
        data-id="1"
      >
        <div class="modal-dialog animated bounceIn" role="document">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title" id="optionsModalLabel">Options</h5>
              <button
                type="button"
                class="close"
                data-dismiss="modal"
                aria-label="Close"
                style="cursor: pointer;"
              >
                <span aria-hidden="true" style="cursor: pointer;">&times;</span>
              </button>
            </div>
            <div class="modal-body">
              <ul>
                <li>
                  <span>Qualité graphique</span>
                  <select id="graphics-quality" class="custom-select">
                    <option value="0">Bas</option>
                    <option value="1">Standard</option>
                    <option value="2">Élevé</option>
                  </select>
                </li>
                <li>
                  <span>Zoom automatique</span>
                  <label class="switch">
                    <input id="auto-zoom" type="checkbox" />
                    <span class="slider"></span>
                  </label>
                </li>
              </ul>

              <button class="btn btn-primary show-rules" href="#" role="button">RÈGLES</button>
              <button
                id="quit-game"
                class="btn btn-primary"
                href="#"
                role="button"
                style="background-color: red;"
              >QUITTER LA PARTIE</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import io from "socket.io-client";
import GameBoard from "../components/GameBoard";
import ActionButton from "../components/ActionButton";
import PlayerEntry from '../components/PlayerEntry';
import Dices from '../components/Dices';
import ChatIO from '../components/ChatIO';
import SplashText from '../components/SplashText';
import 'odometer/themes/odometer-theme-default.css';
// import JQuery from 'jquery'

export default {
  name: "Game",
  components: {
    'gameboard': GameBoard,
    'action-button': ActionButton,
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
      players: [{
          nickname: "",
          money: 0,
          properties: []
      }],
      cells: [],
      properties: [],
      gameEndTime: null,
      turnNotifications: [],
      currentPlayerID: 0
    };
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
        console.log('gameRollDiceReq');
        this.socket.emit('gameRollDiceReq');
    },

    gameTurnEndReq() {
        console.log('gameTurnEndReq');
        this.socket.emit('gameTurnEndReq');
    },

    discardTurnNotif(index) {
        this.turnNotifications.splice(index, 1);
    },

    saleCardBuyProperty(notifIndex) {
        this.socket.emit('gamePropertyBuyReq');
        this.turnNotifications.splice(notifIndex, 1);
    },

    saleCardReject(notifIndex) {
        this.discardTurnNotif(notifIndex);
    },

    /**
     * Continue le tour de jeu (gameActionRes) après le premier déplacement
     * @param data Données de gameActionRes
     * @param currPlayer Joueur courant
     * @param cellPos2 Position #2 (le cas échéant)
     */
    gameActionResAfterFirstMovement(data, currPlayer, cellPos2) {
        // Mise à jour des soldes (le cas échéant)
        if (data.updateMoney) {
            data.updateMoney.forEach((row) => {
                const player = this.getPlayerById(row.playerID);
                if (player) player.money = row.money;
                // Update $set ?
            });
        }

        // Récupération de la propriété sur laquelle le joueur est tombé (le cas échéant)
        const property = this.getPropertyByCellId(data.cellPos);

        let afficherMessageAction = false;
        // asyncRequestType à gérer ici
        if (data.asyncRequestType && property) {
            if (data.asyncRequestType == "canBuy") {

                let price = data.asyncRequestArgs[0];
                if (property.type == "publicCompany") {
                    if (property.name == 'Eléctricité de Strasbourg') {
                        this.turnNotifications.push({
                            type: 'saleCard',
                            cardType: 'company electricite',
                            propertyID: property.id,
                            propertyName: property.name,
                            price: price
                        });
                        // createSaleCard(property.id, "company electricite", property.name, price, (currPlayer.id != ID));
                    } else {
                        this.turnNotifications.push({
                            type: 'saleCard',
                            cardType: 'company electricite',
                            propertyID: property.id,
                            propertyName: property.name,
                            price: price
                        });
                        // createSaleCard(property.id, "company eau", property.name, price, (currPlayer.id != ID));
                    }
                } else if (property.type == "trainStation") {
                    this.turnNotifications.push({
                        type: 'saleCard',
                        cardType: 'station',
                        propertyID: property.id,
                        propertyName: property.name,
                        price: price
                    });
                    // createSaleCard(property.id, "station", property.name, price, (currPlayer.id != ID));
                } else {
                    this.turnNotifications.push({
                        type: 'saleCard',
                        cardType: 'station',
                        propertyID: property.id,
                        propertyName: property.name,
                        price: price
                    });
                    // createSaleCard(property.id, property.color, property.name, price, (currPlayer.id != ID));
                }
                    
            }
            else if (data.asyncRequestType == "canUpgrade") {
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
                type: 'text'
            });
        }

        // Traitement des extras
        if (typeof data.extra !== "undefined") {
            // Si on est tombé sur une carte (chance / communauté)
            if (typeof data.extra.newCard !== "undefined") {
                if (data.extra.newCard.type == "chance") {

                    this.turnNotifications.push({
                        title: 'Carte chance',
                        content: data.extra.newCard.description,
                        color: 'blue',
                        type: 'text'
                    });

                    // createTextCard(, (currPlayer.id != ID), "blue", "Carte chance");
                } else { // community

                    this.turnNotifications.push({
                        title: 'Carte communauté',
                        content: data.extra.newCard.description,
                        color: 'blue',
                        type: 'text'
                    });

                    // createTextCard(data.extra.newCard.description, (currPlayer.id != ID), "blue", "Carte communauté");
                }
            }

            // Nb de cartes sortie de prison si il a changé
            if (typeof data.extra.nbJailEscapeCards !== "undefined") {
                currPlayer.nbJailEscapeCards = data.extra.nbJailEscapeCards;
            }

            if (typeof data.extra.goJail !== "undefined" && data.extra.goJail) {
                cellPos2 = null;
                currPlayer.isInJail = 1;
                setTimeout(() => {
                    this.$refs.gameboard.deletePawn(this.CST.PAWNS[currPlayer.pawn]);
                    setTimeout(() => {
                        this.$refs.gameboard.loaderPawn(this.CST.PAWNS[currPlayer.pawn], this.CST.CELL_PRISON);
                        return this.gameActionResAfterSecondMovement(data);
                    }, 1000);
                }, 1000);
            }
        }

        if (cellPos2 !== null && cellPos2 != currPlayer.cellPos) {
            this.$refs.gameboard.movement(this.CST.PAWNS[currPlayer.pawn], cellPos2.toString(), () => {
                currPlayer.cellPos = cellPos2;
                this.gameActionResAfterSecondMovement(data, currPlayer);
            });
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
        if (data.playerID === this.loggedUser.id) {
            this.$refs.actionBtn.progressReset(false);
        }

        // Si double avec les dés, on peut les relancer
        if (data.dicesRes[0] == data.dicesRes[1]) {
            if (data.playerID === this.loggedUser.id) {
                // LABEL -> "RE-LANCER LES DÉS"
                console.log("[BOUTON D'ACTION] Initialisation");
                // Ajouter le progressStart
            }
            else {
                // $(this).attr({ 'data-loading': 'TERMINER' });
            }
        }

        if (currPlayer.isInJail)
            currPlayer.isInJail++; // On augmente le nb de tours du joueur en prison

        console.log("=== fin gameActionRes ===");
    }
  },
  mounted() {
    // let $ = JQuery
    this.loading = false;
    // this.loggedUser.money = 10;
    this.players = [this.loggedUser];
    this.players[0].money = 100;
    const gameboard = this.$refs.gameboard;

    // setInterval(() => {
    //     this.players[0].money += 100;
    //     this.$set(this.players, 0, this.players[0]);
    // }, 1000);

    // this.$refs.gameboard.loaderPawn('montgolfiere', 0);
    // this.$refs.gameboard.loaderPawn('boat', 0);

    // setTimeout(() => {
    //     this.$refs.gameboard.movement('boat', 5, () => {
    //         this.$refs.gameboard.movement('montgolfiere', 10, () => {});
    //     });
    // }, 3000)


    this.socket.on('gameStartedRes', (data) => {

        this.players = data.players;
        this.cells = data.cells;
        this.properties = data.properties;
        this.gameEndTime = data.gameEndTime;

        console.log('Le jeu a démarré !');
        console.log(data);

        // Loading cells
        // for (const i in data.cells)
        //     this.$set(this.cells, i, data.cells[i]);

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
            player.properties = [];
            player.money = data.playersMoney;
            player.cellPos = 0;
            player.color = this.CST.PLAYERS_COLORS[index];
            player.isInJail = false;
            // this.$set(this.player, index, player);
            gameboard.loaderPawn(this.CST.PAWNS[player.pawn], player.cellPos.toString());
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

        for (const i in this.properties) {
            this.properties[i].level = 0;
            this.properties[i].ownerID = null;
        }

        // Génération de la liste de joueurs
        this.players.forEach((player, index) => {
            this.$refs.gameboard.loaderPawn(this.CST.PAWNS[player.pawn], player.cellPos);
            player.color = this.CST.PLAYERS_COLORS[index];
            player.isInJail = false;
        });

        this.players.forEach((player) => {
            player.properties.forEach((playerProperty) => {
                let property = this.getPropertyById(playerProperty);
                if (property) {
                    property.ownerID = player.id;
                    // MANQUE ACCÈS A LA COULEUR DU JOUEUR
                    let cell = this.getCellByProperty(property)
                    gameboard.loaderFlag("d" + cell.id, player.color);
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
    });


    this.socket.on('gameTurnRes', (data) => {
        console.log(data);
        let currentTimestamp = Date.now();
        let turnTimeSeconds = Math.floor((data.turnEndTime - currentTimestamp) / 1000);
        console.log('Le tour se terminera dans ' + turnTimeSeconds + ' secondes (' + currentTimestamp + ' - ' + data.turnEndTime + ')');

        // On vide toutes les notifications (au cas-où)
        this.turnNotifications = [];
        this.currentPlayerID = data.playerID;

        // afficher décompte de temps du tour
        if (this.currentPlayerID == this.loggedUser.id) {
            this.$refs.actionBtn.progressReset();
            this.$refs.splashText.trigger('<br>C\'est à vous de jouer !', 'white');
            this.$refs.actionBtn.progressStart(turnTimeSeconds);
        } else {
            this.$refs.splashText.trigger(`<br>C'est au tour de ${this.idToNick(data.playerID)} !`, 'white');
            this.$refs.actionBtn.progressFinish();
        }
    });


    this.socket.on('gameActionRes', (data) => {
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
        this.$refs.dices.triggerDices(data.dicesRes[0], data.dicesRes[1], () => {// Déplacement du pion du joueur

            // On ne déplace le joueur que s'il doit aller sur une nouvelle case (et s'il n'est pas en prison)
            if (!currPlayer.isInJail && cellPos1 != currPlayer.cellPos) {
                console.log("movement(" + this.CST.PAWNS[currPlayer.pawn] + ", " + cellPos1.toString() + ");");
                currPlayer.cellPos = cellPos1;
                this.$refs.actionBtn.progressPause();
                this.$refs.gameboard.movement(this.CST.PAWNS[currPlayer.pawn], cellPos1.toString(), () => {
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
            // player.properties.push(property);
            property.ownerID = player.id;
            // MANQUE ACCÈS A LA COULEUR DU JOUEUR
            this.$refs.gameboard.loaderFlag("d" + cell.id, player.color);

            // if (property.type == "publicCompany") {
            //     createProperty(player.id, 'company', property.name, property.id);
            // }
            // else if (property.type == "trainStation") {
            //     createProperty(player.id, 'station', property.name, property.id);
            // }
            // else {
            //     createProperty(player.id, property.color, property.name, property.id);

            // }

            player.id = data.playerMoney;
            // setPlayerMoney(player.id, data.playerMoney);


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
    


    this.socket.emit('gameReadyReq');

  }
};
</script>