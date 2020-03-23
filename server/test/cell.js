const Cells          = require('../lib/cells');
const Property      = require('../game/property');
const PublicCompany = require('../game/publicCompany');
const Street        = require('../game/street');
const Constants     = require('../lib/constants');
const Properties    = require('../lib/properties');
const assert        = require('assert');

describe("Cell", function() {
    it("La cellule 1 est de type STREET", function() {
        const testStreet = Cells[1];
        assert.equal(Constants.CELL_TYPE.PROPERTY, testStreet.type);
        assert.notEqual(Constants.CELL_TYPE.PRISON, testStreet.type);
    });

    it("La cellule 3 correspond à la Rue des tonneliers", function() {
        const street = Cells[3];
        assert.equal("Rue des tonneliers", street.name);
        assert.notEqual("Gare de Strasbourg", street.name);
    });
});
