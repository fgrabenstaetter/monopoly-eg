const Constants = require('../lib/constants');
const Properties = require('../lib/properties');

/**
 * Représente un joueur dans une partie
 */
class Player {
    /**
     * @param user L'utilisateur associé au joueur
     * @param pawn Son pion
     */
    constructor (user, pawn) {
        this.id = user.id;
        this.user = user;
        this.pawn = pawn;
        this.isReady = false; // synchronisation de tous les joueurs avant lancement de partie
        this.failure = false;

        this.money = 1500; // argent initial
        this.cellInd = 0;
        this.properties = [];
        this.jailJokerCards = 0;
        this.remainingTurnsInJail = 0;
    }

    /**
     * @return true si le joueur est en prison, false sinon
     */
    get isInPrison () {
        return this.remainingTurnsInJail > 0;
    }

    /**
     * @return le nombre de gares que possède le joueur
     */
    get trainStationsNb () {
        let nb = 0;
        for (const prop of this.properties) {
            if (prop.type === Constants.PROPERTY_TYPE.TRAIN_STATION)
                nb ++;
        }

        return nb;
    }

    get nickname () {
        return this.user.nickname;
    }

    addMoney (amount) {
        this.money = this.money + amount;
    }

    loseMoney (amount) {
        if(this.money < amount) {
            this.money = 0;
            return false;
        } else {
            this.money = this.money - amount;
            return true;
        }
    }

    goPrison () {
        this.remainingTurnsInJail = 3;
    }

    escapePrison () {
        this.remainingTurnsInJail = 0;
    }

    /**
     * @param prop La propriété à ajouter au joueur
     */
    addProperty (prop) {
        this.properties.push(prop);
    }

    /**
     * @param prop La propriété à supprimer du joueur
     */
    delProperty (prop) {
        const ind = this.properties.indexOf(prop);
        if (ind !== -1)
            this.properties.splice(ind, 1);
    }

    /**
     * @param id L'ID de la propriété à chercher
     * @return La propriété si trouvée, sinon false
     */
    propertyByID (id) {
        for (const prop of this.properties) {
            if (prop.id === id)
                return prop;
        }

        return false;
    }

    /**
     * @param color La couleur recherchée de type PROPERTY_COLOR (constants)
     * @return true si le joueur possède toutes les rues de cette couleur, false sinon
     */
    colorMonopoly (color) {
        let nb = 0, total = 0;

        for (const prop of this.properties) {
            if (prop.type === Constants.PROPERTY_TYPE.STREET && prop.color === color)
                nb ++;
        }
        for (const prop of Properties.STREET) {
            if (prop.color === color)
                total ++;
        }

        return nb === total;
    }
}

module.exports = Player;
