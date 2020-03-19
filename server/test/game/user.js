const User = require('../../game/user');
const assert = require('assert');

describe("Test sur la classe User", function() {
    const userSchema = {
        nickname: 'François',
        email: 'francois@gmail.com',
        inscriptionDatetime: 152888912,
        level: 1,
        exp: 0
    };
    let user = new User(userSchema);
    user.friends = ['Danyl', 'Boris', 'Matthias'],

    it("Expérience de base doit être à 0", function() {
        assert.equal(0, user.exp);
    });

    it("Expérience du joueur doit finir à 20", function() {
        user.addExperience(260);
        assert.equal(60, user.exp);
        user.addExperience(60);
        assert.equal(20, user.exp);
    });

    it("Le profil est passé niveau 4", function() {
        assert.equal(4, user.level);
    });

    it("le profil possède 3 amis", function() {
        assert.equal(3, user.friends.length);
    });
});
