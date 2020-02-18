var assert = require('chai').assert,
    expect = require('chai').expect;

const Card = require('../../game/card');

const {createGame} = require('./factories/game');
const {createPawns} = require('./factories/pawn');
const {createUser} = require('./factories/user');


describe('Card', function () {
    describe('constructor()', function () {
        it('doit assigner correctement description, effectType, effectArg1 et effectArg2', function() {
            let card = new Card('test', 'Test', 'gainMoney', 1, 3);

            assert.equal(card.token, 'test');
            assert.equal(card.description, 'Test');
            assert.equal(card.effectType, 'gainMoney');
            assert.equal(card.effectArg1, 1);
            assert.equal(card.effectArg2, 3);
        });

        it('doit retourner une erreur si le type d\'effet n\'est pas declare', function () {
            function unknownEffectCard () {
                new Card('test', 'Test', 'unknown', 1, 3);
            };
            assert.throws(unknownEffectCard, 'Effet de carte inconnu - unknown');
        });
    });

    describe('goPrison', function () {
        it('le joueur doit arriver en prison', function () {
            let game = createGame();
            let firstPlayer = game.players[0];
            let card = new Card('test', 'Test', 'jailTime');

            card.execute(game, firstPlayer);

            assert.isTrue(firstPlayer.isInPrison);
        });
    });

    describe('jailBreak', function () {
        it('le joueur doit echapper du prison', function () {
            let game = createGame();
            let firstPlayer = game.players[0];
            let card = new Card('test', 'Test', 'jailBreak');

            firstPlayer.goPrison();
            card.execute(game, firstPlayer);

            assert.isFalse(firstPlayer.isInPrison);
        });
    });

    describe('gainMoney', function () {
        it('l\'argent du joueur doit augmenter', function () {
            let game = createGame();
            let firstPlayer = game.players[0];
            let starting_amount = firstPlayer.money;
            let card = new Card('test', 'Test', 'gainMoney', 50);

            card.execute(game, firstPlayer);

            assert.equal(firstPlayer.money, starting_amount + 50);
        });
    });

    describe('loseMoney', function () {
        it('l\'argent du joueur doit baisser', function () {
            let game = createGame();
            let firstPlayer = game.players[0];
            let starting_amount = firstPlayer.money;
            let card = new Card('test', 'Test', 'loseMoney', 50);

            card.execute(game, firstPlayer);

            assert.equal(firstPlayer.money, starting_amount - 50);
        });

        it('l\'argent du joueur ne peut pas baisser moins de 0', function () {
            let game = createGame();
            let firstPlayer = game.players[0];
            let card = new Card('test', 'Test', 'loseMoney', firstPlayer.money * 2);

            card.execute(game, firstPlayer);

            assert.equal(firstPlayer.money, 0);
        });
    });
});
