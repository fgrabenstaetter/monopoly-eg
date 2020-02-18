const Player = require('./../../../game/player');

const {createPawns} = require('./pawn');
const {createUser} = require('./user');


function createPlayer(userSchema = null, pawn = 1) {
    let user = createUser(userSchema);
    return new Player(user, pawn);
}

module.exports.createPlayer = createPlayer;
