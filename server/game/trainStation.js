const Property = require('./property');

/**
 * Représente une carte "gare"
 * Classe fille de la classe Propriété
 */
class TrainStation extends Property {

    constructor (id, owner) {
        super(id, owner);
    }

    /**
     * @param data L'objet correspond aux données de l'ID
     */
    load (data) {
        this.name = data.name;
        this.description = data.description;
        this.price = data.price;
        this.rentalPrices = data.rentalPrices;
    }

    /**
     * @return Le prix d'un loyer de la gare
     */
    get rentalPrice () {
        return this.rentalPrices[this.owner.trainStationsNb - 1];
    }

    /**
     * @return Le prix d'hypothèque de la gare
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

module.exports = TrainStation;
