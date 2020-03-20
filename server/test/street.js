const Street = require('../game/street');
const User = require('../game/user');
const Player = require('../game/player');
const Constants = require('../lib/constants');
const Properties = require('../lib/properties');
const assert = require('assert');

describe("Test sur la classe Street", function() {
    let user = new User({
        id                  : 1942924,
        nickname            : 'francois',
        email               : 'francis@gmail.com',
        level               : 2,
        exp                 : 0,
        inscriptionDatetime : 834492323
    });
    let player = new Player(user, 0);

    it("Ceci est la Rue de Londres", function() {
        const street = new Street(Properties.STREET[0]);
        assert.equal("Rue de Londres", street.name);
    });

    it("Cette Rue fait partie des cases rouges", function() {
        const street = new Street(Properties.STREET[0]);
        assert.equal(Constants.STREET_COLOR.RED, street.color);
    });

    it("Le prix du terrain doit être égal à 160", function() {
        const street = new Street(Properties.STREET[0]);
        assert.equal(160, street.emptyPrice);
    });

    it("Le prix d'une maison est de 400", function() {
        const street = new Street(Properties.STREET[0]);
        assert.equal(400, street.housePrice);
    });

    it("Le prix d'un hôtel est de 2000", function() {
        const street = new Street(Properties.STREET[0]);
        assert.equal(2000, street.hostelPrice);
    });

    it("Le prix d'un loyer sans maison(s) ni hôtel est de 12", function() {
        const street = new Street(Properties.STREET[0]);
        street.owner = player;
        assert.equal(12, street.rentalPrice);
    });

    it("Le prix d'hypothèque de la rue sans maison(s) ni hôtel est de 80", function() {
        const street = new Street(Properties.STREET[0]);
        assert.equal(80, street.mortagePrice);
    });

    it("Le prix d'un loyer doit varier selon le nombre de maison avec 200, 300 et 400 respectivement pour 1, 2 et 3 maisons", function() {
        const street = new Street(Properties.STREET[0]);
        street.owner = player;
        street.housesNb = 1;
        assert.equal(200, street.rentalPrice);
        street.housesNb = 2;
        assert.equal(300, street.rentalPrice);
        street.housesNb = 3;
        assert.equal(400, street.rentalPrice);
    });

    it("Il y a un hôtel, maintenant le prix d'un loyer doit être de 800", function() {
        const street = new Street(Properties.STREET[0]);
        street.owner = player;
        street.hostel = true;
        assert.equal(800, street.rentalPrice);
    });
});
