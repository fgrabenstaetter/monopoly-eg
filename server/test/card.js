var assert = require('chai').assert,
    expect = require('chai').expect;

const Card = require('../game/card');

const {createGame} = require('./factories/game');
const {createUser} = require('./factories/user');


describe('Card', function () {
    describe('constructor()', function () {
        it('doit assigner correctement description, effectType, effectArg1 et effectArg2', function() {
            let card = new Card('Test', 'gainMoney', 1, 3);

            assert.equal(card.description, 'Test');
            assert.equal(card.effectType, 'gainMoney');
            assert.equal(card.effectArg1, 1);
            assert.equal(card.effectArg2, 3);
        });
    });

    describe('jailEscapeCard', function () {
        it('le joueur doit avoir une carte prison de plus', function () {
            let game = createGame();
            let firstPlayer = game.players[0];
            let card = new Card('Test', 'jailEscapeCard');

            card.execute(game, firstPlayer);
            assert.strictEqual(firstPlayer.nbJailEscapeCards, 1);
        });
    });

    describe('gainMoney', function () {
        it('l\'argent du joueur doit augmenter', function () {
            let game = createGame();
            let firstPlayer = game.players[0];
            let starting_amount = firstPlayer.money;
            let card = new Card('Test', 'gainMoney', 50);

            card.execute(game, firstPlayer);
            assert.equal(firstPlayer.money, starting_amount + 50);
        });
    });

    describe('loseMoney', function () {
        it('l\'argent du joueur doit baisser', function () {
            let game = createGame();
            let firstPlayer = game.players[0];
            let starting_amount = firstPlayer.money;
            let card = new Card('Test', 'loseMoney', 50);

            card.execute(game, firstPlayer);
            assert.equal(firstPlayer.money, starting_amount - 50);
        });

        it('l\'argent du joueur ne peut pas baisser moins de 0', function () {
            let game = createGame();
            let firstPlayer = game.players[0];
            let card = new Card('Test', 'loseMoney', firstPlayer.money * 2);

            assert.equal(firstPlayer.money, firstPlayer.money);
        });
    });
});
