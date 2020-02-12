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
        //this.load(this.data);
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

/*PETITS TESTS RAPIDE*/
/*const toto = new Property (0, "François");
let varr = toto.data;

const tata = new Property (1, "Danyl");
let varr2 = tata.data;

const tutu = new Property (2, "BenJ");
let varr3 = tutu.data;

const titi = new Property (3, "Hello");
let varr4 = titi.data;

const tete = new Property (4, "World");
let varr5 = tete.data;

let tab = [toto, tata, tutu, titi, tete];
let tab2 = [];

for (i = 0; i < 5; i++) {
    tab2[i] = tab[i].data;
    console.log(tab2[i]);
    console.log(tab[i].id)
}*/

module.exports = Property;
