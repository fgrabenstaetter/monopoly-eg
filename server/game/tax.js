
/**
 * Représente une cellule Taxe
 */
class Tax {

    static idCounter = 0;

    /*
     * @param name Le nom (description) de la taxe
     * @param money L'argent à perdre lorsqu'on tombe sur cette cellule
     */
    constructor (name, money) {
        this.id = Tax.idCounter ++;
        this.name = name;
        this.money = money;
    }
}

module.exports = Tax;
