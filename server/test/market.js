var assert = require('chai').assert;

const Market = require('../game/market');

const {createGame} = require('./factories/game');


describe('Market', function () {
    describe('constructor()', function () {
        it('doit creer la liste vide des Bids', function () {
            let market = new Market();
            assert.empty(market.bids);
        });
    });

    describe('addBid()', function () {
        it('doit ajouter un nouveau Bid', function () {
            let game = createGame();
            let market = new Market();

            market.addBid(game.players[0], 'test_property', 200);

            assert.equal(market.bids.length, 1);
            assert.equal(market.bids[0].property, 'test_property');
            assert.equal(market.bids[0].amountAsked, 200);
        });

        it('doit actualiser un Bid actuel', function () {
            let game = createGame();
            let market = new Market();

            market.addBid(game.players[0], 'test_property', 200);
            market.addBid(game.players[0], 'test_property', 300);

            assert.equal(market.bids.length, 1);
            assert.equal(market.bids[0].property, 'test_property');
            assert.equal(market.bids[0].amountAsked, 300);
        });
    });

    describe('getBid()', function () {
        it('doit retourner un Bid',  function () {
            let game = createGame();
            let market = new Market();

            market.addBid(game.players[0], 'test_property', 200);
            market.addBid(game.players[1], 'test_property_2', 300);
            market.addBid(game.players[2], 'test_property_3', 700);

            let bid = market.getBid(game.players[1], 'test_property_2');

            assert.equal(bid.amountAsked, 300);
        });
    });

    describe('placeOffer()', function () {
        it('doit a jouter une offre par un autre joueur au Bid', function () {
            let game = createGame();
            let market = new Market();

            market.addBid(game.players[0], 'test_property', 200);
            market.addBid(game.players[1], 'test_property_2', 300);
            market.addBid(game.players[2], 'test_property_3', 700);
            market.placeOffer(game.players[0], 'test_property', game.players[1], 150);

            let bid = market.getBid(game.players[0], 'test_property');

            assert.equal(bid.offers.length, 1);
            assert.equal(bid.offers[0].player, game.players[1]);
            assert.equal(bid.offers[0].amount, 150);
        });
    });
});
