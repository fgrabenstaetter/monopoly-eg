const Property = require('./property');
const Properties = require('../lib/properties')

/**
 * Représente une carte "rue"
 * Classe fille de la classe Propriété
 */
class Street extends Property {

    /**
     * @param game l'instance de partie, utile pour par exemple déterminer si le joueur a toutes les propriétés d'une même couleur, ou non
     */
    constructor (id, owner, game) {
        super(id, owner);
        this.game = game;
        this.housesNb = 0;
        this.hostel = false;
    }

    /**
     * @param data L'objet correspond aux données de l'ID
     */
    load (data) {
        this.name = data.name;
        this.description = data.description;
        this.color = data.color;
        this.prices = data.prices;
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
        if (this.hostel)
            return this.rentalPrices.hostel;
        else if (this.housesNb > 0)
            return this.rentalPrices.house[this.housesNb - 1];
        else
            return this.rentalPrices.empty;
    }

    /**
     * @return Le prix d'hypothèque de la rue
     */
    get mortagePrice () {
        if (this.hostel)
            return this.prices.hostel / 2;
        else if (this.housesNb > 0)
            return this.prices.house * this.housesNb / 2;
        else
            return this.prices.empty / 2;
    }
}

module.exports = Street;
