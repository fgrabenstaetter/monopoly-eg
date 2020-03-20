const Properties = require('../lib/properties');
const Constants  = require('../lib/constants');

/**
 * Représente une propriété (rue, gare ou compagnie)
 */
class Property { // classe abstraite

    idCounter = 0;

    /*
     * @param type Type de la propriété (PROPERTY_TYPE, voir constants.js)
     * @param data L'objet qui contient les données de la propriété (voir properties.js)
     */
    constructor (type, data) {
        this.id = this.idCounter ++;
        this.isMortgaged = false;
        this.owner = null; // à la banque, par défaut
        this.type = type;
        // implémenté chez les classes filles uniquement
        this.load(data);
    }
}

module.exports = Property;
