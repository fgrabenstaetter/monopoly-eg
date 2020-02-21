const Constants = require('../lib/constants');
const Properties = require('../lib/properties');
const Cell = require('../game/cell');
const Street = require('../game/street');
const PublicCompany = require('../game/publicCompany');
const TrainStation = require('../game/trainStation');

module.exports = [
    new Cell(Constants.CELL_TYPE.START, null), // case 0
    new Cell(Constants.CELL_TYPE.PROPERTY, new Street(null, Properties.STREET[0])), // case 1
    new Cell(Constants.CELL_TYPE.PROPERTY, new TrainStation(null, Properties.TRAIN_STATION[0])), // case 2
    new Cell(Constants.CELL_TYPE.COMMUNITY_CARD, null) // case 3
];
