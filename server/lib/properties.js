const Constants = require('./constants');

/*
const propertiesMeta = [{
    token: 'gareStrasbourg',
    name: 'Gare de Strasbourg',
    description: 'Quelle magnifique gare!',
    buyingPrice: 200,
    rentalPrices: [25, 50, 100, 200],
    type: Constants.PROPERTY_TYPES.TRAIN_STATION
}, {
    token: 'gareMulhouse',
    name: 'Gare de Mulhouse',
    description: 'Gare perdue!',
    buyingPrice: 200,
    rentalPrices: [25, 50, 100, 200],
    type: Constants.PROPERTY_TYPES.TRAIN_STATION
}, {
    token: 'rueLondres',
    description: 'Quelle magnifique rue!',
    color: Constants.PROPERTY_COLOR.RED,
    buyingPrice: 160,
    rentalPrice: 12,
    buyingPrices: {
        house: 400,
        hostel: 2000
    },
    rentalPrices: {
        house: [200, 300, 400],
        hostel: 800
    }
}, {
    token: 'laDecheterie',
    description: 'En libre service, venez donc',
    buyingPrice: 430,
    rentalPrice: 45
}];
*/
const propertiesMeta = [{
    token: 'gareStrasbourg',
    name: 'Gare de Strasbourg',
    description: 'Quelle magnifique gare!',
    buyingPrice: 200,
    rentalPrice: 25,
    type: Constants.PROPERTY_TYPES.TRAIN_STATION
}, {
    token: 'gareMulhouse',
    name: 'Gare de Mulhouse',
    description: 'Gare perdue',
    buyingPrice: 200,
    rentalPrice: 25,
    type: Constants.PROPERTY_TYPES.TRAIN_STATION
}, {
    token: 'electricCompany',
    name: 'Electric Company',
    description: 'What a magnificent electric company!',
    buyingPrice: 150,
    rentalPrice: null,
    type: Constants.PROPERTY_TYPES.PUBLIC_COMPANY
}, {
    token: 'waterWorks',
    name: 'Water Works',
    description: 'What a magnificent water company!',
    buyingPrice: 150,
    rentalPrice: null, // dice throw
    type: Constants.PROPERTY_TYPES.PUBLIC_COMPANY
}, {
    token: 'mediterranianAve', // https://monopoly.fandom.com/wiki/Mediterranean_Avenue
    name: 'Mediterranean Avenue',
    description: 'Quelle magnifique rue!',
    buyingPrice: 60,
    rentalPrice: {
        simple: 2,
        monopoly: 4,
        1: 10,
        2: 30,
        3: 90,
        4: 160,
        hotel: 250 // price with a hotel
    },
    type: Constants.PROPERTY_TYPES.STREET,
    color: Constants.STREET_COLORS.RED
}, {
    token: 'balticAve', // https://monopoly.fandom.com/wiki/Mediterranean_Avenue
    name: 'Baltic Avenue',
    description: 'Quelle magnifique rue!',
    buyingPrice: 60,
    rentalPrice: {
        simple: 4,
        monopoly: 8,
        1: 20,
        2: 60,
        3: 180,
        4: 320,
        hotel: 450
    },
    type: Constants.PROPERTY_TYPES.STREET,
    color: Constants.STREET_COLORS.RED
}];

module.exports = propertiesMeta;
