const Game = require('../../game/game');

const {createUser} = require('./user');


function createGame(playersCount=4, userSchemas=null, inputPawns=null, inputGlobal=null) {
    // initialise les utilisateurs
    let users = [];
    let pawns = [0,1,2,3,4,5,6,7];
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

    game = new Game(users, pawns, _global);
    return game;
}

module.exports.createGame = createGame;
