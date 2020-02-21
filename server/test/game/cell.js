const Cell = require('../../game/cell');
const Property = require('../../game/property');
const PublicCompany = require('../../game/publicCompany');
const Street = require('../../game/street');
const Constants = require('../../lib/constants');
const Properties = require('../../lib/properties');
const User = require('../../game/user');
const assert = require('assert');

describe("Test sur la classe Cell", function() {
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
    const proCell1 = new Street(user1, Properties.STREET[0]);
    //3e arg à compléter lorsque la classe Game sera prête à l'emploi
    const proCell2 = new Street(user2, Properties.TRAIN_STATION[1]);

    it("La cellule est de type STREET", function() {
        const testStreet = new Cell(Constants.CELL_TYPE.PROPERTY, proCell1);
        assert.equal(Constants.CELL_TYPE.PROPERTY, testStreet.type);
        assert.notEqual(Constants.CELL_TYPE.PRISON, testStreet.type);
    });

    it("Le nom de TRAIN_STATION[1] est Gare de Mulhouse", function() {
        const street = new Cell(Constants.CELL_TYPE.PROPERTY, proCell2);
        assert.equal("Gare de Mulhouse", street.name);
        //assert.notEqual("Gare de Strasbourg", street.name);
    });
});
