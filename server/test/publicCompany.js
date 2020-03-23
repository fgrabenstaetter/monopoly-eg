const PublicCompany = require('../game/publicCompany');
const Constants = require('../lib/constants');
const User = require('../game/user');
const Player = require('../game/player');
const Properties = require('../lib/properties');
const assert = require('assert');

describe("PublicCompany", function() {
    const userSchema = {
        nickname: 'François',
        email: 'francois@gmail.com',
        inscriptionDatetime: 152888912,
        level: 1,
        exp: 0
    };
    let user = new User(userSchema);
    it("Le nom de la compagnie est Syndicat Des Eaux et de l'Assainissement", function() {
        const pCompany = new PublicCompany(Properties.PUBLIC_COMPANY[1]);
        assert.equal("Syndicat Des Eaux et de l'Assainissement", pCompany.name);
    });

    it("Le prix d'achat d'une compagnie est de 150", function() {
        const pCompany = new PublicCompany(Properties.PUBLIC_COMPANY[1]);
        assert.equal(150, pCompany.price);
    });

    it("Le prix d'un loyer si le joueur a fait 5 au lancé de dés et 1 compagnie est possédée est de 20", function() {
        const pCompany = new PublicCompany(Properties.PUBLIC_COMPANY[1]);
        const player = new Player(user, 0);
        player.addProperty(pCompany);
        assert.equal(20, pCompany.rentalPrice([3,2]));
    });
});
