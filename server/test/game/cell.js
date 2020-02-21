const Cell = require('../../game/cell');
const Property = require('../../game/property');
const PublicCompany = require('../../game/publicCompany');
const Street = require('../../game/street');
const Constants = require('../../lib/constants');
const assert = require('assert');

describe("Test sur la classe Cell", function() {
    it('Doit renvoyer/afficher Parc', function() {
        let proCell0 = new Street(0);
        let testParc = new Cell(0, Constants.CELL_TYPE.PARC, proCell0);
        assert.equal('Parc', testParc.name);
    });
});
