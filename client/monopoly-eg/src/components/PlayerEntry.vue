<template>
    <div
        v-if="!player.hasLeft"
        v-click-outside="hidePlayerProperties"
        class="player-entry"
        :class="[
            player.color.name,
            isCurrent ? 'current' : '',
            player.disconnected ? 'disconnected' : '',
            player.failure ? 'failure' : ''
        ]"
    >
        <div @click="showPlayerProperties()" class="name">
            {{player.nickname}}
            <span v-if="player.disconnected">(Déconnecté)</span>
        </div>
        
        <IOdometer :value="player.money" class="iOdometer money"></IOdometer>
        
        <div v-if="showProperties" class="popup top" :class="{'edition': propertiesEdition.open}">
            <div class="popup-title">{{player.nickname}}</div>
            <img class="popup-pawn" :src="playerPawnImgSrc">

            <div v-if="player.id == loggedUser.id" @click="openPropertiesEdition" class="houses-btn-container">
                <button class="houses-btn"><i class="fas fa-home"></i>Éditer</button>
            </div>
            
            <div v-if="overviewCard" @click.self="closeOverviewCardBuySell()" class="overview-card" :class="{'mortgaged': overviewCard.isMortgaged}" style="display:block;">
                <div
                    class="header"
                    :class="[
                            overviewCard.color,
                            (overviewCard.type == 'trainStation') ? 'station' : '',
                            (overviewCard.type == 'publicCompany') ? 'company' : '',
                            (overviewCard.id == 7) ? 'electricite' : '',
                            (overviewCard.id == 20) ? 'eau' : ''
                        ]"
                    >
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
                    <div class="base-price">PRIX D'ORIGINE {{overviewCard.price}}€</div>
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
                    <div class="base-price">PRIX D'ORIGINE {{overviewCard.price}}€</div>
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

            <div v-if="player.properties.length == 0 && loggedUser.id == player.id" class="empty-popup">Vous ne possédez aucune propriété</div>
            <div v-if="player.properties.length == 0 && loggedUser.id != player.id" class="empty-popup">{{player.nickname}} ne possède aucune propriété</div>

            <div class="popup-content">
                <div v-for="(type, typeIndex) in propertiesTypes" :key="type.name">
                    <div v-if="remainingPropertiesByType(type) < type.totalNb" style="display: block;" class="properties-container" :class="type.cssClass ? type.cssClass : type.name">
                        <div v-for="(prop, propIndex) in allPropertiesByType(type)" :key="typeIndex * propIndex + propIndex">
                            <div v-if="player.properties.includes(prop.id)" @click="displayOverviewCard(prop)" v-click-outside="hideOverviewCard" class="property" :class="{'mortgaged': prop.isMortgaged}">
                                <div v-if="prop.type == 'street'">
                                    {{prop.name}}
                                    <div v-if="remainingPropertiesByType(type) == 0 && prop.level < 5 && propertiesEdition.totalPrice <= player.money" @click="propertiesEditionAddHouse(prop)" class="add-house">+</div>
                                    <div v-if="remainingPropertiesByType(type) == 0 && prop.level > 0" @click="propertiesEditionRemoveHouse(prop)" class="remove-house">-</div>
                                    <div v-if="prop.level > 0" class="house-number">{{prop.level}}</div>
                                </div>
                                <div v-else>
                                    {{prop.name}}
                                </div>
                            </div>
                            <div v-else class="blank-property"></div>
                        </div>
                    </div> 
                </div>
                <!-- Cartes bonus -->
                <div class="bonus-container" v-if="player.nbJailEscapeCards > 0">
                    <div class="bonus">« Sortir du parlement » ({{player.nbJailEscapeCards}})</div>
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

/**
 * @vuese
 * @group Components
 * Entrée d'un joueur dans la liste de joueurs du jeu (HUD)
 */
export default {
    name: 'PlayerEntry',
    props: {
        // @vuese
        // Le joueur représenté par cette instance de "PlayerEntry"
        player: {
            type: Object,
            required: true
        },
        // @vuese
        // Indique si 'player' est le joueur courant (dont c'est actuellement le tour)
        isCurrent: {
            type: Boolean,
            default: false
        },
        // @vuese
        // Joueur connecté sur ce client
        loggedUser: {
            type: Object,
            required: true
        },
        // @vuese
        // Socket utilisé pour les communications serveur
        socket: {
            type: Object,
            required: true
        }
    },
    components: {
        // @vuese
        // Compteur d'argent animé (permet de faire tourner les chiffres de l'argent des joueurs)
        IOdometer
    },
    data() {
        return {
            // @vuese
            // Types des propriétés et nombre total ([{ name: string, totalNb: int[, cssClass: string] }, ...])
            propertiesTypes: [
                { name: 'brown', totalNb: 2 },
                { name: 'cyan', totalNb: 3 },
                { name: 'purple', totalNb: 3 },
                { name: 'orange', totalNb: 3 },
                { name: 'red', totalNb: 3 },
                { name: 'yellow', totalNb: 3 },
                { name: 'green', totalNb: 3 },
                { name: 'blue', totalNb: 2 },
                { name: 'trainStation', totalNb: 4, cssClass: 'station' },
                { name: 'publicCompany', totalNb: 2, cssClass: 'company' }
            ],
            // @vuese
            // Indique si la fenêtre de propriétés est ouverte (bool)
            showProperties: false,
            // @vuese
            // Affichage d'une carte du joueur : 'false' pour masquer sinon objet 'property'
            overviewCard: false,
            // @vuese
            // Input de proposition d'achat d'une propriété : { open: bool, price: int }
            overviewCardBuy: {
                open: false,
                price: ''
            },
            // @vuese
            // Input de mise en vente (enchère manuelle) d'une propriété : { open: bool, price: int }
            overviewCardSell: {
                open: false,
                price: ''
            },
            // @vuese
            // Edition des propriétés : { open: bool, totalPrice: int, modifications: [] }
            propertiesEdition: {
                open: false,
                totalPrice: 0,
                modifications: []
            }
        }
    },
    mounted() {
        this.popupItem = this.$el;
    },
    computed: {
        // @vuese
        // Renvoie les propriétés du joueur sous forme de tableau d'objets 'property' (et non plus uniquement un tableau d'IDs des propriétés)
        playerPropertiesObj() {
            let propertiesObj = [];
            for (const i in this.player.properties) {
                const property = this.$parent.getPropertyById(this.player.properties[i]);
                if (property)
                    propertiesObj.push(property);
            }
            return propertiesObj
        },
        // @vuese
        // Chemin du fichier contenant l'image du pion du joueur
        playerPawnImgSrc() {
            return `/assets/img/pawns/${this.$parent.CST.PAWNS[this.player.pawn]}.png`;
        }
    },
    methods: {
        /**
         * @vuese
         * Récupère toutes les propriétés du jeu d'un certain type
         * @arg Le type de propriété à récupérer (couleur de la rue ou 'trainStation' ou 'publicCompany')
         */
        allPropertiesByType(type) {
            let res = [];
            for (const i in this.$parent.properties) {
                if (this.$parent.properties[i].type == type.name || this.$parent.properties[i].color == type.name)
                    res.push(this.$parent.properties[i]);
            }
            return res;
        },

        /**
         * @vuese
         * Récupère les propriétés appartenant à un joueur et d'un certain type (par couleur / gare / compagnie publique)
         * @arg Le type de propriété à récupérer (couleur de la rue ou 'trainStation' ou 'publicCompany')
         */
        playerPropertiesByType(type) {
            let res = [];
            for (const i in this.playerPropertiesObj) {
                if (this.playerPropertiesObj[i].type == type.name || this.playerPropertiesObj[i].color == type.name)
                    res.push(this.playerPropertiesObj[i]);
            }
            return res;
        },
        
        /**
         * @vuese
         * Renvoie le nombre de propriétés restantes (qui n'appartiennent pas au joueur) d'un certain type
         * @arg Le type de propriété à considérer (couleur de la rue ou 'trainStation' ou 'publicCompany')
         */
        remainingPropertiesByType(type) {
            return (type.totalNb - this.playerPropertiesByType(type).length);
        },

        /**
         * @vuese
         * Envoie une demande de modification de propriétés au serveur (ajouter/enlever des maisons/hotels sur nos propriétés)
         */
        submitPropertiesEdition() {
            let list = [];
            for (const i in this.propertiesEdition.modifications) {
                list.push({
                    propertyID: this.propertiesEdition.modifications[i].propertyID,
                    level: this.propertiesEdition.modifications[i].level
                });
            }

            this.socket.emit('gamePropertyUpgradeReq', { list: list });

            this.cancelPropertiesEdition();
        },

        /**
         * @vuese
         * Annule l'édition des propriétés en cours (et remets les valeurs avant modification en place)
         */
        cancelPropertiesEdition() {
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

        /**
         * @vuese
         * Enlève la propriété donnée des modifications en cours
         * @arg Propriété à retirer (objet 'property')
         */
        propertiesEditionRemovePropertyFromModifications(property) {
            for (const i in this.propertiesEdition.modifications) {
                if (this.propertiesEdition.modifications[i].propertyID == property.id) {
                    this.propertiesEdition.modifications.splice(i, 1);
                    return;
                }
            }
        },

        /**
         * @vuese
         * Récupère l'index d'une propriété dans la liste des modifications en cours (null si non trouvé)
         * @arg La propriété dont on chercher l'index (objet 'property')
         */
        propertiesEditionGetPropertyModificationIndex(property) {
            for (const i in this.propertiesEdition.modifications) {
                if (this.propertiesEdition.modifications[i].propertyID == property.id)
                    return i;
            }
            return null;
        },

        /**
         * @vuese
         * Ajoute une maison à une propriété dans la liste des modifications en cours
         * @arg Propriété (objet 'property') à laquelle on ajoute une maison
         */
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
                propertyIndex = this.propertiesEdition.modifications.length - 1;
            }

            if (property.level > this.propertiesEdition.modifications[propertyIndex].oldLevel) {
                if (property.level == 5)
                    this.propertiesEdition.totalPrice += property.prices.hostel;
                else
                    this.propertiesEdition.totalPrice += property.prices.house;
            } else {
                if (property.level == 5)
                    this.propertiesEdition.totalPrice += property.prices.hostel / 2;
                else
                    this.propertiesEdition.totalPrice += property.prices.house / 2;
            }
        },

        /**
         * @vuese
         * Retire une maison d'une propriété dans la liste des modifications en cours
         * @arg Propriété (objet 'property') de laquelle on souhaite retirer une maison
         */
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
                propertyIndex = this.propertiesEdition.modifications.length - 1;
            }

            if (property.level >= this.propertiesEdition.modifications[propertyIndex].oldLevel) {
                if (property.level == 4)
                    this.propertiesEdition.totalPrice -= property.prices.hostel;
                else
                    this.propertiesEdition.totalPrice -= property.prices.house;
            } else {
                if (property.level == 4)
                    this.propertiesEdition.totalPrice -= property.prices.hostel / 2;
                else
                    this.propertiesEdition.totalPrice -= property.prices.house / 2;
            }

        },

        /**
         * @vuese
         * Affiche les propriétés du joueur
         */
        showPlayerProperties() {
            this.showProperties = true;
        },

        /**
         * @vuese
         * Masque les propriétés du joueur
         */
        hidePlayerProperties() {
            this.showProperties = false;
            this.hideOverviewCard();
        },
        
        /**
         * @vuese
         * Affiche une carte de propriété du joueur (i.e. détails d'une propriété)
         * @arg La propriété (objet 'property') que l'on veut afficher en détails
         */
        displayOverviewCard(property) {
            this.overviewCard = property;
            this.closeOverviewCardBuy();
            this.closeOverviewCardSell();
        },

        /**
         * @vuese
         * Masque les détails d'une carte du joueur
         */
        hideOverviewCard() {
            this.overviewCard = false;
            this.closeOverviewCardSell();
            this.closeOverviewCardBuy();
        },

        /**
         * @vuese
         * Active l'édition de propriétés
         */
        openPropertiesEdition() {
            this.propertiesEdition.open = true;
        },

        /**
         * @vuese
         * Affiche la popup de vente d'une propriété (input prix de départ)
         */
        openOverviewCardSell() {
            this.overviewCardSell.open = true;
            this.overviewCardSell.price = '';
            // this.$refs.overviewCardSellPrice.focus();
        },

        /**
         * @vuese
         * Affiche la popup de proposition d'achat d'une propriété (input prix proposé)
         */
        openOverviewCardBuy() {
            this.overviewCardBuy.open = true;
            this.overviewCardBuy.price = '';
            // this.$refs.overviewCardBuyPrice.focus();
        },

        /**
         * @vuese
         * Ferme la popup de vente (enchère manuelle) d'une propriété
         */
        closeOverviewCardSell() {
            this.overviewCardSell.open = false;
            this.overviewCardSell.price = '';
        },
        
        /**
         * @vuese
         * Ferme la popup de proposition d'achat d'une propriété
         */
        closeOverviewCardBuy() {
            this.overviewCardBuy.open = false;
            this.overviewCardBuy.price = '';
        },

        /**
         * @vuese
         * Ferme à la fois la popup de vente et de proposition d'achat d'une propriété (si l'une ou les deux sont ouvertes)
         */
        closeOverviewCardBuySell() {
            this.closeOverviewCardSell();
            this.closeOverviewCardBuy();
        },

        /**
         * @vuese
         * Toggle (affiche si fermé, masque si affiché) la popup de vente d'une propriété
         */
        toggleOverviewCardSell() {
            if (this.overviewCardSell.open)
                this.closeOverviewCardSell();
            else
                this.openOverviewCardSell();
        },

        /**
         * @vuese
         * Toggle (affiche si fermé, masque si affiché) la popup de proposition d'achat d'une propriété
         */
        toggleOverviewCardBuy() {
            if (this.overviewCardBuy.open)
                this.closeOverviewCardBuy();
            else
                this.openOverviewCardBuy();
        },

        /**
         * @vuese
         * Envoie une requête de vente (enchère manuelle) au serveur pour une propriété
         */
        sellProperty(propertyID) {
            this.socket.emit('gameManualBidReq', { propertyID: propertyID, initialPrice: this.overviewCardSell.price });
            this.closeOverviewCardSell();
        },

        /**
         * @vuese
         * Envoie une proposition d'achat pour une propriété au serveur (gameOfferSendReq)
         */
        buyProperty(propertyID) {
            this.socket.emit('gameOfferSendReq', { receiverID: this.player.id, propertyID: propertyID, price: this.overviewCardBuy.price });
            this.closeOverviewCardBuy();
        },

        /**
         * @vuese
         * Met une propriété en vente (enchère manuelle) (envoie la requête au serveur)
         * @arg ID de la propriété que l'on souhaite hypothéquer
         */
        mortgageProperty(propertyID) {
            this.socket.emit('gamePropertyMortgageReq', { properties: [propertyID] });
        },

        /**
         * @vuese
         * Rachète l'hypothèque d'une propriété (envoie la requête au serveur)
         * @arg ID de la propriété dont on souhaite racheter l'hypothèque
         */
        rebuyProperty(propertyID) {
            this.socket.emit("gamePropertyUnmortgageReq", { propertyID: propertyID });
        }
    },
    directives: {
        //@vuese
        // Utilisé pour détecter le clic à l'extérieur d'un élément
        ClickOutside
    }

}
</script>