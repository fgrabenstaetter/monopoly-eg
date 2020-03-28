
/**
 * Représente une cellule Taxe
 */
class Tax {

    static idCounter = 0;

    /*
     * @param description La description de la taxe
     * @param money L'argent à perdre lorsqu'on tombe sur cette cellule
     */
    constructor (description, money) {
        this.id = Tax.idCounter ++;
        this.description = description;
        this.money = money;
    }
}

module.exports = Tax;
