const Constants = require('./constants');

cellsMeta =  [{
    id: 0,
    token: 'go',
    name: 'GO',
    description: 'Collect $200.00 salary as you pass',
    type: Constants.cellTypes.start
}, {
    id: 1,
    token: 'mediterranianAve',
    name: 'Mediteranian Avenue',
    description: '$60',
    type: Constants.cellTypes.property
}, {
    id: 2,
    token: 'communityChest',
    name: 'Community Chest',
    description: 'Follow instructions on top card',
    type: Constants.cellTypes.communityChest
}, {
    id: 3,
    token: 'balticAve',
    name: 'Baltic Avenue',
    description: '$60',
    type: Constants.cellTypes.property
}, {
    id: 4,
    token: 'incomeTax',
    name: 'Income Tax',
    description: 'Pay $200 Income Tax',
    type: Constants.cellTypes.other
}, {
    id: 5,
    token: 'gareStrasbourg',
    name: 'Gare de Strasbourg',
    description: 'Quelle magnifique gare!',
    type: Constants.cellTypes.property
}, {
    id: 6,
    token: 'orientalAvenue',
    name: 'Oriental Avenue',
    description: '$200',
    type: Constants.cellTypes.property
}, {
    id: 7,
    token: 'chance',
    name: 'Chance',
    description: 'Follow instructions on top card',
    type: Constants.cellTypes.chance
}];

module.exports = cellsMeta;
