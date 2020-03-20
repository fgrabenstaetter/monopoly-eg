const TrainStation = require('../../game/trainStation');
const Constants = require('../../lib/constants');
const Properties = require('../../lib/properties');
const User = require('../../game/user');
const Player = require('../../game/player');
const assert = require('assert');

describe("Test sur la classe TrainStation", function() {
    const userSchema = {
        nickname: 'Matthias',
        email: 'matthiass@gmail.com',
        friends: ['François', 'Boris', 'Florian', 'Danyl'],
        inscriptionDatetime: 152888912,
        level: 1,
        exp: 0
    };
    const user = new User(userSchema);
    const player = new Player(user, 0);
    const tStation = new TrainStation(Properties.TRAIN_STATION[0]);
    tStation.owner = player;
    tStation.owner
    const tS2 = new TrainStation(Properties.TRAIN_STATION[1]);
    tS2.owner = player;

    it("Le nom de la gare est Gare de Strasbourg", function() {
        assert.equal("Gare de Strasbourg", tStation.name);
    });

    it("Le prix du terrain est de 200", function() {
        assert.equal(200, tStation.price);
    });

    it("Le joueur qui possède cette gare n'en possède aucune autre donc le prix de loyer est de 25", function() {
        player.properties.push(tStation);
        assert.equal(25, tStation.rentalPrice);
    });

    it("Maintenant il possède une 2e gare donc le prix du loyer passer à 50 pour les 2 gares", function() {

        player.properties.push(tS2);
        assert.equal(50, tStation.rentalPrice);
        assert.equal(50, tS2.rentalPrice);
    });

    it("Le prix d'hypothèque pour une gare est de 100", function() {
        assert.equal(100, tStation.mortagePrice);
        assert.equal(100, tS2.mortagePrice);
    });
});
