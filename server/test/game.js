var assert = require('chai').assert;

const {createGame} = require('./factories/game');
const {createPlayer} = require('./factories/player');

const Constants = require('./../lib/constants');
const Player = require('../game/player');
const Property = require('./../game/property');
const User = require('../game/user');


describe('Game', function () {
    describe('toJSON()', function () {
        let userSchemas = [{
            nickname: 'Matthias',
            email: 'matthiass@gmail.com',
            friends: ['François', 'Boris', 'Florian', 'Danyl'],
            inscriptionDatetime: 152888912,
            level: 1,
            exp: 0
        }, {
            nickname: 'Dorin',
            email: 'dorin@gmail.com',
            friends: ['François', 'Boris', 'Florian', 'Danyl'],
            inscriptionDatetime: 152888324,
            level: 1,
            exp: 0
        }, {
            nickname: 'Antoine',
            email: 'antoine@gmail.com',
            friends: ['François', 'Boris', 'Florian', 'Danyl'],
            inscriptionDatetime: 152888684,
            level: 1,
            exp: 0
        }]
        let game = createGame(3, userSchemas);
        let res = game.currentGameState();
        assert.equal(res.players.length, 3);
    });
});
