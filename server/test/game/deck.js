var assert = require('chai').assert;

const Deck = require('./../../game/deck');

const {createGame} = require('./factories/game');
const chanceCardsMeta = require('./../../lib/chanceCards');
const communityChestCardsMeta = require('./../../lib/communityChestCards');


describe('Deck', function() {
  describe('constructor()', function() {
    it('le paquet doit creer les objets de type Card', function() {
        let cardsMeta = [{
            token: 'test_1',
            description: 'First test card',
            effectType: 'gainMoney',
            effectArg1: 15
        }, {
            token: 'test_2',
            description: 'Second test card',
            effectType: 'loseMoney',
            effectArg1: 20
        }];

        let deck = new Deck(cardsMeta);
        assert.equal(deck.activeCards.length, 2);
    });
  });

  describe('drawCard()', function() {
      it('le paquet doit retirer une carte', function () {
          let game = createGame();
          let firstPlayer = game.players[0];

          let cardsMeta = [{
              token: 'test_1',
              description: 'First test card',
              effectType: 'gainMoney',
              effectArg1: 15
          }, {
              token: 'test_2',
              description: 'Second test card',
              effectType: 'gainMoney',
              effectArg1: 20
          }];

          let deck = new Deck(cardsMeta);
          deck.drawCard(game, firstPlayer);
          assert.equal(deck.activeCards.length, 1);
      });

      it('le paquet doit executer la carte au retrait', function() {
          let game = createGame();
          let firstPlayer = game.players[0];
          let currentMoney = firstPlayer.money;

          let cardsMeta = [{
              token: 'test_1',
              description: 'First test card',
              effectType: 'gainMoney',
              effectArg1: 15
          }, {
              token: 'test_2',
              description: 'Second test card',
              effectType: 'gainMoney',
              effectArg1: 15
          }];

          let deck = new Deck(cardsMeta);
          deck.drawCard(game, firstPlayer);
          assert.equal(firstPlayer.money, currentMoney + 15);
      });
  });
  /*
  describe('execute()', function() {
    it('should raise an exception in case effectType is unknown', function() {
        let card = new Card('Test', 'testEffect', 1, 3);

    });
  });
  */
});
