const Constants  = require('../lib/constants');
const Property   = require('./property');
const Properties = require('../lib/properties')

/**
 * Représente une carte "rue"
 * Classe fille de la classe Propriété
 */
class Street extends Property {

    constructor (data) {
        super(Constants.PROPERTY_TYPE.STREET, data);
        this.housesNb = 0;
        this.hostel = false;
    }

    /**
     * @param data L'objet correspond aux données de l'ID
     */
    load (data) {
        this.name         = data.name;
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
     * @return La valeur totale de la rue
     */
    get value () {
        let sum = this.prices.empty;
        if (this.hostel)
            sum += this.prices.hostelPrice + this.prices.house * 4;
        else
            sum += this.prices.house * this.housesNb;

        return sum;
    }

    /**
     * @param level le niveau d'amélioration souhaité (1: une maison, 2: deux maisons, 3: trois maisons, 4: quatre maisons, 5: un hôtel)
     * Peut être augmenté ou diminué, les modifs de l'argent du joueur doivent déjà avoir été faites
     */
    upgrade (level) {
        this.housesNb = 0;
        this.hostel = false;
        if (level === 5)
            this.hostel = true;
        else
            this.housesNb = level;
    }

    /**
     * @param level le niveau d'amélioration souhaité pour le calcul du prix (1: une maison, 2: deux maisons, 3: trois maisons, 4: quatre maisons, 5: un hôtel)
     * @return la différence de prix pour avoir ce niveau d'amélioration (> 0 augmentation de l'amélioration, < 0 diminution de l'amélioration, == 0 même niveau)
     * Si diminution du niveau d'amélioration, l'argent gagné par le joueur est / 2 (prix de vente maison/hotel = prix d'achat / 2)
     */
    upgradePrice (level) {
        let money = this.cumulatedUpgradePrice(level) - this.cumulatedUpgradePrice(this.curUpgradeLevel);
        if (money < 0)
            money /= 2;

        return money;
    }

    /**
     * @param level Le niveau d'amélioration désiré
     * @return Le prix pour atteindre ce niveau depuis 0
     */
    cumulatedUpgradePrice (level) {
        if (level === 5)
            return 4 * this.housePrice + this.hostelPrice;
        else
            return this.housePrice * level;
    }

    get curUpgradeLevel () {
        if (this.hostel)
            return 5;
        else
            return this.housesNb;
    }

}

module.exports = Street;
