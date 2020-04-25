<template>
    <div class="player-entry" :class="{current: isCurrent}">
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
</template>

<script>
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
    }

}
</script>