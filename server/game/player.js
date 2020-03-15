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
        this.user       = user;
        this.pawn       = pawn;
        this.isReady    = false; // synchronisation de tous les joueurs avant lancement de partie
        this.failure    = false;
        this.money      = 1500; // argent initial
        this.currentCell = null;
        this.properties = [];

        this.jailJokerCards       = 0;
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
        for (let prop of this.properties)
            if (prop.type === Constants.PROPERTY_TYPES.TRAIN_STATION)
                nb ++;

        return nb;
    }

    get id () {
        return this.user.id;
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

    quitPrison () {
        this.remainingTurnsInJail = 0;
    }

    /**
     * @param property La propriété à ajouter au joueur
     */
    addProperty (property) {
        property.owner = this;
        this.properties.push(property);
    }

    /**
     * @param propertyToken le token de la propriete a verifier
     */
    getProperty (propertyToken) {
        for (let property of this.properties)
            if (property.token == propertyToken)
                return property;
    }

    /**
     * @param property La propriété à supprimer du joueur
     */
    delProperty (property) {
        const ind = this.properties.indexOf(property);
        if (ind !== -1)
            this.properties.splice(ind, 1);
        property.owner = null;
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

    getPropertiesByType (type) {
        let properties = [];
        for (let property of this.properties)
            if (property.type == type)
                properties.push(property);

        return properties;
    }

    /**
     * @param color La couleur recherchée de type PROPERTY_COLOR (constants)
     * @return true si le joueur possède toutes les rues de cette couleur, false sinon
     */
    sameStreetColorNb (color) {
        let nb = 0;
        for (const prop of this.getPropertiesByType(Constants.PROPERTY_TYPES.STREET)) {
            if (prop.color === color)
                nb ++;
        }
        return nb;
    }
}

module.exports = Player;
