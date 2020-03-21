const Constants = require('./constants.js');

// 40 cases donc moins de 40 propriétés
const Properties = {

    TRAIN_STATION: [
        {
            name         : 'Gare de Strasbourg',
            description  : 'Quelle magnifique gare !',
            price        : 200,
            rentalPrices : [25, 50, 100, 200]
        },
        {
            name         : 'Gare de Mulhouse',
            description  : 'Gare perdue',
            price        : 200,
            rentalPrices : [25, 50, 100, 200]
        }
    ],

    STREET: [
        {
            name         : 'Rue de Londres',
            description  : 'Quelle magnifique rue !',
            color        : Constants.STREET_COLOR.RED,
            prices       : {
                empty    : 160,
                house    : 400,
                hostel   : 2000
            },
            rentalPrices : {
                empty    : 12,
                house    : [200, 300, 400, 500],
                hostel   : 800
            }
        },
        {
            name         : 'Rue de test',
            description  : 'ok',
            color        : Constants.STREET_COLOR.RED,
            prices       : {
                empty    : 160,
                house    : 400,
                hostel   : 2000
            },
            rentalPrices : {
                empty    : 12,
                house    : [200, 300, 400, 500],
                hostel   : 800
            }
        }
    ],

    PUBLIC_COMPANY: [
        {
            name        : 'La décheterie',
            description : 'En libre service, venez donc',
            price       : 430,
            rentalPrice : 25
        },
        {
            name        : 'UFR de math Info',
            description : 'Math info top niveau',
            price       : 530,
            rentalPrice : 45
        }
    ]
}

module.exports = Properties;
