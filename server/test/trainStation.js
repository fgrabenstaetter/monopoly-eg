const TrainStation = require('../game/trainStation');
const Constants = require('../lib/constants');
const Properties = require('../lib/properties');
const User = require('../game/user');
const Player = require('../game/player');
const assert = require('assert');

describe("TrainStation", function() {
    const userSchema = {
        nickname: 'Matthias',
        email: 'matthiass@gmail.com',
        friends: ['François', 'Boris', 'Florian', 'Danyl'],
        inscriptionDatetime: 152888912,
        level: 1,
        exp: 0
    };
    const user = new User(userSchema);

    it("Le nom de la gare est Gare de Strasbourg", function() {
        const tStation = new TrainStation(Properties.TRAIN_STATION[0]);
        assert.equal("Homme de Fer", tStation.name);
    });

    it("Le prix du terrain est de 200", function() {
        const tStation = new TrainStation(Properties.TRAIN_STATION[0]);
        assert.equal(200, tStation.price);
    });

    it("Le joueur qui possède cette gare n'en possède aucune autre donc le prix de loyer est de 25", function() {
        const tStation = new TrainStation(Properties.TRAIN_STATION[0]);
        const player = new Player(user, 0);
        player.addProperty(tStation);
        assert.equal(25, tStation.rentalPrice);
    });

    it("Maintenant il possède une 2e gare donc le prix du loyer passer à 50 pour les 2 gares", function() {
        const tStation = new TrainStation(Properties.TRAIN_STATION[0]);
        const tStation2 = new TrainStation(Properties.TRAIN_STATION[1]);
        const player = new Player(user, 0);
        player.addProperty(tStation);
        player.addProperty(tStation2);
        assert.equal(50, tStation.rentalPrice);
        assert.equal(50, tStation2.rentalPrice);
    });

    it("Le prix d'hypothèque pour une gare est de 100", function() {
        const tStation = new TrainStation(Properties.TRAIN_STATION[0]);
        const tStation2 = new TrainStation(Properties.TRAIN_STATION[1]);
        assert.equal(100, tStation.mortagePrice);
        assert.equal(100, tStation2.mortagePrice);
    });
});
