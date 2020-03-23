const Street = require('../game/street');
const User = require('../game/user');
const Player = require('../game/player');
const Constants = require('../lib/constants');
const Properties = require('../lib/properties');
const assert = require('assert');

describe("Street", function() {
    let user = new User({
        id                  : 1942924,
        nickname            : 'francois',
        email               : 'francis@gmail.com',
        level               : 2,
        exp                 : 0,
        inscriptionDatetime : 834492323
    });

    it("Ceci est la Rue Faubourg de Saverne", function() {
        const street = new Street(Properties.STREET[2]);
        assert.equal("Faubourg de Saverne", street.name);
    });

    it("Cette Rue fait partie des cases rouges", function() {
        const street = new Street(Properties.STREET[0]);
        assert.equal(Constants.STREET_COLOR.BROWN, street.color);
    });

    it("Le prix du terrain doit être égal à 100", function() {
        const street = new Street(Properties.STREET[3]);
        assert.equal(100, street.emptyPrice);
    });

    it("Le prix d'une maison est de 50", function() {
        const street = new Street(Properties.STREET[4]);
        assert.equal(50, street.housePrice);
    });

    it("Le prix d'un hôtel est de 250", function() {
        const street = new Street(Properties.STREET[0]);
        assert.equal(250, street.hostelPrice);
    });

    it("Le prix d'un loyer sans maison(s) ni hôtel est de 8", function() {
        const street = new Street(Properties.STREET[4]);
        const player = new Player(user, 0);
        player.addProperty(street);
        assert.equal(8, street.rentalPrice);
    });

    it("Le prix d'hypothèque de la rue sans maison(s) ni hôtel est de 70", function() {
        const street = new Street(Properties.STREET[5]);
        assert.equal(70, street.mortagePrice);
    });

    it("Le prix d'un loyer doit varier selon le nombre de maison avec 50, 150, 450 et 625 respectivement pour 1, 2, 3 et 4 maisons", function() {
        const street = new Street(Properties.STREET[5]);
        const player = new Player(user, 0);
        player.addProperty(street);
        street.housesNb = 1;
        assert.equal(50, street.rentalPrice);
        street.housesNb = 2;
        assert.equal(150, street.rentalPrice);
        street.housesNb = 3;
        assert.equal(450, street.rentalPrice);
        street.housesNb = 4;
        assert.equal(625, street.rentalPrice);
    });

    it("Il y a un hôtel, maintenant le prix d'un loyer doit être de 750", function() {
        const street = new Street(Properties.STREET[6]);
        const player = new Player(user, 0);
        player.addProperty(street);
        street.hostel = true;
        assert.equal(750, street.rentalPrice);
    });
});
