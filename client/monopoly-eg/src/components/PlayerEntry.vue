<template>
    <div v-click-outside="hidePlayerProperties" class="player-entry" :class="{current: isCurrent, disconnected: player.disconnected, failure: player.failure}">
        <div v-on:click="showPlayerProperties()" class="name">
            {{player.nickname}}
            <span v-if="player.disconnected">(Déconnecté)</span>
        </div>
        
        <IOdometer :value="player.money" class="iOdometer money"></IOdometer>
        
        <div v-if="showProperties" class="popup top" :class="{'edition': propertiesEdition.open}">
            <div class="popup-title">{{player.nickname}}</div>
            <img class="popup-pawn" :src="playerPawnImgSrc">

            <!-- Cartes bonus -->
            <div class="bonus-container">
                <div class="bonus">Sortie du parlement</div>
            </div>

            <div v-if="player.id == loggedUser.id" @click="openPropertiesEdition" class="houses-btn-container">
                <button class="houses-btn"><i class="fas fa-home"></i>Éditer</button>
            </div>
            
            <div v-if="overviewCard" @click.self="closeOverviewCardBuySell()" class="overview-card" style="display:block;">
                <div class="header" :class="[overviewCard.color, (overviewCard.type == 'trainStation') ? 'station' : '', (overviewCard.type == 'publicCompany') ? 'company' : '']">
                    {{overviewCard.name}}
                </div>
                <div v-if="overviewCard.type == 'street'" class="content">
                    <div class="base-price">PRIX D'ORIGINE {{overviewCard.prices.empty}}€</div>
                    <div class="rent">{{overviewCard.rentalPrices.empty}}</div>
                    <div class="with-house">
                        <div>Avec 1 Maison</div>
                        <div>{{overviewCard.rentalPrices.house[0]}}</div>
                    </div>
                    <div class="with-house">
                        <div>Avec 2 Maisons</div>
                        <div>{{overviewCard.rentalPrices.house[1]}}</div>
                    </div>
                    <div class="with-house">
                        <div>Avec 3 Maisons</div>
                        <div>{{overviewCard.rentalPrices.house[2]}}</div>
                    </div>
                    <div class="with-house">
                        <div>Avec 4 Maisons</div>
                        <div>{{overviewCard.rentalPrices.house[3]}}</div>
                    </div>
                    <div class="with-hotel">
                        <div>Avec 1 Hotel</div>
                        <div>{{overviewCard.rentalPrices.hostel}}</div>
                    </div>
                    <div class="house-price">Prix des Maisons {{overviewCard.prices.house}}€ chacune</div>
                    <div class="hotel-price">Prix d'un Hôtel {{overviewCard.prices.hostel}}€ plus 4 maisons</div>
                    <div v-if="!overviewCard.isMortgaged" class="mortgage">Valeur de l'hypothèque : {{overviewCard.prices.empty/2}}€</div>
                    <div v-else class="mortgage">Rachat de l'hypothèque : {{(overviewCard.prices.empty/2)+(overviewCard.prices.empty/2*0.1)}}€</div>
                </div>
                <div v-if="overviewCard.type == 'trainStation'" class="content">
                    <!-- <div class="">PRIX D'ORIGINE {{overviewCard.price}}</div> -->
                    <div class="rent">{{overviewCard.rentalPrices[0]}}</div>
                    <div class="with-house">
                        <div>Si vous avez 2 Gares</div>
                        <div>{{overviewCard.rentalPrices[1]}}</div>
                    </div>
                    <div class="with-house">
                        <div>Si vous avez 3 Gares</div>
                        <div>{{overviewCard.rentalPrices[2]}}</div>
                    </div>
                    <div class="with-house">
                        <div>Si vous avez 4 Gares</div>
                        <div>{{overviewCard.rentalPrices[3]}}</div>
                    </div>
                    <div v-if="!overviewCard.isMortgaged" class="mortgage">Valeur de l'hypothèque : {{overviewCard.price/2}}€</div>
                    <div v-else class="mortgage">Rachat de l'hypothèque : {{(overviewCard.price/2)+(overviewCard.price/2*0.1)}}€</div>
                </div>
                <div v-if="overviewCard.type == 'publicCompany'" class="content">
                    <!-- <div class="">PRIX D'ORIGINE {{overviewCard.price}}</div> -->
                    <div class="company-description">Si l'on possède UNE carte de compagnie de Service Public,
                        le loyer est 4 fois le montant indiqué par les dés.<br><br>Si l'on possède les DEUX cartes de compagnie de Service Public,
                        le loyer est 10 fois le montant indiqué par les dés.</div>
                    <div v-if="!overviewCard.isMortgaged" class="mortgage">Valeur de l'hypothèque : {{overviewCard.price/2}}€</div>
                    <div v-else class="mortgage">Rachat de l'hypothèque : {{(overviewCard.price/2)+(overviewCard.price/2*0.1)}}€</div>
                </div>
                <div class="options">
                    <button v-if="loggedUser.id == player.id" @click="toggleOverviewCardSell" class="btn stylized">VENDRE</button>
                    <div v-if="loggedUser.id == player.id && overviewCardSell.open" v-click-outside="closeOverviewCardSell" class="sell-input">
                        <form @submit.prevent="sellProperty(overviewCard.id)">
                            <label>Montant de départ de l'enchère</label>
                            <input v-model="overviewCardSell.price" ref="overviewCardSellPrice" type="text" placeholder="Votre montant...">
                            <button class="btn">Vendre</button>
                        </form>
                    </div>
                    <button v-if="loggedUser.id == player.id && overviewCard.isMortgaged" @click="rebuyProperty(overviewCard.id)" class="btn stylized">RACHETER</button>
                    <button v-if="loggedUser.id == player.id && isCurrent && !overviewCard.isMortgaged" @click="mortgageProperty(overviewCard.id)" class="btn stylized">HYPOTHÉQUER</button>
                    <button v-if="loggedUser.id != player.id" @click="toggleOverviewCardBuy" class="btn stylized">ACHETER</button>
                    <div v-if="loggedUser.id != player.id && overviewCardBuy.open" v-click-outside="closeOverviewCardBuy" class="buy-input">
                        <form @submit.prevent="buyProperty(overviewCard.id)">
                            <label>Quel est le montant de votre offre ?</label>
                            <input v-model="overviewCardBuy.price" ref="overviewCardBuyPrice" type="text" placeholder="Votre montant...">
                            <button class="btn">Acheter</button>
                        </form>
                    </div>
                </div>
            </div>

            <div v-for="(type, typeIndex) in propertiesTypes" :key="type.name">
                <div v-if="remainingPropertiesByType(type) < type.totalNb" style="display: block;" class="properties-container" :class="type.cssClass ? type.cssClass : type.name">
                    <div v-for="prop in propertiesByType(type)" :key="prop.id" @click="displayOverviewCard(prop)" v-click-outside="hideOverviewCard" class="property">
                        <div v-if="prop.type == 'street'">
                            {{prop.name}}
                            <div v-if="prop.level < 5 && propertiesEdition.totalPrice <= player.money" @click="propertiesEditionAddHouse(prop)" class="add-house">+</div>
                            <div v-if="prop.level > 0" @click="propertiesEditionRemoveHouse(prop)" class="remove-house">-</div>
                            <div class="house-number">{{prop.level}}</div>
                        </div>
                        <div v-else>
                            {{prop.name}}
                        </div>
                    </div>
                    <div v-for="i in remainingPropertiesByType(type)" :key="typeIndex * i + i" class="blank-property"></div>
                </div> 
            </div>

            <div v-if="propertiesEdition.open">
                <div class="houses-total-price">{{propertiesEdition.totalPrice}}€</div>
                <button @click="submitPropertiesEdition" class="houses-validation-btn">Terminer</button>
                <button @click="cancelPropertiesEdition" class="houses-cancel-btn">Annuler</button>
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
        },
        loggedUser: {
            type: Object,
            required: true
        },
        socket: {
            type: Object,
            required: true
        }
    },
    components: {
        IOdometer
    },
    data() {
        return {
            propertiesTypes: [
                { name: 'yellow', totalNb: 3 },
                { name: 'red', totalNb: 3 },
                { name: 'blue', totalNb: 2 },
                { name: 'orange', totalNb: 3 },
                { name: 'purple', totalNb: 3 },
                { name: 'brown', totalNb: 3 },
                { name: 'cyan', totalNb: 3 },
                { name: 'green', totalNb: 3 },
                { name: 'trainStation', totalNb: 4, cssClass: 'station' },
                { name: 'publicCompany', totalNb: 2, cssClass: 'company' }
            ],
            showProperties: false,
            overviewCard: false,
            overviewCardBuy: {
                open: false,
                price: ''
            },
            overviewCardSell: {
                open: false,
                price: ''
            },
            propertiesEdition: {
                open: false,
                totalPrice: 0,
                modifications: []
            }
        }
    },
    mounted() {
        this.popupItem = this.$el;
        // this.player.properties = [];

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

        // this.player.properties.push({
        //     "id": 20,
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

        // this.player.properties.push({
        //     "id": 21,
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
    computed: {
        playerPropertiesObj() {
            let propertiesObj = [];
            for (const i in this.player.properties) {
                const property = this.$parent.getPropertyById(this.player.properties[i]);
                if (property)
                    propertiesObj.push(property);
            }
            return propertiesObj
        },
        playerPawnImgSrc() {
            return `/assets/img/pawns/${this.$parent.CST.PAWNS[this.player.pawn]}.png`;
        }
    },
    methods: {

        propertiesByType(type) {
            let res = [];
            for (const i in this.playerPropertiesObj) {
                if (this.playerPropertiesObj[i].type == type.name || this.playerPropertiesObj[i].color == type.name)
                    res.push(this.playerPropertiesObj[i]);
            }
            return res;
        },
        remainingPropertiesByType(type) {
            return (type.totalNb - this.propertiesByType(type).length);
        },
        submitPropertiesEdition() {
            let list = [];
            for (const i in this.propertiesEdition.modifications) {
                list.push({
                    propertyID: this.propertiesEdition.modifications[i].propertyID,
                    level: this.propertiesEdition.modifications[i].level
                });
            }

            this.socket.emit('gamePropertyUpgradeReq', { list: list });

            this.cancelPropertiesEdition(); // [A FAIRE] -> Les remettres à jour à réception de 'gamePropertyUpgradedRes'
        },
        cancelPropertiesEdition() {
            console.log("CANCEL PROPERTIES EDITION");
            // Reset les données d'édition
            this.propertiesEdition.totalPrice = 0;
            for (const i in this.propertiesEdition.modifications) {
                for (const j in this.playerPropertiesObj) {
                    if (this.propertiesEdition.modifications[i].propertyID == this.playerPropertiesObj[j].id) {
                        this.playerPropertiesObj[j].level = this.propertiesEdition.modifications[i].oldLevel;
                        continue;
                    }
                }
            }
            this.propertiesEdition.modifications = [];
            this.propertiesEdition.totalPrice = 0;
            this.propertiesEdition.open = false;
        },
        propertiesEditionRemovePropertyFromModifications(property) {
            for (const i in this.propertiesEdition.modifications) {
                if (this.propertiesEdition.modifications[i].propertyID == property.id) {
                    this.propertiesEdition.modifications.splice(i, 1);
                    return;
                }
            }
        },
        propertiesEditionGetPropertyModificationIndex(property) {
            for (const i in this.propertiesEdition.modifications) {
                if (this.propertiesEdition.modifications[i].propertyID == property.id)
                    return i;
            }
        },
        propertiesEditionAddHouse(property) {
            if (property.level == 5) return;
            let propertyIndex = this.propertiesEditionGetPropertyModificationIndex(property);
            
            property.level++;
            if (propertyIndex != null) {
                this.propertiesEdition.modifications[propertyIndex].level = property.level;
            } else {
                this.propertiesEdition.modifications.push({
                    propertyID: property.id,
                    oldLevel: property.level - 1,
                    level: property.level
                });
            }

            if (property.level == 5)
                this.propertiesEdition.totalPrice += property.prices.hostel;
            else
                this.propertiesEdition.totalPrice += property.prices.house;
        },
        propertiesEditionRemoveHouse(property) {
            if (property.level == 0) return;
            let propertyIndex = this.propertiesEditionGetPropertyModificationIndex(property);

            property.level--;
            if (propertyIndex != null) {
                this.propertiesEdition.modifications[propertyIndex].level = property.level;
            } else {
                this.propertiesEdition.modifications.push({
                    propertyID: property.id,
                    oldLevel: property.level + 1,
                    level: property.level
                });
            }

            if (property.level == 4)
                this.propertiesEdition.totalPrice -= property.prices.hostel;
            else
                this.propertiesEdition.totalPrice -= property.prices.house;

        },

        showPlayerProperties() {
            this.showProperties = true;
        },
        hidePlayerProperties() {
            this.showProperties = false;
            this.hideOverviewCard();
        },
        displayOverviewCard(property) {
            this.overviewCard = property;
            this.closeOverviewCardBuy();
            this.closeOverviewCardSell();
        },
        hideOverviewCard() {
            this.overviewCard = false;
            this.closeOverviewCardSell();
            this.closeOverviewCardBuy();
        },
        openPropertiesEdition() {
            this.propertiesEdition.open = true;
        },
        openOverviewCardSell() {
            this.overviewCardSell.open = true;
            this.overviewCardSell.price = '';
            // this.$refs.overviewCardSellPrice.focus();
        },
        openOverviewCardBuy() {
            this.overviewCardBuy.open = true;
            this.overviewCardBuy.price = '';
            // this.$refs.overviewCardBuyPrice.focus();
        },
        closeOverviewCardSell() {
            this.overviewCardSell.open = false;
            this.overviewCardSell.price = '';
        },
        closeOverviewCardBuy() {
            this.overviewCardBuy.open = false;
            this.overviewCardBuy.price = '';
        },
        closeOverviewCardBuySell() {
            this.closeOverviewCardSell();
            this.closeOverviewCardBuy();
        },
        toggleOverviewCardSell() {
            if (this.overviewCardSell.open)
                this.closeOverviewCardSell();
            else
                this.openOverviewCardSell();
        },
        toggleOverviewCardBuy() {
            if (this.overviewCardBuy.open)
                this.closeOverviewCardBuy();
            else
                this.openOverviewCardBuy();
        },
        sellProperty(propertyID) {
            this.socket.emit('gameManualBidReq', { propertyID: propertyID, initialPrice: this.overviewCardSell.price });
            this.closeOverviewCardSell();
        },
        buyProperty(propertyID) {
            console.log("buyProperty");
            console.log({ receiverID: this.player.id, propertyID: propertyID, price: this.overviewCardBuy.price });
            this.socket.emit('gameOfferSendReq', { receiverID: this.player.id, propertyID: propertyID, price: this.overviewCardBuy.price });
            this.closeOverviewCardBuy();
        },
        mortgageProperty(propertyID) {
            this.socket.emit('gamePropertyMortgageReq', { properties: [propertyID] });
        },
        rebuyProperty(propertyID) {
            alert(`Unmortgage ${propertyID}`);
            this.socket.emit("gamePropertyUnmortgageReq", { propertyID: propertyID });
        }
        // getPropertiesByTypeColor(type, color) {
        //     // type : 'street', 'trainStation', 'publicCompany', ...
        //     // color : 'red', 'yellow', ...
        //     let res = [];
        //     for (const i in this.playerPropertiesObj)
        // }
    },
    directives: {
        ClickOutside
    },
    watch: {
        // player(nouv, prev) {
        //     console.log(nouv, prev);
        // }
    }

}
</script>