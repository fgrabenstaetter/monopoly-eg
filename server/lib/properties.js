const Constants = require('./constants.js');

//36 cases donc moins de 36 propriétés
const Properties = {

    TRAIN_STATION: [
        {
            name: 'Gare de Strasbourg',
            description: 'Quelle magnifique gare !',
            price: 200,
            rentalPrices: [25, 50, 100, 200]
        }
    ],

    STREET: [
        {
            name: 'Rue de Londres',
            description: 'Quelle magnifique rue !',
            color: Constants.PROPERTY_COLOR.RED,
            prices: {
                empty: 160,
                house: 400,
                hostel: 2000
            },
            rentalPrices: {
                empty: 12,
                house: [200, 300, 400],
                hostel: 800
            }
        },
    ],

    PUBLIC_COMPANY: [
        {
            name: 'La décheterie',
            description: 'En libre service, venez donc',
            price: 430,
            rentalPrice: 25
        }
    ]
}

module.exports = Properties;
