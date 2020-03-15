var assert = require('chai').assert;

const {createGame} = require('./factories/game');
const {createPlayer} = require('./factories/player');

const Constants = require('./../../lib/constants');
const Map = require('./../../game/Map');
const Player = require('../../game/player');
const Property = require('./../../game/property');
const User = require('../../game/user');


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
    }, {
        id: 8,
        token: 'waterWorks',
        name: 'Water Works',
        description: 'What a magnificent water company!',
        type: Constants.CELL_TYPES.PROPERTY
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
    }, {
        token: 'waterWorks',
        name: 'Water Works',
        description: 'What a magnificent water company!',
        buyingPrice: 150,
        rentalPrice: null,
        type: Constants.PROPERTY_TYPES.PUBLIC_COMPANY
    }, {
        token: 'mediterranianAve', // https://monopoly.fandom.com/wiki/Mediterranean_Avenue
        name: 'Mediterranean Avenue',
        description: 'Quelle magnifique rue!',
        buyingPrice: 60,
        rentalPrice: {
            simple: 2,
            monopoly: 4,
            1: 10,
            2: 30,
            3: 90,
            4: 160,
            hotel: 250 // price with a hotel
        },
        type: Constants.PROPERTY_TYPES.STREET,
        color: Constants.STREET_COLORS.RED
    }, {
        token: 'balticAve', // https://monopoly.fandom.com/wiki/Mediterranean_Avenue
        name: 'Baltic Avenue',
        description: 'Quelle magnifique rue!',
        buyingPrice: 60,
        rentalPrice: {
            simple: 4,
            monopoly: 8,
            1: 20,
            2: 60,
            3: 180,
            4: 320,
            hotel: 450
        },
        type: Constants.PROPERTY_TYPES.STREET,
        color: Constants.STREET_COLORS.RED
    }];
}


describe('Property', function() {
    describe('constructor()', function () {
        it('doit creer correctement la propriete', function () {
            let meta = {
                token: 'gareStrasbourg',
                name: 'Gare de Strasbourg',
                description: 'Quelle magnifique gare!',
                buyingPrice: 200,
                rentalPrice: 25,
                type: Constants.PROPERTY_TYPES.TRAIN_STATION
            }
            let property = new Property(meta);
            assert.equal(property.token, 'gareStrasbourg');
            assert.equal(property.buyingPrice, 200);
        });
    });

    describe('trainStationRent()', function () {
        it('doit calculer correctement le prix pour les stations', function () {
            let userSchema = {
                nickname: 'Matthias',
                email: 'matthiass@gmail.com',
                friends: ['François', 'Boris', 'Florian', 'Danyl'],
                inscriptionDatetime: 152888912,
                level: 1,
                exp: 0
            };
            let user = new User(userSchema);
            let player = new Player(user, 0);

            let properties = [
                new Property({
                    token: 'gareStrasbourg',
                    name: 'Gare de Strasbourg',
                    description: 'Quelle magnifique gare!',
                    buyingPrice: 200,
                    rentalPrice: 25,
                    type: Constants.PROPERTY_TYPES.TRAIN_STATION
                }),
                new Property({
                    token: 'testingBuilding',
                    name: 'Testing building',
                    description: 'Quelle magnifique test!',
                    buyingPrice: 200,
                    rentalPrice: 25,
                    type: Constants.PROPERTY_TYPES.STREET
                }),
                new Property({
                    token: 'secondTrainStation',
                    name: 'Second Train Station',
                    description: 'Quelle magnifique station!',
                    buyingPrice: 200,
                    rentalPrice: 25,
                    type: Constants.PROPERTY_TYPES.TRAIN_STATION
                })
            ];
            player.addProperty(properties[0]);
            player.addProperty(properties[1]);
            player.addProperty(properties[2]);

            let rent = player.properties[0].trainStationRent();
            assert.equal(rent, 50);
        });
    });

    describe('publicCompanyRent()', function () {
        it('doit calculer correctement le prix pour une entreprise', function () {
            let game = createGame();
            let player = game.players[0];

            let map = new Map(getCellsMeta(), getPropertiesMeta());
            game.map = map;
            let company = game.map.getCellByToken('electricCompany').property;

            player.addProperty(company);
            let rent = company.publicCompanyRent(game);

            // 4 must be a divider of rent
            assert.equal(rent % 4, 0);
        });

        it('doit calculer correctement le prix pour toutes les entreprise', function () {
            let game = createGame();
            let player = game.players[0];

            let map = new Map(getCellsMeta(), getPropertiesMeta());
            game.map = map;
            let company1 = game.map.getCellByToken('electricCompany').property;
            let company2 = game.map.getCellByToken('waterWorks').property;
            player.addProperty(company1);
            player.addProperty(company2);
            let rent = company1.publicCompanyRent(game);

            // 10 must be a divider of rent
            assert.equal(rent % 10, 0);
        });
    });

    describe('streetRent()', function () {
        it('doit calculer correctement le prix simple pour une rue', function () {
            let game = createGame();
            let player = game.players[0];

            let map = new Map(getCellsMeta(), getPropertiesMeta());
            game.map = map;

            let street = game.map.getCellByToken('balticAve').property;
            player.addProperty(street);
            let res = street.streetRent(game);
            assert.equal(res, 4);
        });

        it('doit calculer correctement le prix monopole pour une rue', function () {
            let game = createGame();
            let player = game.players[0];

            let map = new Map(getCellsMeta(), getPropertiesMeta());
            game.map = map;

            let street1 = game.map.getCellByToken('balticAve').property;
            let street2 = game.map.getCellByToken('mediterranianAve').property;
            player.addProperty(street1);
            player.addProperty(street2);

            let res = street1.streetRent(game);
            assert.equal(res, 8);
        });

        it('doit calculer correctement le prix avec hotel', function () {
            let game = createGame();
            let player = game.players[0];

            let map = new Map(getCellsMeta(), getPropertiesMeta());
            game.map = map;
            let street = game.map.getCellByToken('balticAve').property;
            street.hasHotel = true;
            player.addProperty(street);
            let res = street.streetRent(game);
            assert.equal(res, 450);
        });

        it('doit calculer correctement le prix avec 3 maisons', function () {
            let game = createGame();
            let player = game.players[0];

            let map = new Map(getCellsMeta(), getPropertiesMeta());
            game.map = map;
            let street = game.map.getCellByToken('balticAve').property;
            street.housesCount = 3;
            player.addProperty(street);
            let res = street.streetRent(game);
            assert.equal(res, 180);
        });
    });
});
