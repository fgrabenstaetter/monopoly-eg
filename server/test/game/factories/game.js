const Game = require('./../../../game/game');

const {createPawns} = require('./pawn');
const {createUser} = require('./user');


function createGame(playersCount=4, userSchemas=null, inputPawns=null, inputGlobal=null) {
    // initialise les utilisateurs
    let users = [];
    let pawns = [];
    let _global = {
        users: [], // Utilisateurs actuellement connectés (hors jeu ou en jeu)
        lobbies: [], // Lobbies actuellement créés
        games: [], // Parties de jeu actuellement en cours
    };
    let game = null;

    if(userSchemas)
        for (let userSchema of userSchemas)
            users.push(createUser(userSchema));
    else
        for (let i of Array(playersCount).keys())
            users.push(createUser());

    if(inputPawns)
        pawns = inputPawns;
    else
        pawns = createPawns(playersCount);

    game = new Game(users, pawns, _global);
    return game;
}

module.exports.createGame = createGame;
