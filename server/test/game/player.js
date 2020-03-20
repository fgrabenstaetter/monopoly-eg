const User = require('../../game/user');
const Player = require('../../game/player');
const Properties = require('../../lib/properties');
const Street = require('../../game/street');
const assert = require('assert');

describe("Test sur la classe Player", function() {
    const userSchema = {
        nickname: 'Matthias',
        email: 'matthiass@gmail.com',
        level: 1,
        exp: 0
    };
    const user = new User(userSchema);
    const player = new Player(user, 0);
    const street = new Street(Properties.STREET[0]);

    it("Le joueur ne doit pas encore posséder de propriété", function() {
        assert.equal(0, player.properties.length);
    });

    it("Le joueur commence la partie sur la première case", function() {
        assert.equal(null, player.currentCell);
    });

    it("Le joueur ne commence pas en prison", function() {
        assert.equal(false, player.isInPrison);
    })

    it("Le joueur est maintenant en prison", function() {
        player.goPrison();
        assert.equal(true, player.isInPrison);
    });

    it("Le joueur possède maintenant la Rue de Londres", function() {
        player.addProperty(street);
        console.log(Properties.STREET[0]);
        assert.equal(1, player.properties.length);
        assert.equal("Rue de Londres", player.properties[0].name);
    });

    it("Le joueur ne possède plus la Rue de Londres", function() {
        player.delProperty(street);
        assert.equal(0, player.properties.length);
    });
});
