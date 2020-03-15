const Constants = require('./constants');

const cellsMeta = [{
    id: 0,
    token: 'go',
    name: 'GO',
    description: 'Collect $200.00 salary as you pass',
    type: Constants.CELL_TYPES.START
}, {
    id: 1,
    token: 'mediterranianAve',
    name: 'Mediteranian Avenue',
    description: '$60',
    type: Constants.CELL_TYPES.PROPERTY
}, {
    id: 2,
    token: 'communityChest',
    name: 'Community Chest',
    description: 'Follow instructions on top card',
    type: Constants.CELL_TYPES.COMMUNITY_CHEST
}, {
    id: 3,
    token: 'balticAve',
    name: 'Baltic Avenue',
    description: '$60',
    type: Constants.CELL_TYPES.PROPERTY
}, {
    id: 4,
    token: 'incomeTax',
    name: 'Income Tax',
    description: 'Pay $200 Income Tax',
    type: Constants.CELL_TYPES.OTHER
}, {
    id: 5,
    token: 'gareStrasbourg',
    name: 'Gare de Strasbourg',
    description: 'Quelle magnifique gare!',
    type: Constants.CELL_TYPES.PROPERTY
}, {
    id: 6,
    token: 'orientalAvenue',
    name: 'Oriental Avenue',
    description: '$200',
    type: Constants.CELL_TYPES.PROPERTY
}, {
    id: 7,
    token: 'chance',
    name: 'Chance',
    description: 'Follow instructions on top card',
    type: Constants.CELL_TYPES.CHANCE
}];

module.exports = cellsMeta;
