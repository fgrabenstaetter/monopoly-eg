const Cells          = require('../lib/cells');
const Cell          = require('../game/cell');
const Property      = require('../game/property');
const PublicCompany = require('../game/publicCompany');
const Street        = require('../game/street');
const Constants     = require('../lib/constants');
const Properties    = require('../lib/properties');
const assert        = require('assert');

describe("Cell", function() {
    it("La cellule 1 est de type STREET", function() {
        const testStreet = Cells.new[1];
        assert.equal(Constants.CELL_TYPE.PROPERTY, testStreet.type);
        assert.notEqual(Constants.CELL_TYPE.PRISON, testStreet.type);
    });

    it("La cellule 3 correspond à la Rue des tonneliers", function() {
        const street = Cells.new[3];
        assert.equal("Rue des tonneliers", street.property.name);
    });

    describe('toJSON()', function () {
        it('doit retourner correctement la cellule en JSON', function () {
            let cell = new Cell(
                type=Constants.CELL_TYPE.OTHER,
                null
            );
            let rec = cell.toJSON();
            assert.equal(rec.type, Constants.CELL_TYPE.OTHER);
            assert.equal(rec.property, null);
            assert.equal(rec.tax, null);
        });
    });

});
