const Constants = require('../lib/constants');
const Properties = require('../lib/properties');

/**
 * Représente une propriété (rue, gare ou compagnie)
 */
class Property { // classe abstraite
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
        //Si l'id est strictement inférieur à la taille du tableau TRAIN_STATION alors c'est une propriété de type GARE
        if (num < Properties.TRAIN_STATION.length) {
            this.type = Constants.PROPERTY_TYPE.TRAIN_STATION;
            return Properties.TRAIN_STATION[num];
        }

        //On enlève dans l'id la taille du tableau TRAIN_STATION pour pouvoir refaire le test dans le tableau STREET pour savoir si c'est une RUE
        num -= Properties.TRAIN_STATION.length;
        if (num < Properties.STREET.length) {
            this.type = Constants.PROPERTY_TYPE.STREET;
            return Properties.STREET[num];
        }

        //On enlève dans l'id la taille du tableau STREET pour pouvoir refaire le test dans le tableau PUBLIC_COMPANY pour savoir si c'est une compagnie
        num -= Properties.STREET.length;
        this.type = Constants.PROPERTY_TYPE.PUBLIC_COMPANY;
        return Properties.PUBLIC_COMPANY[num];
    }
}

module.exports = Property;
