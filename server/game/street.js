const Constants  = require('../lib/constants');
const Property   = require('./property');
const Properties = require('../lib/properties')

/**
 * Représente une carte "rue"
 * Classe fille de la classe Propriété
 */
class Street extends Property {

    constructor (owner, data) {
        super(owner, Constants.PROPERTY_TYPE.STREET, data);
        this.housesNb = 0;
        this.hostel = false;
    }

    /**
     * @param data L'objet correspond aux données de l'ID
     */
    load (data) {
        this.name         = data.name;
        this.description  = data.description;
        this.color        = data.color;
        this.prices       = data.prices;
        this.rentalPrices = data.rentalPrices;
    }

    /**
     * @return Le prix d'un terrain vierge de la rue
     */
    get emptyPrice () {
        return this.prices.empty;
    }

    /**
     * @return Le prix d'une maison de la rue
     */
    get housePrice () {
        return this.prices.house;
    }

    /**
     * @return Le prix d'un hôtel de la rue
     */
    get hostelPrice () {
        return this.prices.hostel;
    }

    /**
     * @return Le prix d'un loyer de la rue
     */
    get rentalPrice () {
        let price;
        if (this.hostel)
            price = this.rentalPrices.hostel;
        else if (this.housesNb > 0)
            price = this.rentalPrices.house[this.housesNb - 1];
        else
            price = this.rentalPrices.empty;

        return price * (this.owner.colorMonopoly(this.color) ? 2 : 1);
}

    /**
     * @return Le prix d'hypothèque de la rue
     */
    get mortagePrice () {
        let sum = this.prices.empty;
        if (this.hostel)
            sum += this.prices.hostelPrice + this.prices.house * 3;
        else
            sum += this.prices.house * this.housesNb;

        return sum / 2;
    }

    /**
     * @param level le niveau d'amélioration souhaité (1: une maison, 2: deux maisons, 3: trois maisons, 4: un hôtel)
     */
    upgrade (level) {
        if (level === 4) {
            this.housesNb = 0;
            this.hostel = true;
        } else
            this.housesNb = level;
    }

    /**
     * @param level le niveau d'amélioration souhaité pour le calcul du prix (1: une maison, 2: deux maisons, 3: trois maisons, 4: un hôtel)
     * @return le prix cumulé pour avoir ce niveau d'amélioration
     */
    upgradePrice (level) {
        if (this.hostel)
            return 0;

        let price = 0;
        if (level === 4)
            price = this.prices.hostel + this.prices.house * 3;
        else
            price = this.prices.house * level;

        return price - this.housesNb * this.prices.house;
    }


    /**
     * @return La liste des niveaux d'amélioration avec leur prix assez d'argent, ou null sinon (déjà ce niveau ou trop cher)
     * Si un montant est donnée, il s'agit du montant cumulatif ! Exemple: aucune maison ni hotel, prix niveau 2 = prix niveau 1 + prix niveau 2
     */
    get availableUpgradeLevels () {
        const canLevel1 = !this.hostel && this.housesNb === 0 && this.owner.money >= this.upgradePrice(1);
        const canLevel2 = !this.hostel && this.housesNb <= 1  && this.owner.money >= this.upgradePrice(2);
        const canLevel3 = !this.hostel && this.housesNb <= 2  && this.owner.money >= this.upgradePrice(3);
        const canLevel4 = !this.hostel && this.housesNb === 0 && this.owner.money >= this.upgradePrice(4);

        let list = [], sum = 0;
        list.push(canLevel1 ? sum += this.upgradePrice(1) : null);
        list.push(canLevel2 ? sum += this.upgradePrice(2) : null);
        list.push(canLevel3 ? sum += this.upgradePrice(3) : null);
        list.push(canLevel4 ? sum += this.upgradePrice(4) : null);

        return list;
    }
}

module.exports = Street;
