<template>
    <div v-click-outside="hidePlayerProperties" class="player-entry" :class="{current: isCurrent}">
        <div v-on:click.stop="showPlayerProperties()" class="name">{{player.nickname}}</div>
        <IOdometer :value="player.money" class="iOdometer money"></IOdometer>
        <div v-if="showProperties" class="popup top">
            <div v-if="remainingYellowProperties < 3" style="display: block;" class="properties-container yellow">
                <div v-for="prop in yellowProperties" :key="prop.id" class="property">
                    <div>{{prop.name}}</div>
                </div>
                <div v-if="remainingYellowProperties >= 1" class="blank-property"></div>
                <div v-if="remainingYellowProperties >= 2" class="blank-property"></div>
                <div v-if="remainingYellowProperties >= 3" class="blank-property"></div>
            </div>
            <div v-if="remainingRedProperties < 3" style="display: block;" class="properties-container red">
                <div v-for="prop in redProperties" :key="prop.id" class="property">
                    <div>{{prop.name}}</div>
                </div>
                <div v-if="remainingRedProperties >= 1" class="blank-property"></div>
                <div v-if="remainingRedProperties >= 2" class="blank-property"></div>
                <div v-if="remainingRedProperties >= 3" class="blank-property"></div>
            </div>
            <div v-if="remainingBlueProperties < 2" style="display: block;" class="properties-container blue">
                <div v-for="prop in blueProperties" :key="prop.id" class="property">
                    <div>{{prop.name}}</div>
                </div>
                <div v-if="remainingBlueProperties >= 1" class="blank-property"></div>
                <div v-if="remainingBlueProperties >= 2" class="blank-property"></div>
            </div>
            <div v-if="remainingOrangeProperties < 3" style="display: block;" class="properties-container orange">
                <div v-for="prop in orangeProperties" :key="prop.id" class="property">
                    <div>{{prop.name}}</div>
                </div>
                <div v-if="remainingOrangeProperties >= 1" class="blank-property"></div>
                <div v-if="remainingOrangeProperties >= 2" class="blank-property"></div>
                <div v-if="remainingOrangeProperties >= 3" class="blank-property"></div>
            </div>
            <div v-if="remainingPurpleProperties < 3" style="display: block;" class="properties-container purple">
                <div v-for="prop in purpleProperties" :key="prop.id" class="property">
                    <div>{{prop.name}}</div>
                </div>
                <div v-if="remainingPurpleProperties >= 1" class="blank-property"></div>
                <div v-if="remainingPurpleProperties >= 2" class="blank-property"></div>
                <div v-if="remainingPurpleProperties >= 3" class="blank-property"></div>
            </div>
            <div v-if="remainingBrownProperties < 3" style="display: block;" class="properties-container brown">
                <div v-for="prop in brownProperties" :key="prop.id" class="property">
                    <div>{{prop.name}}</div>
                </div>
                <div v-if="remainingBrownProperties >= 1" class="blank-property"></div>
                <div v-if="remainingBrownProperties >= 2" class="blank-property"></div>
                <div v-if="remainingBrownProperties >= 3" class="blank-property"></div>
            </div>
            <div v-if="remainingCyanProperties < 3" style="display: block;" class="properties-container cyan">
                <div v-for="prop in cyanProperties" :key="prop.id" class="property">
                    <div>{{prop.name}}</div>
                </div>
                <div v-if="remainingCyanProperties >= 1" class="blank-property"></div>
                <div v-if="remainingCyanProperties >= 2" class="blank-property"></div>
                <div v-if="remainingCyanProperties >= 3" class="blank-property"></div>
            </div>
            <div v-if="remainingGreenProperties < 3" style="display: block;" class="properties-container green">
                <div v-for="prop in greenProperties" :key="prop.id" class="property">
                    <div>{{prop.name}}</div>
                </div>
                <div v-if="remainingGreenProperties >= 1" class="blank-property"></div>
                <div v-if="remainingGreenProperties >= 2" class="blank-property"></div>
                <div v-if="remainingGreenProperties >= 3" class="blank-property"></div>
            </div>
            <div v-if="remainingTrainStationProperties < 4" style="display: block;" class="properties-container station">
                <div v-for="prop in trainStationProperties" :key="prop.id" class="property">
                    <div>{{prop.name}}</div>
                </div>
                <div v-if="remainingTrainStationProperties >= 1" class="blank-property"></div>
                <div v-if="remainingTrainStationProperties >= 2" class="blank-property"></div>
                <div v-if="remainingTrainStationProperties >= 3" class="blank-property"></div>
                <div v-if="remainingTrainStationProperties >= 4" class="blank-property"></div>
            </div>
            <div v-if="remainingPublicCompanyProperties < 2" style="display: block;" class="properties-container company">
                <div v-for="prop in publicCompanyProperties" :key="prop.id" class="property eau">
                    <div>{{prop.name}}</div>
                </div>
                <div v-if="remainingPublicCompanyProperties >= 1" class="blank-property"></div>
                <div v-if="remainingPublicCompanyProperties >= 2" class="blank-property"></div>
            </div>
            <!-- <div class="properties-container green">
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
            </div> -->
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
        this.player.properties = [];

        // this.player.properties.push({
        //     "id": 1,
        //     "type": "street",
        //     "name": "Rue des tonneliers",
        //     "description": "Quelle magnifique rue !",
        //     "color": "brown",
        //     "prices": {
        //         "empty": 60,
        //         "house": 50,
        //         "hostel": 250
        //     },
        //     "rentalPrices": {
        //         "empty": 4,
        //         "house": [
        //             20,
        //             60,
        //             180,
        //             320
        //         ],
        //         "hostel": 450
        //     },
        //     "level": 0,
        //     "ownerID": null,
        //     "isMortgage": 0
        // });

        // this.player.properties.push({
        //     "id": 2,
        //     "type": "trainStation",
        //     "name": "Homme de Fer",
        //     "description": "Quelle magnifique gare !",
        //     "price": 200,
        //     "rentalPrices": [
        //         25,
        //         50,
        //         100,
        //         200
        //     ],
        //     "level": 0,
        //     "ownerID": null,
        //     "isMortgage": 0
        // });

        // this.player.properties.push({
        //     "id": 3,
        //     "type": "street",
        //     "name": "Faubourg de Saverne",
        //     "description": "Quelle magnifique rue !",
        //     "color": "cyan",
        //     "prices": {
        //         "empty": 100,
        //         "house": 50,
        //         "hostel": 250
        //     },
        //     "rentalPrices": {
        //         "empty": 6,
        //         "house": [
        //             30,
        //             90,
        //             270,
        //             400
        //         ],
        //         "hostel": 550
        //     },
        //     "level": 0,
        //     "ownerID": null,
        //     "isMortgage": 0
        // });

        // this.player.properties.push({
        //     "id": 14,
        //     "type": "street",
        //     "name": "Allée de la Robertsau",
        //     "description": "Quelle magnifique rue !",
        //     "color": "red",
        //     "prices": {
        //         "empty": 220,
        //         "house": 150,
        //         "hostel": 750
        //     },
        //     "rentalPrices": {
        //         "empty": 18,
        //         "house": [
        //             90,
        //             250,
        //             700,
        //             875
        //         ],
        //         "hostel": 1050
        //     },
        //     "level": 0,
        //     "ownerID": null,
        //     "isMortgage": 0
        // });

        // this.player.properties.push({
        //     "id": 19,
        //     "type": "street",
        //     "name": "Rue de Rome",
        //     "description": "Quelle magnifique rue !",
        //     "color": "yellow",
        //     "prices": {
        //         "empty": 260,
        //         "house": 150,
        //         "hostel": 750
        //     },
        //     "rentalPrices": {
        //         "empty": 22,
        //         "house": [
        //             110,
        //             330,
        //             800,
        //             975
        //         ],
        //         "hostel": 1150
        //     },
        //     "level": 0,
        //     "ownerID": null,
        //     "isMortgage": 0
        // });
    },
    methods: {
        showPlayerProperties() {
            this.showProperties = true;
        },
        hidePlayerProperties: function() {
            this.showProperties = false;
        },
        // getPropertiesByTypeColor(type, color) {
        //     // type : 'street', 'trainStation', 'publicCompany', ...
        //     // color : 'red', 'yellow', ...
        //     let res = [];
        //     for (const i in this.player.properties)
        // }
    },
    computed: {
        yellowProperties: function() {
            let res = [];
            for (const i in this.player.properties) {
                if (this.player.properties[i].color == 'yellow')
                    res.push(this.player.properties[i]);
            }
            return res;
        },
        remainingYellowProperties: function() {
            return (3 - this.yellowProperties.length);
        },
        redProperties: function() {
            let res = [];
            for (const i in this.player.properties) {
                if (this.player.properties[i].color == 'red')
                    res.push(this.player.properties[i]);
            }
            return res;
        },
        remainingRedProperties: function() {
            return (3 - this.redProperties.length);
        },
        blueProperties: function() {
            let res = [];
            for (const i in this.player.properties) {
                if (this.player.properties[i].color == 'blue')
                    res.push(this.player.properties[i]);
            }
            return res;
        },
        remainingBlueProperties: function() {
            return (2 - this.blueProperties.length);
        },
        orangeProperties: function() {
            let res = [];
            for (const i in this.player.properties) {
                if (this.player.properties[i].color == 'orange')
                    res.push(this.player.properties[i]);
            }
            return res;
        },
        remainingOrangeProperties: function() {
            return (3 - this.orangeProperties.length);
        },
        purpleProperties: function() {
            let res = [];
            for (const i in this.player.properties) {
                if (this.player.properties[i].color == 'purple')
                    res.push(this.player.properties[i]);
            }
            return res;
        },
        remainingPurpleProperties: function() {
            return (3 - this.purpleProperties.length);
        },
        brownProperties: function() {
            let res = [];
            for (const i in this.player.properties) {
                if (this.player.properties[i].color == 'brown')
                    res.push(this.player.properties[i]);
            }
            return res;
        },
        remainingBrownProperties: function() {
            return (3 - this.brownProperties.length);
        },
        cyanProperties: function() {
            let res = [];
            for (const i in this.player.properties) {
                if (this.player.properties[i].color == 'cyan')
                    res.push(this.player.properties[i]);
            }
            return res;
        },
        remainingCyanProperties: function() {
            return (3 - this.cyanProperties.length);
        },
        greenProperties: function() {
            let res = [];
            for (const i in this.player.properties) {
                if (this.player.properties[i].color == 'green')
                    res.push(this.player.properties[i]);
            }
            return res;
        },
        remainingGreenProperties: function() {
            return (3 - this.greenProperties.length);
        },
        trainStationProperties: function() {
            let res = [];
            for (const i in this.player.properties) {
                if (this.player.properties[i].type == 'trainStation')
                    res.push(this.player.properties[i]);
            }
            return res;
        },
        remainingTrainStationProperties: function() {
            return (4 - this.redProperties.length);
        },
        publicCompanyProperties: function() {
            let res = [];
            for (const i in this.player.properties) {
                if (this.player.properties[i].type == 'publicCompany')
                    res.push(this.player.properties[i]);
            }
            return res;
        },
        remainingPublicCompanyProperties: function() {
            return (2 - this.publicCompanyProperties.length);
        }
    },
    directives: {
        ClickOutside
    }

}
</script>