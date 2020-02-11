const Constants = require('../lib/constants.js');
const Properties = require('../lib/properties.js');


class Property {
    constructor (id) {
        this.id = id;
        this.isMortgaged = false;
        this.load();
    }

    load () {
        const prop = Properties[this.id];
        //faire test
        this.name = prop.name;
        this.type = prop.type;
        this.description = prop.description;
        this.rentalPrices = prop.rentalPrices;
        this.mortgagePrice = prop.mortgagePrice;
    }
    //Faire méthodes getRealRentalPrice par rapport aux types sans passer par des sous-classes

    get realRentalPrice () {
        switch (this.type) {
            case Constants.PROPERTY_TYPE.STREET:
                break;

            case Constants.PROPERTY_TYPE.TRAINSTATION:
                break;

            case Constants.PROPERTY_TYPE.PUBLICCOMPANY:
                break;
        }
    }

    get mortgagePrice () {

    }
}

module.exports = Property;
