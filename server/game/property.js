const Properties = require('../lib/properties');
const Constants = require('../lib/constants');

/**
 * Représente une propriété (rue, gare ou compagnie)
 */
class Property { // classe abstraite

    idCounter = 0;

    /*
     * @param owner Propriétaire de la propriété (Player) ou null si à la banque
     * @param type Type de la propriété (PROPERTY_TYPE, voir constants.js)
     * @param data L'objet qui contient les données de la propriété (voir properties.js)
     */
    constructor (owner, type, data) {
        this.id = this.idCounter ++;
        this.isMortgaged = false;
        this.owner = owner;
        this.type = type;
        // implémenté chez les classes filles uniquement
        this.load(data);
    }

    get typeStr () {
        switch (this.type) {
            case Constants.PROPERTY_TYPE.STREET:
                return 'street';
            case Constants.PROPERTY_TYPE.PUBLIC_COMPANY:
                return 'publicCompany';
            case Constants.PROPERTY_TYPE.TRAIN_STATION:
                return 'trainStation';
            default:
                return null;
        }
    }
}

module.exports = Property;
