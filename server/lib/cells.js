const Constants     = require('../lib/constants');
const Properties    = require('../lib/properties');
const Cell          = require('../game/cell');
const Street        = require('../game/street');
const PublicCompany = require('../game/publicCompany');
const TrainStation  = require('../game/trainStation');
const Tax           = require('../game/tax');

class Cells {

    static get new () {
        return [                                                                                                       // Il doit toujours y avoir 40 cellules
            // Marron
            new Cell(Constants.CELL_TYPE.OTHER     ,  null),                                                           // case 0 = Départ
            new Cell(Constants.CELL_TYPE.PROPERTY  ,  new Street(Properties.STREET[0])),                               // case 1
            new Cell(Constants.CELL_TYPE.COMMUNITY ,  null),                                                           // case 2
            new Cell(Constants.CELL_TYPE.PROPERTY  ,  new Street(Properties.STREET[1])),                               // case 3
            new Cell(Constants.CELL_TYPE.TAX       ,  new Tax('Payez 100€ d\'impôts au pays', 100)),                   // case 4 = impot sur le revenu
            new Cell(Constants.CELL_TYPE.PROPERTY  ,  new TrainStation(Properties.TRAIN_STATION[0])),                  // case 5
            // Bleu ciel
            new Cell(Constants.CELL_TYPE.PROPERTY  ,  new Street(Properties.STREET[2])),                               // case 6
            new Cell(Constants.CELL_TYPE.CHANCE    ,  null),                                                           // case 7
            new Cell(Constants.CELL_TYPE.PROPERTY  ,  new Street(Properties.STREET[3])),                               // case 8
            new Cell(Constants.CELL_TYPE.PROPERTY  ,  new Street(Properties.STREET[4])),                               // case 9
            new Cell(Constants.CELL_TYPE.OTHER     ,  null),                                                          // case 10 = prison
            // Violet
            new Cell(Constants.CELL_TYPE.PROPERTY  ,  new Street(Properties.STREET[5])),                               // case 11
            new Cell(Constants.CELL_TYPE.PROPERTY  ,  new PublicCompany(Properties.PUBLIC_COMPANY[0])),                // case 12
            new Cell(Constants.CELL_TYPE.PROPERTY  ,  new Street(Properties.STREET[6])),                               // case 13
            new Cell(Constants.CELL_TYPE.PROPERTY  ,  new Street(Properties.STREET[7])),                               // case 14
            new Cell(Constants.CELL_TYPE.PROPERTY  ,  new TrainStation(Properties.TRAIN_STATION[1])),                  // case 15
            // Orange
            new Cell(Constants.CELL_TYPE.PROPERTY  ,  new Street(Properties.STREET[8])),                               // case 16
            new Cell(Constants.CELL_TYPE.COMMUNITY ,  null),                                                           // case 17
            new Cell(Constants.CELL_TYPE.PROPERTY  ,  new Street(Properties.STREET[9])),                               // case 18
            new Cell(Constants.CELL_TYPE.PROPERTY  ,  new Street(Properties.STREET[10])),                              // case 19
            new Cell(Constants.CELL_TYPE.OTHER     ,  null),                                                           // case 20 = parc gratuit
            // Rouge
            new Cell(Constants.CELL_TYPE.PROPERTY  ,  new Street(Properties.STREET[11])),                              // case 21
            new Cell(Constants.CELL_TYPE.CHANCE    ,  null),                                                           // case 22
            new Cell(Constants.CELL_TYPE.PROPERTY  ,  new Street(Properties.STREET[12])),                              // case 23
            new Cell(Constants.CELL_TYPE.PROPERTY  ,  new Street(Properties.STREET[13])),                              // case 24
            new Cell(Constants.CELL_TYPE.PROPERTY  ,  new TrainStation(Properties.TRAIN_STATION[2])),                  // case 25
            // Jaune
            new Cell(Constants.CELL_TYPE.PROPERTY  ,  new Street(Properties.STREET[14])),                              // case 26
            new Cell(Constants.CELL_TYPE.PROPERTY  ,  new Street(Properties.STREET[15])),                              // case 27
            new Cell(Constants.CELL_TYPE.PROPERTY  ,  new PublicCompany(Properties.PUBLIC_COMPANY[1])),                // case 28
            new Cell(Constants.CELL_TYPE.PROPERTY  ,  new Street(Properties.STREET[16])),                              // case 29
            new Cell(Constants.CELL_TYPE.GOPRISON  ,  null),                                                           // case 30 = Parlement
            // Vert
            new Cell(Constants.CELL_TYPE.PROPERTY  ,  new Street(Properties.STREET[17])),                              // case 31
            new Cell(Constants.CELL_TYPE.PROPERTY  ,  new Street(Properties.STREET[18])),                              // case 32
            new Cell(Constants.CELL_TYPE.COMMUNITY ,  null),                                                           // case 33
            new Cell(Constants.CELL_TYPE.PROPERTY  ,  new Street(Properties.STREET[19])),                              // case 34
            new Cell(Constants.CELL_TYPE.PROPERTY  ,  new TrainStation(Properties.TRAIN_STATION[3])),                  // case 35
            new Cell(Constants.CELL_TYPE.CHANCE    ,  null),                                                           // case 36
            // Bleu foncé
            new Cell(Constants.CELL_TYPE.PROPERTY  ,  new Street(Properties.STREET[20])),                              // case 37
            new Cell(Constants.CELL_TYPE.TAX       ,  new Tax('Remboursez vos dettes à la banques. Payez 200€', 200)), // case 38 = Taxe de luxe
            new Cell(Constants.CELL_TYPE.PROPERTY  ,  new Street(Properties.STREET[21]))                               // case 39 = dernière case, puis retour case 0
        ];
    }
}

module.exports = Cells;
