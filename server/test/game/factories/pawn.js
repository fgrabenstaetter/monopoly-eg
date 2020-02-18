const Pawn = require('../../../game/pawn');


function createPawns (count) {
    let pawns = [];
    for (let i of Array(count).keys()) {
        let pawn = new Pawn(
            id=i,
            token='test_' + i
        );
        pawns.push(pawn);
    }
    return pawns;
}

module.exports.createPawns = createPawns;
