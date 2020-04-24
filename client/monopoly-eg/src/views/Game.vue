<template>
  <div class="game">
    <div class="background-container"></div>
    <div class="board-container">
      <gameboard ref="gameboard"></gameboard>
    </div>
    <div class="ingame-ui-container">
      <div class="container-fluid players-list-container pl-5 pr-5">
        <div class="player-list">
          <div v-for="player in players" :key="player.id" class="player-entry">
            <div class="name">{{player.nickname}}</div>
            <IOdometer :value="player.money" class="iOdometer money"></IOdometer>
            <div class="popup top" style="display: none;">
                <div class="properties-container yellow">
                    <div class="blank-property"></div>
                    <div class="blank-property"></div>
                    <div class="blank-property"></div>
                </div>
                <div class="properties-container red">
                    <div class="blank-property"></div>
                    <div class="blank-property"></div>
                    <div class="blank-property"></div>
                </div>
                <div class="properties-container blue">
                    <div class="blank-property"></div>
                    <div class="blank-property"></div>
                </div>
                <div class="properties-container orange">
                    <div class="blank-property"></div>
                    <div class="blank-property"></div>
                    <div class="blank-property"></div>
                </div>
                <div class="properties-container purple">
                    <div class="blank-property"></div>
                    <div class="blank-property"></div>
                    <div class="blank-property"></div>
                </div>
                <div class="properties-container brown">
                    <div class="blank-property"></div>
                    <div class="blank-property"></div>
                </div>
                <div class="properties-container cyan">
                    <div class="blank-property"></div>
                    <div class="blank-property"></div>
                    <div class="blank-property"></div>
                </div>
                <div class="properties-container green">
                    <div class="blank-property"></div>
                    <div class="blank-property"></div>
                    <div class="blank-property"></div>
                </div>
                <div class="properties-container station">
                    <div class="blank-property"></div>
                    <div class="blank-property"></div>
                    <div class="blank-property"></div>
                    <div class="blank-property"></div>
                </div>
                <div class="properties-container company">
                    <div class="blank-property"></div>
                    <div class="blank-property"></div>
                </div>
            </div>
          </div>
        </div>
      </div>
      <div class="container-fluid bottom-container pl-5 pr-5" style="z-index: 10;">
        <div class="row">
          <div class="col-md-4">
            <div class="tchat-container" id="msgChat"></div>

            <div class="tchat-container">
              <div class="input-group">
                <input class="form-control" type="text" id="chat" placeholder="Votre message..." />
                <div class="input-group-append">
                  <span class="input-group-text">
                    <i class="fa fa-paper-plane" id="btnSendMsg"></i>
                  </span>
                </div>
              </div>
            </div>
          </div>
          <div class="col-md-4"></div>
          <div class="col-md-4">
            <div class="row notification-container">
              <div class="col-md-12"></div>
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
      <div class="dice-container">
        <div id="view1">
          <div id="dice1">
            <div class="diceFace front">
              <div class="dot center"></div>
            </div>
            <div class="diceFace front inner"></div>
            <div class="diceFace right">
              <div class="dot dtop dleft"></div>
              <div class="dot center"></div>
              <div class="dot dbottom dright"></div>
            </div>
            <div class="diceFace right inner"></div>
            <div class="diceFace back">
              <div class="dot dtop dleft"></div>
              <div class="dot dtop dright"></div>
              <div class="dot dbottom dleft"></div>
              <div class="dot dbottom dright"></div>
              <div class="dot center dleft"></div>
              <div class="dot center dright"></div>
            </div>
            <div class="diceFace back inner"></div>
            <div class="diceFace left">
              <div class="dot dtop dleft"></div>
              <div class="dot dtop dright"></div>
              <div class="dot dbottom dleft"></div>
              <div class="dot dbottom dright"></div>
            </div>
            <div class="diceFace left inner"></div>
            <div class="diceFace top">
              <div class="dot dtop dleft"></div>
              <div class="dot dbottom dright"></div>
            </div>
            <div class="diceFace top inner"></div>
            <div class="diceFace bottom">
              <div class="dot center"></div>
              <div class="dot dtop dleft"></div>
              <div class="dot dtop dright"></div>
              <div class="dot dbottom dleft"></div>
              <div class="dot dbottom dright"></div>
            </div>
            <div class="diceFace bottom inner"></div>
            <div class="side cover x"></div>
            <div class="side cover y"></div>
            <div class="side cover z"></div>
          </div>
        </div>

        <div id="view2">
          <div id="dice2">
            <div class="diceFace front">
              <div class="dot center"></div>
            </div>
            <div class="diceFace front inner"></div>
            <div class="diceFace right">
              <div class="dot dtop dleft"></div>
              <div class="dot center"></div>
              <div class="dot dbottom dright"></div>
            </div>
            <div class="diceFace right inner"></div>
            <div class="diceFace back">
              <div class="dot dtop dleft"></div>
              <div class="dot dtop dright"></div>
              <div class="dot dbottom dleft"></div>
              <div class="dot dbottom dright"></div>
              <div class="dot center dleft"></div>
              <div class="dot center dright"></div>
            </div>
            <div class="diceFace back inner"></div>
            <div class="diceFace left">
              <div class="dot dtop dleft"></div>
              <div class="dot dtop dright"></div>
              <div class="dot dbottom dleft"></div>
              <div class="dot dbottom dright"></div>
            </div>
            <div class="diceFace left inner"></div>
            <div class="diceFace top">
              <div class="dot dtop dleft"></div>
              <div class="dot dbottom dright"></div>
            </div>
            <div class="diceFace top inner"></div>
            <div class="diceFace bottom">
              <div class="dot center"></div>
              <div class="dot dtop dleft"></div>
              <div class="dot dtop dright"></div>
              <div class="dot dbottom dleft"></div>
              <div class="dot dbottom dright"></div>
            </div>
            <div class="diceFace bottom inner"></div>
            <div class="side cover x"></div>
            <div class="side cover y"></div>
            <div class="side cover z"></div>
          </div>
        </div>
      </div>

      <div class="splash-text">
        <span class="letters letters-1">C'est au tour de Ben !</span>
        <!-- <span class="letters letters-2">Set</span>
        <span class="letters letters-3">Go!</span>-->
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
import IOdometer from 'vue-odometer';
import 'odometer/themes/odometer-theme-default.css';
// import JQuery from 'jquery'

export default {
  name: "Game",
  components: {
    'gameboard': GameBoard,
    'action-button': ActionButton,
    IOdometer
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
      gameEndTime: null
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


    this.socket.emit('gameReadyReq')

  }
};
</script>