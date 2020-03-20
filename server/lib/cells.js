const Constants     = require('../lib/constants');
const Properties    = require('../lib/properties');
const Cell          = require('../game/cell');
const Street        = require('../game/street');
const PublicCompany = require('../game/publicCompany');
const TrainStation  = require('../game/trainStation');

// Il doit toujours y avoir 40 cellules
// Cellules EXEMPLE pour l'instant :
module.exports = [
    new Cell(Constants.CELL_TYPE.OTHER     , null),                                            // case 0 = Départ
    new Cell(Constants.CELL_TYPE.PROPERTY  , new Street(Properties.STREET[0])),                // case 1
    new Cell(Constants.CELL_TYPE.PROPERTY  , new TrainStation(Properties.TRAIN_STATION[0])),   // case 2
    new Cell(Constants.CELL_TYPE.COMMUNITY , null),                                            // case 3
    new Cell(Constants.CELL_TYPE.PROPERTY  , new Street(Properties.STREET[0])),                // case 4
    new Cell(Constants.CELL_TYPE.PROPERTY  , new PublicCompany(Properties.PUBLIC_COMPANY[0])), // case 5
    new Cell(Constants.CELL_TYPE.CHANCE    , null),                                            // case 6
    new Cell(Constants.CELL_TYPE.PROPERTY  , new Street(Properties.STREET[0])),                // case 7
    new Cell(Constants.CELL_TYPE.PROPERTY  , new TrainStation(Properties.TRAIN_STATION[0])),   // case 8
    new Cell(Constants.CELL_TYPE.COMMUNITY , null),                                            // case 9
    new Cell(Constants.CELL_TYPE.PROPERTY  , new Street(Properties.STREET[0])),                // case 10
    new Cell(Constants.CELL_TYPE.PROPERTY  , new TrainStation(Properties.TRAIN_STATION[0])),   // case 11
    new Cell(Constants.CELL_TYPE.COMMUNITY , null),                                            // case 12
    new Cell(Constants.CELL_TYPE.PROPERTY  , new Street(Properties.STREET[0])),                // case 13
    new Cell(Constants.CELL_TYPE.PROPERTY  , new TrainStation(Properties.TRAIN_STATION[0])),   // case 14
    new Cell(Constants.CELL_TYPE.CHANCE    , null),                                            // case 15
    new Cell(Constants.CELL_TYPE.PROPERTY  , new Street(Properties.STREET[0])),                // case 16
    new Cell(Constants.CELL_TYPE.PROPERTY  , new TrainStation(Properties.TRAIN_STATION[0])),   // case 17
    new Cell(Constants.CELL_TYPE.COMMUNITY , null),                                            // case 18
    new Cell(Constants.CELL_TYPE.PROPERTY  , new Street(Properties.STREET[0])),                // case 19
    new Cell(Constants.CELL_TYPE.PROPERTY  , new TrainStation(Properties.TRAIN_STATION[0])),   // case 20
    new Cell(Constants.CELL_TYPE.COMMUNITY , null),                                            // case 21
    new Cell(Constants.CELL_TYPE.PROPERTY  , new Street(Properties.STREET[0])),                // case 22
    new Cell(Constants.CELL_TYPE.PROPERTY  , new TrainStation(Properties.TRAIN_STATION[0])),   // case 23
    new Cell(Constants.CELL_TYPE.CHANCE    , null),                                            // case 24
    new Cell(Constants.CELL_TYPE.PROPERTY  , new Street(Properties.STREET[0])),                // case 25
    new Cell(Constants.CELL_TYPE.PROPERTY  , new TrainStation(Properties.TRAIN_STATION[0])),   // case 26
    new Cell(Constants.CELL_TYPE.COMMUNITY , null),                                            // case 27
    new Cell(Constants.CELL_TYPE.PROPERTY  , new Street(Properties.STREET[0])),                // case 28
    new Cell(Constants.CELL_TYPE.PROPERTY  , new TrainStation(Properties.TRAIN_STATION[0])),   // case 29
    new Cell(Constants.CELL_TYPE.PROPERTY  , new Street(Properties.STREET[0])),                // case 30
    new Cell(Constants.CELL_TYPE.PROPERTY  , new PublicCompany(Properties.PUBLIC_COMPANY[0])), // case 31
    new Cell(Constants.CELL_TYPE.PROPERTY  , new Street(Properties.STREET[0])),                // case 32
    new Cell(Constants.CELL_TYPE.PROPERTY  , new TrainStation(Properties.TRAIN_STATION[0])),   // case 33
    new Cell(Constants.CELL_TYPE.PROPERTY  , new Street(Properties.STREET[0])),                // case 34
    new Cell(Constants.CELL_TYPE.PROPERTY  , new TrainStation(Properties.TRAIN_STATION[0])),   // case 35
    new Cell(Constants.CELL_TYPE.PROPERTY  , new Street(Properties.STREET[0])),                // case 36
    new Cell(Constants.CELL_TYPE.PROPERTY  , new TrainStation(Properties.TRAIN_STATION[0])),   // case 37
    new Cell(Constants.CELL_TYPE.PROPERTY  , new Street(Properties.STREET[0])),                // case 38
    new Cell(Constants.CELL_TYPE.PROPERTY  , new TrainStation(Properties.TRAIN_STATION[0]))    // case 39 = dernière case, puis retour case 0
];
