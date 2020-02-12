const Property = require('./property');

/**
 * Représente une carte "compagnie publique"
 */
class PublicCompany extends Property {

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
        this.rentalPrice = data.rentalPrice;
    }

    /**
     * @return Le prix d'hypothéque de la compagnie
     */
    get mortagePrice () {
        return this.price / 2;
    }
}

module.exports = PublicCompany;
