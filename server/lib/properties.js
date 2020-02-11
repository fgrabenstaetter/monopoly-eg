const Constants = require('./constants.js');

//36 cases donc moins de 36 propriétés
const Properties = [
    {
      type: Constants.PROPERTY_TYPE.TRAINSTATION,
      name: 'Gare de Strasbourg',
      description: 'Quelle magnifique gare !',
      price: 200,
      rentalPrices: [25, 50, 100, 200]
    },
    {
      type: Constants.PROPERTY_TYPE.STREET,
      name: 'Rue de Londres',
      description: 'Quelle magnifique rue !',
      price: {
          empty: 160,
          house: 500,
          hostel: 2000
      },
      rentalPrices: {
          empty: 12,
          house: [200, 300, 400],
          hostel: 800
      }
    }
    //Continuer la liste des propriétés possibles (sur le thème de strasbourg)
];

module.exports = Properties;
