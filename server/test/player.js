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

    describe('toJSON()', function () {
        it('doit retourner le dictionaire representant l\'etat actuel du joueur', function () {
            let user = new User(userSchema);
            let player = new Player(user, 0);
            let res = player.toJSON();

            assert.equal(res.nickname, 'Matthias');
            assert.equal(res.pawn, 0);
            assert.equal(res.money, 1500);
            assert.equal(res.currentCell, null);
            assert.equal(res.nbJailEscapeCards, 0);
            assert.equal(res.remainingTurnsInJail, 0);

            /*
            {
                nickname: 'Matthias',
                id: player.id,
                pawn: 0,
                money: 1500,
                currentCell: null,
                jailJokerCards: 0,
                remainingTurnsInJail: 0
            });
            */
        });
    });



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
        assert.equal(4, player.remainingTurnsInJail);
    });

    it("Le joueur possède maintenant la Rue du vieux marché aux poissons", function() {
        const player = new Player(user, 0);
        const street = new Street(Properties.STREET[0]);
        player.addProperty(street);
        assert.equal(1, player.properties.length);
        assert.equal("Rue du Vieux Marché aux Poissons", player.properties[0].name);
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
