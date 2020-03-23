const User = require('../game/user');
const Player = require('../game/player');
const Properties = require('../lib/properties');
const Street = require('../game/street');
const assert = require('assert');

describe("Player", function() {
    const userSchema = {
        nickname: 'Matthias',
        email: 'matthiass@gmail.com',
        level: 1,
        exp: 0
    };
    const user = new User(userSchema);

    it("Le joueur ne doit pas encore posséder de propriété", function() {
        const player = new Player(user, 0);
        assert.equal(0, player.properties.length);
    });

    it("Le joueur commence la partie sur la première case", function() {
        const player = new Player(user, 0);
        assert.equal(0, player.cellPos);
    });

    it("Le joueur ne commence pas en prison", function() {
        const player = new Player(user, 0);
        assert.equal(false, player.isInPrison);
    })

    it("Le joueur est maintenant en prison", function() {
        const player = new Player(user, 0);
        player.goPrison();
        assert.equal(true, player.isInPrison);
        assert.equal(3, player.remainingTurnsInJail);
    });

    it("Le joueur possède maintenant la Rue du vieux marché aux poissons", function() {
        const player = new Player(user, 0);
        const street = new Street(Properties.STREET[0]);
        player.addProperty(street);
        assert.equal(1, player.properties.length);
        assert.equal("Rue du vieux marché aux poissons", player.properties[0].name);
    });

    it("Le joueur ne possède plus la Rue du vieux marché aux poissons", function() {
        const player = new Player(user, 0);
        const street = new Street(Properties.STREET[0]);
        player.addProperty(street);
        assert.equal(1, player.properties.length);
        player.delProperty(street);
        assert.equal(-1, player.properties.indexOf(street));
    });
});
