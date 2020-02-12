const Constants = require('./../lib/constants');

/**
 * Représente une case du plateau de jeu
 */
class Cell {
    /**
     * @param id ID de la case
     * @param type Type de case (voir CELL_TYPE)
     * @param property Propriété associée à la case (le cas échéant)
     */
    constructor (id, type, property) {
        this.id = id;
        this.type = type;
        this.property = property;
    }

    get name() {
        switch (this.type) {
            case Constants.CELL_TYPE.PARC:
                return 'Parc';
            case Constants.CELL_TYPE.PRISON:
                return 'Prison';
            case Constants.CELL_TYPE.PROPERTY:
                return ''; // Il faudra retourner le nom de la propriété (classe à implémenter...)
            case Constants.CELL_TYPE.CHANCE_CARD:
                return 'Carte chance';
            case Constants.CELL_TYPE.COMMUNITY_CARD:
                return 'Carte de communauté';
            default:
                return 'N/C';
        }
    }
}

module.exports = Cell;
