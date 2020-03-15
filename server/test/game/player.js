const assert = require('assert');

const Constants = require('./../../lib/constants');
const Player = require('../../game/player');
const Property = require('./../../game/property');
const User = require('../../game/user');


describe('Player', function() {
    const userSchema = {
        nickname: 'Matthias',
        email: 'matthiass@gmail.com',
        friends: ['François', 'Boris', 'Florian', 'Danyl'],
        inscriptionDatetime: 152888912,
        level: 1,
        exp: 0
    };
    const propertyMeta = {
        token: 'gareStrasbourg',
        name: 'Gare de Strasbourg',
        description: 'Quelle magnifique gare!',
        buyingPrice: 200,
        rentalPrice: 25,
        type: Constants.PROPERTY_TYPES.TRAIN_STATION
    };
    const property = new Property(propertyMeta);

    describe('constructor()', function () {
        let user = new User(userSchema);
        let player = new Player(user, 0);
        it('dois creer correctement l\'utilisateur', function () {
            assert.equal(player.user, user);
            assert.equal(player.pawn, 0);
        });

        it('dois attribuer une liste vide pour les proprietes', function() {
            assert.equal(player.properties.length, 0);
        });

        it('dois initialiser la cellule courante come null', function () {
            assert.equal(player.currentCell, null);
        });

        it('le joueur ne dois pas etre en prison', function() {
            assert.equal(player.isInPrison, false);
        });
    });

    describe('goPrison()', function () {
        let user = new User(userSchema);
        let player = new Player(user, 0);

        it('Le joueur doit arriver en prison', function() {
            player.goPrison();
            assert.equal(true, player.isInPrison);
        });
    });

    describe('addProperty()', function () {
        let user = new User(userSchema);
        let player = new Player(user, 0);

        it('doit ajouter une propriete au joueur', function () {
            player.addProperty(property);
            assert.equal(player.properties.length, 1);
            assert.equal(player.properties[0].name, 'Gare de Strasbourg');
        });
    });

    describe('delProperty()', function () {
        let user = new User(userSchema);
        let player = new Player(user, 0);

        it('doit supprimer une propriete du joueur', function () {
            player.addProperty(property);
            player.delProperty(property);
            assert.equal(0, player.properties.length);
        });
    });

    describe('getPropertiesByType()', function () {
        it('doit retourner les stations de train', function () {
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
            let res = player.getPropertiesByType(Constants.PROPERTY_TYPES.TRAIN_STATION);
            assert.equal(res.length, 2);
            assert.equal(res[0], properties[0]);
        });
    })
});
