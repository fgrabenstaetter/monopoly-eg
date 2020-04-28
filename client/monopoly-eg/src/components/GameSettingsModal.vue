<template>
    <div class="modal" id="optionsModal" tabindex="-1" role="dialog" aria-labelledby="optionsModalLabel"
        aria-hidden="true" data-id="1">
        <div class="modal-dialog animated bounceIn" role="document">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="optionsModalLabel">Options</h5>
                    <button type="button" class="close" data-dismiss="modal" aria-label="Close" style="cursor: pointer;">
                        <span aria-hidden="true" style="cursor: pointer;">&times;</span>
                    </button>
                </div>
                <div class="modal-body">
                    <ul>
                        <li>
                            <span>Qualité graphique</span>
                            <select @change="updateUserSettings" v-model="userSettings.graphicsQuality" class="custom-select">
                                <option value="0">Bas</option>
                                <option value="1">Standard</option>
                                <option value="2">Élevé</option>
                            </select>
                        </li>
                        <li>
                            <span>Zoom automatique</span>
                            <label class="switch">
                                <input @change="updateUserSettings" v-model="userSettings.autoZoom" type="checkbox">
                                <span class="slider"></span>
                            </label>
                        </li>
                        <li style="flex-wrap:wrap;">
                            <span>Musique</span>
                            <input @change="updateUserSettings" v-model="userSettings.musicLevel" type="range" min="0" max="100" class="range-slider">
                        </li>
                        <li style="flex-wrap:wrap;">
                            <span>Effets sonores</span>
                            <input @change="updateUserSettings" v-model="userSettings.sfxLevel" type="range" min="0" max="100" class="range-slider">
                        </li>
                        <li style="flex-wrap:wrap;">
                            <span>Temps de jeu</span>
                            <span>???s</span>
                        </li>
                    </ul>

                    <button class="btn btn-primary show-rules" href="#" role="button">RÈGLES</button>
                    <button v-if="env == 'game'" v-on:click="quitGame" class="btn btn-primary" href="#" role="button"
                        style="background-color: red;">QUITTER LA PARTIE</button>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import $ from 'jquery';

export default {
    name: 'GameSettingsModal',
    props: {
        env: {
            type: String,
            default: 'lobby'
        },
        socket: {
            type: Object,
            required: true
        },
        loggedUser: {
            type: Object,
            required: true
        }
    },
    data() {
        return {
            userSettings: {
                graphicsQuality: 1,
                autoZoom: true,
                musicLevel: 100,
                sfxLevel: 100
            }
        }
    },
    mounted() {
        this.userSettings = this.loggedUser.settings;
    },
    methods: {
        updateUserSettings() {
            this.userSettings.graphicsQuality = parseInt(this.userSettings.graphicsQuality);
            this.userSettings.autoZoom = !!this.userSettings.autoZoom;
            // local save
            this.$store.dispatch('updateSettings', this.userSettings);
            // parent save
            this.$parent.loggedUser.settings = this.userSettings;
            // socket save
            this.socket.emit('playerSettingsReq', this.userSettings);

            if (this.env == 'game') {
                // Refresh du plateau en direct
                this.$parent.$refs.gameboard.refreshPlayerGraphicsQuality();
                this.$parent.$refs.gameboard.refreshPlayerAutoZoom();
            }

            // Refresh volume en direct
            this.$parent.setMusicLevel(this.userSettings.musicLevel);
        },
        closeModal() {
            $('#optionsModal').modal('hide');
        },
        quitGame() {
            if (typeof this.$parent.quitGame === 'function')
                this.$parent.quitGame();
        }
    }
}
</script>

<style>
.range-slider {
  -webkit-appearance: none;
  width: 100%;
  height: 10px;
  border-radius: 5px;
  margin: 8px 0;
  background: #d7d7d7;
  outline: none;
  opacity: 0.7;
  -webkit-transition: .2s;
  transition: opacity .2s;
}

.range-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 22px;
  height: 22px;
  border-radius: 50%; 
  background: #027AFE;
  cursor: pointer;
}

.range-slider::-moz-range-thumb {
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: #027AFE;
  cursor: pointer;
}
</style>