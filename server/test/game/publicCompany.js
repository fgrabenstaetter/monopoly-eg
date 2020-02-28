const PublicCompany = require('../../game/publicCompany');
const Constants = require('../../lib/constants');
const Properties = require('../../lib/properties');
const User = require('../../game/user');
const assert = require('assert');

describe("Test sur la classe PublicCompany", function() {
    const userSchema = {
        nickname: 'Xavier',
        email: 'xavier@gmail.com',
        friends: ['Florian', 'Dorin', 'Edouard'],
        inscriptionDatetime: 2529945877,
        level: 1,
        exp: 0
    };
    const user = new User(userSchema);
    const pCompany = new PublicCompany(user, Properties.PUBLIC_COMPANY[1]);

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
