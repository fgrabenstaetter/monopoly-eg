const Constants = require('./../lib/constants');


class Property {
    constructor(meta) {
        this.token = meta.token;
        this.name = meta.name;
        this.description = meta.description;
        this.buyingPrice = meta.buyingPrice;
        this.rentalPrice = meta.rentalPrice;
        this.type = meta.type;
        this.owner = null;

        this.calculateRent = {
            TRAIN_STATION: this.trainStationRent,
            STREET: this.streetRent,
            PUBLIC_COMPANY: this.publicCompanyRent
        }[this.type];

        if (this.type == Constants.PROPERTY_TYPES.STREET) {
            this.housesCount = 0;
            this.hasHotel = false;
            this.color = meta.color;
        }
    }

    /**
     @param
     */
    execute (game, player) {
        if(this.owner == null) {
            // la propriete n'est achetee par personne, on propose de l'acheter
        } else if (this.owner == player) {
            // on est arrive sur notre propre propriete, on peut construire
        } else {
            // si la propriete est achetee deja, il faut payer le loyer
            this.payRent(game, player);
        }
    }

    payRent(game, player) {
        let rentAmount = this.calculateRent(game);
    }

    trainStationRent (game) {
        // pour chaque train station que le joueur possede, on double
        let tranStationsCount = this.owner.getPropertiesByType(Constants.PROPERTY_TYPES.TRAIN_STATION).length;
        return {
            1: 25,
            2: 50,
            3: 100,
            4: 200
        }[tranStationsCount];
    }

    streetRent (game) {
        // si on a un hotel, retourne directement le prix de hotel
        if (this.hasHotel)
            return this.rentalPrice['hotel']

        // si on n'a pas de maisons, c'est soit prix ordinaire soit monopole
        if (this.housesCount == 0) {
            if (this.owner.sameStreetColorNb(this.color) == game.map.colorsCount[this.color])
                // monopole quand le joueur detient toutes les rues de cette couleur
                return this.rentalPrice['monopoly'];
            else
                // prix ordinaire
                return this.rentalPrice['simple'];
        }

        // sinon, ca depend du nombre de maisons
        return this.rentalPrice[this.housesCount.toString()];
    }

    publicCompanyRent (game) {
        let companiesCount = this.owner.getPropertiesByType(Constants.PROPERTY_TYPES.PUBLIC_COMPANY).length;

        let multiplier = null;
        if (companiesCount == game.map.publicCompaniesCount)
            // si le joueur detienne tous les entreprises, c'est 10x dice roll
            multiplier = 10;
        else
            // sinon c'est 4x dice roll
            multiplier = 4;

        let diceRoll = game.map.throwDices();
        let res = (diceRoll[0] + diceRoll[1]) * multiplier;
        return res;
    }
 }

module.exports = Property;
