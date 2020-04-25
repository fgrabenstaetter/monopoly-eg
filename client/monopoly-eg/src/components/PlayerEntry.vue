<template>
    <div v-click-outside="hidePlayerProperties" class="player-entry" :class="{current: isCurrent}">
        <div v-on:click.stop="showPlayerProperties()" class="name">{{player.nickname}}</div>
        <IOdometer :value="player.money" class="iOdometer money"></IOdometer>
        <div v-if="showProperties" class="popup top">
            <div class="properties-container yellow" style="display: block;">
                <div class="property">
                    <div>Ma super route</div>
                </div>
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
</template>

<script>
import ClickOutside from 'vue-click-outside'
import IOdometer from 'vue-odometer';

export default {
    name: 'PlayerEntry',
    props: {
        player: {
            type: Object,
            required: true
        },
        isCurrent: {
            type: Boolean,
            default: false
        }
    },
    components: {
        IOdometer
    },
    data() {
        return {
            showProperties: false
        }
    },
    mounted() {
        this.popupItem = this.$el;
    },
    methods: {
        showPlayerProperties() {
            this.showProperties = true;
        },
        hidePlayerProperties: function() {
            this.showProperties = false;
        }
    },
    directives: {
        ClickOutside
    }

}
</script>