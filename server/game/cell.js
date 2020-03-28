const Constants = require('./../lib/constants');

/**
 * Représente une case du plateau de jeu
 */
class Cell {
    /**
     * @param type Type de case (voir CELL_TYPE)
     * @param obj Propriété associée à la case (si type propriété) ou Taxe associée (si type taxe)
     */
    constructor (type, obj = null) {
        this.type     = type;
        this.property = this.type === Constants.CELL_TYPE.PROPERTY ? obj : null;
        this.tax      = this.type === Constants.CELL_TYPE.TAX ? obj : null;
    }
}

module.exports = Cell;
