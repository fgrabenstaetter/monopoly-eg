const Constants = require('./constants.js');

// 40 cases donc moins de 40 propriétés
const Properties = {

    TRAIN_STATION: [
        {
            name: 'Homme de Fer',
            price: 200,
            rentalPrices: [25, 50, 100, 200]
        },
        {
            name: "Droits de l'Homme",
            price: 200,
            rentalPrices: [25, 50, 100, 200]
        },
        {
            name: 'Université',
            price: 200,
            rentalPrices: [25, 50, 100, 200]
        },
        {
            name: "Porte de l'Hôpital",
            price: 200,
            rentalPrices: [25, 50, 100, 200]
        }
    ],

    STREET: [
        {
            name: 'Rue du Vieux Marché aux Poissons',
            color: Constants.STREET_COLOR.BROWN,
            prices: {
                empty: 60,
                house: 50,
                hostel: 250
            },
            rentalPrices: {
                empty: 2,
                house: [10, 30, 90, 160],
                hostel: 250
            }
        },
        {
            name: 'Rue des Tonneliers',
            color: Constants.STREET_COLOR.BROWN,
            prices: {
                empty: 60,
                house: 50,
                hostel: 250
            },
            rentalPrices: {
                empty: 4,
                house: [20, 60, 180, 320],
                hostel: 450
            }
        },
        {
            name: 'Faubourg de Saverne',
            color: Constants.STREET_COLOR.LIGHTBLUE,
            prices: {
                empty: 100,
                house: 50,
                hostel: 250
            },
            rentalPrices: {
                empty: 6,
                house: [30, 90, 270, 400],
                hostel: 550
            }
        },
        {
            name: 'Avenue des Vosges',
            color: Constants.STREET_COLOR.LIGHTBLUE,
            prices: {
                empty: 100,
                house: 50,
                hostel: 250
            },
            rentalPrices: {
                empty: 6,
                house: [30, 90, 270, 400],
                hostel: 550
            }
        },
        {
            name: 'Rue Oberlin',
            color: Constants.STREET_COLOR.LIGHTBLUE,
            prices: {
                empty: 120,
                house: 50,
                hostel: 250
            },
            rentalPrices: {
                empty: 8,
                house: [40, 100, 300, 450],
                hostel: 600
            }
        },
        {
            name: 'Chemin du Wacken',
            color: Constants.STREET_COLOR.PURPLE,
            prices: {
                empty: 140,
                house: 100,
                hostel: 500
            },
            rentalPrices: {
                empty: 10,
                house: [50, 150, 450, 625],
                hostel: 750
            }
        },
        {
            name: 'Rue Pierre de Coubertin',
            color: Constants.STREET_COLOR.PURPLE,
            prices: {
                empty: 140,
                house: 100,
                hostel: 500
            },
            rentalPrices: {
                empty: 10,
                house: [50, 150, 450, 625],
                hostel: 750
            }
        },
        {
            name: 'Boulevard de Dresde',
            color: Constants.STREET_COLOR.PURPLE,
            prices: {
                empty: 160,
                house: 100,
                hostel: 500
            },
            rentalPrices: {
                empty: 12,
                house: [60, 180, 500, 700],
                hostel: 900
            }
        },
        {
            name: 'Rue Boecklin',
            color: Constants.STREET_COLOR.ORANGE,
            prices: {
                empty: 180,
                house: 100,
                hostel: 500
            },
            rentalPrices: {
                empty: 14,
                house: [70, 200, 550, 750],
                hostel: 950
            }
        },
        {
            name: 'Impasse des Bosquets',
            color: Constants.STREET_COLOR.ORANGE,
            prices: {
                empty: 180,
                house: 100,
                hostel: 500
            },
            rentalPrices: {
                empty: 14,
                house: [70, 200, 550, 750],
                hostel: 950
            }
        },
        {
            name: "Avenue de l'Europe",
            color: Constants.STREET_COLOR.ORANGE,
            prices: {
                empty: 200,
                house: 100,
                hostel: 500
            },
            rentalPrices: {
                empty: 14,
                house: [80, 220, 600, 800],
                hostel: 1000
            }
        },
        {
            name: 'Allée de la Robertsau',
            color: Constants.STREET_COLOR.RED,
            prices: {
                empty: 220,
                house: 150,
                hostel: 750
            },
            rentalPrices: {
                empty: 18,
                house: [90, 250, 700, 875],
                hostel: 1050
            }
        },
        {
            name: 'Rue Fischart',
            color: Constants.STREET_COLOR.RED,
            prices: {
                empty: 220,
                house: 150,
                hostel: 750
            },
            rentalPrices: {
                empty: 18,
                house: [90, 250, 700, 875],
                hostel: 1050
            }
        },
        {
            name: 'Avenue de la Forêt Noire',
            color: Constants.STREET_COLOR.RED,
            prices: {
                empty: 240,
                house: 150,
                hostel: 750
            },
            rentalPrices: {
                empty: 20,
                house: [100, 300, 750, 925],
                hostel: 1100
            }
        },
        {
            name: 'Avenue du Général de Gaulle',
            color: Constants.STREET_COLOR.YELLOW,
            prices: {
                empty: 260,
                house: 150,
                hostel: 750
            },
            rentalPrices: {
                empty: 22,
                house: [110, 330, 800, 975],
                hostel: 1150
            }
        },
        {
            name: 'Rue de Rome',
            color: Constants.STREET_COLOR.YELLOW,
            prices: {
                empty: 260,
                house: 150,
                hostel: 750
            },
            rentalPrices: {
                empty: 22,
                house: [110, 330, 800, 975],
                hostel: 1150
            }
        },
        {
            name: 'Rue Descartes',
            color: Constants.STREET_COLOR.YELLOW,
            prices: {
                empty: 280,
                house: 150,
                hostel: 750
            },
            rentalPrices: {
                empty: 24,
                house: [120, 360, 850, 1025],
                hostel: 1200
            }
        },
        {
            name: 'Rue des Balayeurs',
            color: Constants.STREET_COLOR.GREEN,
            prices: {
                empty: 300,
                house: 200,
                hostel: 1000
            },
            rentalPrices: {
                empty: 26,
                house: [130, 390, 900, 1100],
                hostel: 1275
            }
        },
        {
            name: 'Rue des Orphelins',
            color: Constants.STREET_COLOR.GREEN,
            prices: {
                empty: 300,
                house: 200,
                hostel: 1000
            },
            rentalPrices: {
                empty: 26,
                house: [130, 390, 900, 1100],
                hostel: 1275
            }
        },
        {
            name: 'Rue de la Première Armée',
            color: Constants.STREET_COLOR.GREEN,
            prices: {
                empty: 320,
                house: 200,
                hostel: 1000
            },
            rentalPrices: {
                empty: 28,
                house: [150, 450, 1000, 1200],
                hostel: 1400
            }
        },
        {
            name: 'Rue des Grandes Arcades',
            color: Constants.STREET_COLOR.BLUE,
            prices: {
                empty: 350,
                house: 200,
                hostel: 1000
            },
            rentalPrices: {
                empty: 35,
                house: [175, 500, 1100, 1300],
                hostel: 1500
            }
        },
        {
            name: 'Rue des Orfèvres',
            color: Constants.STREET_COLOR.BLUE,
            prices: {
                empty: 400,
                house: 200,
                hostel: 1000
            },
            rentalPrices: {
                empty: 50,
                house: [200, 600, 1400, 1700],
                hostel: 2000
            }
        }
    ],

    PUBLIC_COMPANY: [
        {
            name: 'Eléctricité de Strasbourg',
            price: 150
        },
        {
            name: "Syndicat Des Eaux et de l'Assainissement",
            price: 150
        }
    ]
}

module.exports = Properties;
