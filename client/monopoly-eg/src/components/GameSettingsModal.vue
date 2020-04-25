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
                    </ul>

                    <button class="btn btn-primary show-rules" href="#" role="button">RÈGLES</button>
                    <button v-if="env == 'game'" class="btn btn-primary" href="#" role="button"
                        style="background-color: red;">QUITTER LA PARTIE</button>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
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
                autoZoom: true
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
        }
    }
}
</script>