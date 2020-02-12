const Property = require('./property');

/**
 * Représente une carte "rue"
 * Classe fille de la classe Propriété
 */
class Street extends Property {

    constructor (id, owner) {
        super(id, owner);
        this.housesNb = 0;
        this.hostel = false;
        this.housePrice = this.price.house;
        this.hostelPrice = this.price.hostel;
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
