const Street = require('../../game/street');
const Constants = require('../../lib/constants');
const Properties = require('../../lib/properties');
const assert = require('assert');

describe("Test sur la classe Street", function() {
    const street = new Street(Properties.STREET[0]);

    it("Ceci est la Rue de Londres", function() {
        assert.equal("Rue de Londres", street.name);
    });

    it("Cette Rue fait partie des cases rouges", function() {
        assert.equal(Constants.PROPERTY_COLOR.RED, street.color);
    });

    it("Le prix du terrain doit être égal à 160", function() {
        assert.equal(160, street.emptyPrice);
    });

    it("Le prix d'une maison est de 400", function() {
        assert.equal(400, street.housePrice);
    });

    it("Le prix d'un hôtel est de 2000", function() {
        assert.equal(2000, street.hostelPrice);
    });

    it("Le prix d'un loyer sans maison(s) ni hôtel est de 12", function() {
        assert.equal(12, street.rentalPrice);
    });

    it("Le prix d'hypothèque de la rue sans maison(s) ni hôtel est de 80", function() {
        assert.equal(80, street.mortagePrice);
    });

    it("Le prix d'un loyer doit varier selon le nombre de maison avec 200, 300 et 400 respectivement pour 1, 2 et 3 maisons", function() {
        street.housesNb = 1;
        assert.equal(200, street.rentalPrice);
        street.housesNb = 2;
        assert.equal(300, street.rentalPrice);
        street.housesNb = 3;
        assert.equal(400, street.rentalPrice);
    });

    it("Il y a un hôtel, maintenant le prix d'un loyer doit être de 800", function() {
        street.hostel = true;
        assert.equal(800, street.rentalPrice);
    });
});
