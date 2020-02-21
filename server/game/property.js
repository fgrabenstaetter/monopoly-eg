const Properties = require('../lib/properties');

/**
 * Représente une propriété (rue, gare ou compagnie)
 */
class Property { // classe abstraite

    idCounter = 0;

    /*
     * @param owner Propriétaire de la propriété (Player)
     * @param type Type de la propriété (PROPERTY_TYPE, voir constants.js)
     * @param data L'objet qui contient les données de la propriété (voir properties.js)
     */
    constructor (owner, type, data) {
        this.id = this.idCounter ++;
        this.isMortgaged = false;
        this.owner = owner;
        this.type = type;
        // implémenté chez les classes filles uniquement
        this.load(this.data);
    }
}

module.exports = Property;
