var assert = require('chai').assert;

const {createPlayer} = require('./factories/player');

const Constants = require('./../../lib/constants');
const Map = require('./../../game/map');


let getCellsMeta = function () {
    return [{
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
        token: 'electricCompany',
        name: 'Electric Company',
        description: 'What a magnificent electric company!',
        type: Constants.CELL_TYPES.PROPERTY
    }, {
        id: 7,
        token: 'chance',
        name: 'Chance',
        description: 'Follow instructions on top card',
        type: Constants.CELL_TYPES.CHANCE
    }];
}

let getPropertiesMeta = function () {
    return [{
        token: 'gareStrasbourg',
        name: 'Gare de Strasbourg',
        description: 'Quelle magnifique gare!',
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
    }];
}


describe('Map', function() {
    describe('constructor()', function () {
        it('doit assigner correctement les cellules', function () {
            let map = new Map(getCellsMeta(), getPropertiesMeta());

            assert.equal(map.cells.length, 8);
            assert.equal(map.cells[0].id, 0);
            assert.equal(map.cells[0].token, 'go');
            assert.equal(map.cells[0].name, 'GO');
            assert.equal(map.cells[0].description, 'Collect $200.00 salary as you pass');
            assert.equal(map.cells[0].type, Constants.CELL_TYPES.START);
            assert.equal(map.cells[1].type, Constants.CELL_TYPES.PROPERTY);
        });

        it('doit determiner correctement le nombre de companies publiques', function () {
            let map = new Map(getCellsMeta(), getPropertiesMeta());
            assert.equal(map.publicCompaniesCount, 1);
        });
    });

    describe('getCellByToken()', function()  {
        it('doit retourner la cellule apres le token passe', function () {
            let map = new Map(getCellsMeta(), getPropertiesMeta());
            let cell = map.getCellByToken('mediterranianAve');

            assert.equal(cell.token, 'mediterranianAve');
            assert.equal(cell.type, Constants.CELL_TYPES.PROPERTY);
        });

        it('doit retourner null pour un token qui n\'existe pas', function () {
            let map = new Map(getCellsMeta(), getPropertiesMeta());
            let cell = map.getCellByToken('test');

            assert.equal(cell, null);
        });
    });

    describe('getCellById()', function () {
        it('doit retourner la cellule apres le nombre d\'ordre passe', function () {
            let map = new Map(getCellsMeta(), getPropertiesMeta());
            let cell = map.getCellById(2);

            assert.equal(cell.id, 2);
            assert.equal(cell.token, 'communityChest');
            assert.equal(cell.type, Constants.CELL_TYPES.COMMUNITY_CHEST);
        });

        it('doit retourner null pour un nombre d\'ordre qui n\'existe pas', function () {
            let map = new Map(getCellsMeta(), getPropertiesMeta());
            let cell = map.getCellById(10);

            assert.equal(cell, null);
        });
    });

    describe('movePlayerRelative()', function () {
        it('doit avancer le joueur par quelques cellules', function () {
            let map = new Map(getCellsMeta(), getPropertiesMeta());
            let cell = map.getCellById(0);
            let expectedCell = map.getCellById(5);

            let player = createPlayer();
            player.currentCell = cell;

            map.movePlayerRelative(player, 5);

            assert.equal(player.currentCell, expectedCell);
        });

        it('doit devancer le joueur par quelques cellules', function () {
            let map = new Map(getCellsMeta(), getPropertiesMeta());
            let cell = map.getCellById(5);
            let expectedCell = map.getCellById(2);

            let player = createPlayer();
            player.currentCell = cell;

            map.movePlayerRelative(player, -3);

            assert.equal(player.currentCell, expectedCell);
        });

        it('doit directioner le joueur vers le debut s\'il a parcouru toutes les cellules', function () {
            let map = new Map(getCellsMeta(), getPropertiesMeta());
            let cell = map.getCellById(5);
            let expectedCell = map.getCellById(3);

            let player = createPlayer();
            player.currentCell = cell;

            map.movePlayerRelative(player, 6);

            assert.equal(player.currentCell, expectedCell);
        });
    });

    describe('movePlayerAbsolute()', function () {
        it('doit deplacer le joueur a une cellule', function () {
            let map = new Map(getCellsMeta(), getPropertiesMeta());
            let cell = map.getCellByToken('electricCompany');
            let player = createPlayer();

            map.movePlayerAbsolute(player, 'electricCompany');

            assert.equal(player.currentCell, cell);
        });
    });
});
