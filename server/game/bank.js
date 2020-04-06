const Constants  = require('../lib/constants');
const Properties = require('../lib/properties');

/**
 * Représente la banque du jeu
 */
class Bank {

    /**
     * @param cells Toutes les cellules du jeu (liste de Cell)
     */
    constructor (cells) {
        this.money = Constants.GAME_PARAM.BANK_INITIAL_MONEY;
        this.debts = []; // array of [playerID, money]
        this.properties = [];
        for (const cell of cells)
            if (cell.property)
                this.addProperty(cell.property);
    }

    /**
     * @param money Argent à encaisser
     */
    addMoney (money) {
        this.money += money;
    }

    /**
     * @param money Argent à retirer
     */
    loseMoney (money) {
        this.money -= money;
        if (this.money < 0)
            this.money = 0; // la banque ne faillite jamais
    }

    /**
     * @param property La propriété à ajouter
     */
    addProperty (property) {
        property.owner = null;
        if (property.type === Constants.CELL_TYPE.STREET) {
            property.housesNb = 0;
            property.hasHostel = false;
        }
        this.properties.push(property);
    }

    /**
     * @param property La propriété à retirer
     */
    delProperty (property) {
        const ind = this.properties.indexOf(property);
        if (ind !== -1)
            this.properties.splice(ind, 1);
    }

    /**
     * @param player Le joueur auquel ajouter un montant de dette
     * @param money Le montant de la dette
     */
    addDebt (player, money) {
        for (const debt of this.debts) {
            if (debt[0] === player.id) {
                // ajouter le montant à la dette actuelle
                debt[1] += money;
                return;
            }
        }

        this.debts.push([ player.id, money ]);
    }

    /**
     * @param player Le joueur qui veut être payé
     * @retrun true si le paiement a réussi, false sinon (= banque n'a pas assez d'argent)
     */
    payDebt (player) {
        for (const debt of this.debts) {
            if (debt[0] === player.id) {
                if (this.money >= debt[1]) {
                    this.loseMoney(debt[1]);
                    player.addMoney(debt[1]);
                    return true;
                } else
                    return false
            }
        }

        return false;
    }
}

module.exports = Bank;
