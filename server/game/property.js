const Properties = require('../lib/properties');
const Constants  = require('../lib/constants');

/**
 * Représente une propriété (rue, gare ou compagnie)
 */
class Property { // classe abstraite

    static idCounter = 0;

    /*
     * @param type Type de la propriété (PROPERTY_TYPE, voir constants.js)
     * @param data L'objet qui contient les données de la propriété (voir properties.js)
     */
    constructor (type, data) {
        this.id = Property.idCounter ++;
        this.isMortgaged = false;
        this.owner = null; // à la banque, par défaut
        this.type = type;
        // implémenté chez les classes filles uniquement
        this.load(data);
    }

    /**
     * @return Le prix d'hypothéque de la compagnie
     */
    get mortgagePrice () {
        return this.value / 2;
    }

    get unmortgagePrice () {
        return this.mortgagePrice * 1.1;
    }

    mortgage (game) {
        if (this.isMortgaged)
            return false;

        game.bank.loseMoney(this.mortgagePrice);
        this.owner.addMoney(this.mortgagePrice);
        this.isMortgaged = true;

        return true;
    }

    unmortage (game) {
        if (!this.owner || this.unmortgagePrice > this.owner.money)
            return false;

        game.bank.addMoney(this.unmortgagePrice);
        this.owner.loseMoney(this.unmortgagePrice);
        this.isMortgaged = false;
        return true;
    }
}

module.exports = Property;
