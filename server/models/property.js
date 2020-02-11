const Constants = require('../lib/constants');
const Properties = require('../lib/properties');

/**
 * Représente une propriété (rue, gare ou compagnie)
 */
class Property {
    /*
     * @param id (>= 0) ID de la propriété => permet de trouver les données associées
     * @param owner Propriétaire de la propriété
     */
    constructor (id, owner) {
        this.id = id;
        this.isMortgaged = false;
        this.owner = owner;
        // implémenté chez les classes filles uniquement
        this.load(this.data);
    }

    /**
     * @return L'objet correspondant aux données de l'ID
     */
    get data () {
        let num = this.id;
        if (num < Properties.TRAIN_STATION.length) {
            this.type = Constants.PROPRERTY_TYPE.TRAIN_STATION;
            return Properties.TRAIN_STATION[num];
        }

        num -= Properties.TRAIN_STATION.length;
        if (num < Properties.STREET.length) {
            this.type = Constants.PROPRERTY_TYPE.STREET;
            return Properties.STREET[num];
        }

        num -= Properties.PUBLIC_COMPANY.length;
        this.type = Constants.PROPRERTY_TYPE.PUBLIC_COMPANY;
        return Properties.PUBLIC_COMPANY[num];
    }
}

module.exports = Property;
