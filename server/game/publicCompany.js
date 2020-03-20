const Constants = require('../lib/constants');
const Property  = require('./property');

/**
 * Représente une carte "compagnie publique"
 */
class PublicCompany extends Property {

    constructor (data) {
        super(Constants.PROPERTY_TYPE.PUBLIC_COMPANY, data);
    }

    /**
     * @param data L'objet correspond aux données de l'ID
     */
    load (data) {
        this.name        = data.name;
        this.description = data.description;
        this.price       = data.price;
        this.rentalPrice = data.rentalPrice;
    }

    /**
     * @return Le prix d'hypothéque de la compagnie
     */
    get mortagePrice () {
        return this.price / 2;
    }

    /**
     * @param diceRes [int, int] résultats des dés
     * @return le prix de loyer
     */
    rentalPrice (diceRes) {
        const total = diceRes[0] + diceRes[1];
        let multiplier = 4;
        if (this.owner.haveAllCompanies)
            multiplier = 10;

        return total * multiplier;
    }
}

module.exports = PublicCompany;
