const Cell = require('../../game/cell');
const Property = require('../../game/property');
const PublicCompany = require('../../game/publicCompany');
const Street = require('../../game/street');
const Constants = require('../../lib/constants');
<<<<<<< HEAD
const Properties = require('../../lib/properties');
const User = require('../../game/user');
=======
>>>>>>> b1686af40735776bccb439f91bb142845e4ab311
const assert = require('assert');

describe("Test sur la classe Cell", function() {
    it('Doit renvoyer/afficher Parc', function() {
<<<<<<< HEAD
        const userSchema1 = {
            nickname: 'François',
            email: 'francois@gmail.com',
            friends: ['Danyl', 'Boris', 'Matthias'],
            inscriptionDatetime: 152888912,
            level: 1,
            exp: 0
        };
        const userSchema2 = {
            nickname: 'Danyl',
            email: 'danyl@gmail.com',
            friends: ['François', 'Matthias', 'Boris'],
            inscriptionDatetime: 152888912,
            level: 1,
            exp: 0
        };

        const user1 = new User(userSchema1);
        const user2 = new User(userSchema2);

        //3e arg à compléter lorsque la classe Game sera prête à l'emploi
        let proCell1 = new Street(0, user1, {});
        //3e arg à compléter lorsque la classe Game sera prête à l'emploi
        let proCell2 = new Street(1, user2, {});
        let testParc = new Cell(0, Constants.CELL_TYPE.PARC, proCell1);
=======
        let proCell0 = new Street(0);
        let testParc = new Cell(0, Constants.CELL_TYPE.PARC, proCell0);
>>>>>>> b1686af40735776bccb439f91bb142845e4ab311
        assert.equal('Parc', testParc.name);
    });
});
