/*var assert = require('chai').assert;

const Bid = require('../game/bid');

const {createGame} = require('./factories/game');
const {createPlayer} = require('./factories/player');

describe('Bid', function () {
    describe('constructor()', function () {
        it('doit assigner player, property, amountAsked', function () {
            let player = createPlayer();

            let bid = new Bid(player, 'someProperty', 250);
            assert.equal(bid.player, player);
            assert.equal(bid.property, 'someProperty');
            assert.equal(bid.amountAsked, 250);
        });
    });

    describe('placeOffer', function () {
        it('doit ajouter une nouvelle offre  a l\'enchere', function () {
            let game = createGame();
            let firstPlayer = game.players[0];
            let secondPlayer = game.players[1];

            let bid = new Bid(firstPlayer, 'someProperty', 250);
            bid.placeOffer(secondPlayer, 200);

            assert.equal(bid.offers.length, 1);
            assert.equal(bid.offers[0].amount, 200);
        });

        it('doit actualiser une offre existante', function () {
            let game = createGame();
            let firstPlayer = game.players[0];
            let secondPlayer = game.players[1];

            let bid = new Bid(firstPlayer, 'someProperty', 250);
            bid.placeOffer(secondPlayer, 200);
            bid.placeOffer(secondPlayer, 205);

            assert.equal(bid.offers.length, 1);
            assert.equal(bid.offers[0].amount, 205);
        });
    });

    describe('getOffer', function () {
        it('doit retourner l\'offre d\'un joueur', function () {
            let game = createGame();

            let bid = new Bid(game.players[0], 'someProperty', 250);
            bid.placeOffer(game.players[1], 200);
            bid.placeOffer(game.players[2], 205);

            let offer =  bid.getOffer(game.players[1]);

            assert.equal(offer.amount, 200);
            assert.equal(offer.player, game.players[1]);
        });
    });

    describe('updateAmountAsked', function () {
        it('doit actualiser amountAsked', function () {
            let player = createPlayer();
            let bid = new Bid(player, 'someProperty', 250);

            bid.updateAmountAsked(500);

            assert.equal(bid.amountAsked, 500);
        });
    });
});*/
