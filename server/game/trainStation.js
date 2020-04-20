const Constants = require('../lib/constants');
const Property  = require('./property');

/**
 * Représente une carte "gare"
 * Classe fille de la classe Propriété
 */
class TrainStation extends Property {

    constructor (data) {
        super(Constants.PROPERTY_TYPE.TRAIN_STATION, data);
    }

    /**
     * @param data L'objet correspond aux données de l'ID
     */
    load (data) {
        this.name         = data.name;
        this.description  = data.description;
        this.price        = data.price;
        this.rentalPrices = data.rentalPrices;
    }

    /**
     * @return Le prix d'un loyer de la gare
     */
    get rentalPrice () {
        return this.rentalPrices[this.owner.trainStationsNb - 1];
    }

    /**
     * @return La valeur totale de la gare
     */
    get value () {
        return this.price;
    }
}

module.exports = TrainStation;
