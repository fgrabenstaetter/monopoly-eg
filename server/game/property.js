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

    toJSON () {
        let owner = null;
        if(this.owner)
            owner = this.owner.id;

        return {
            id: this.id,
            isMortgaged: this.isMortgaged,
            owner: owner,
            type: this.type
        }
    }

    /**
     * @returns Le prix d'hypothéque de la compagnie
     */
    get mortgagePrice () {
        return Math.ceil(this.value / 2);
    }

    get unmortgagePrice () {
        return Math.ceil(this.mortgagePrice * 1.1);
    }

    mortgage (game) {
        if (this.isMortgaged || !this.owner)
            return false;

        game.bank.loseMoney(this.mortgagePrice);
        this.owner.addMoney(this.mortgagePrice);
        this.isMortgaged = true;

        if (this.type === Constants.PROPERTY_TYPE.STREET)
            this.upgrade(0);

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
