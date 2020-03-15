const chai = require('chai');
const spies = require('chai-spies');
const assert = chai.assert;
const expect = chai.expect;
chai.use(spies);

const {createGame} = require('./factories/game');
const {createUser} = require('./factories/user');

const Constants = require('./../../lib/constants');
const Deck = require('./../../game/deck');
const Cell = require('./../../game/Cell');


describe('Cell', function() {
    describe('constructor()', function () {
        it('doit assigner correctement id, token, name, description, type', function() {
            let cell = new Cell(
                id=1,
                token='test',
                name='Test Cell',
                description='Teest',
                type=Constants.CELL_TYPES.START
            );

            assert.equal(cell.id, 1);
            assert.equal(cell.token, 'test');
            assert.equal(cell.name, 'Test Cell');
            assert.equal(cell.description, 'Teest');
            assert.equal(cell.type, Constants.CELL_TYPES.START);
        });

        it('doit creer une erreur si le type est inconnu', function () {
            function unknownCellType () {
                new Cell(1, 'test', 'Test Cell', 'Teest', 'unknown');
            };
            assert.throws(unknownCellType, 'Type de cellule inconnu - unknown');
        });
    });

    describe('startEffect()', function () {
        it('doit augmenter l\'argent du joueur par 200', function () {
            let game = createGame();
            let cell = game.map.getCellById(0);
            let player = game.players[0];
            let currentMoney = player.money;

            cell.execute(game, player);

            assert.equal(player.money, currentMoney + 200);
        });
    });

    describe('communnityChestEffect()', function () {
        it('doit executer communnityChestDeck.drawCard()', function () {
            let game = createGame();
            let player = game.players[0];
            let communityChestCell = game.map.getCellByToken('communityChest');

            const spy = chai.spy.on(game.communityChestDeck, 'drawCard');

            communityChestCell.execute(game, player);
            expect(spy).to.have.been.called();
        });
    });

    describe('chanceEffect()', function () {
        it('doit executer chanceDeck.drawCard()', function () {
            let game = createGame();
            let player = game.players[0];
            let chanceCell = game.map.getCellByToken('chance');

            const spy = chai.spy.on(game.chanceDeck, 'drawCard');

            chanceCell.execute(game, player);
            expect(spy).to.have.been.called();
        });
    });

    describe('propertyEffect', function ()  {
        it('doit executer cell.property.execute()', function () {

        });
    });
});
