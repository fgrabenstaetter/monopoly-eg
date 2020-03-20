const PublicCompany = require('../game/publicCompany');
const Constants = require('../lib/constants');
const Properties = require('../lib/properties');
const assert = require('assert');

describe("PublicCompany", function() {
    const pCompany = new PublicCompany(Properties.PUBLIC_COMPANY[1]);

    it("Le nom de la compagnie est UFR de math Info", function() {
        assert.equal("UFR de math Info", pCompany.name);
    });

    it("Le prix d'achat est de 530", function() {
        assert.equal(530, pCompany.price);
    });

    it("Le prix d'un loyer si le joueur a fait 5 au lancé de dés est de 225", function() {
        const ld = 5 * pCompany.rentalPrice;
        assert.equal(225, ld);
    });
});
