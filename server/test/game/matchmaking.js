const User = require('../../game/user');
const Lobby = require('../../game/lobby');
const Matchmaking = require('../../game/matchmaking');
const Game = require('../../game/game');
const Network = require('../../game/network');
const assert = require('assert');
const io = require('socket.io-client');

let GLOBAL = {
    users: [], // Utilisateurs actuellement connectés (hors jeu ou en jeu)
    lobbies: [], // Lobbies actuellement créés
    games: [], // Parties de jeu actuellement en cours
}

GLOBAL.matchmaking = new Matchmaking(GLOBAL);
GLOBAL.network = new Network(io, GLOBAL);


describe("Test sur la classe Matchmaking", function() {
    let socket;
    beforeEach(function(done) {
        socket = io.connect('http://localhost:6000', {
            'reconnection delay' : 0
            , 'reopen delay' : 0
            , 'force new connection' : true
        });
        socket.on('connect', function() {
            console.log('worked...');
            //done();
        });
        socket.on('disconnect', function() {
            console.log('disconnected...');
        });
        done();
    });

    afterEach(function(done) {
        if(socket.connected) {
            console.log('disconnecting...');
            socket.disconnect();
        } else {
            console.log('no connection to break...');
        }
        done();
    });
    describe("Premier test", function() {
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
        const userSchema3 = {
            nickname: 'Florian',
            email: 'florian@gmail.com',
            friends: ['Danyl', 'Boris', 'Matthias'],
            inscriptionDatetime: 252998912,
            level: 1,
            exp: 0
        };
        const userSchema4 = {
            nickname: 'Matthias',
            email: 'matthiass@gmail.com',
            friends: ['François', 'Boris', 'Florian', 'Danyl'],
            inscriptionDatetime: 152888912,
            level: 1,
            exp: 0
        };
        const matchmaking = new Matchmaking(GLOBAL);
        const user1 = new User(userSchema1);
        const user2 = new User(userSchema2);
        const user3 = new User(userSchema3);
        const user4 = new User(userSchema4);

        it("Aucun lobby n'a encore été créé", function() {
            assert.equal(0, GLOBAL.lobbies.length);
        });

        it("Aucune Partie n'a encore débutée", function() {
            assert.equal(0, GLOBAL.games.length);
        });

        it("Fusion de 2 lobbies à 2 joueurs pour une partie à 4 joueurs", function() {
            socket.on('connection', (socket) => {
                user1.socket = socket;
                user2.socket = socket;
                const lobby1 = new Lobby(user1, GLOBAL);
                const lobby2 = new Lobby(user2, GLOBAL);
                lobby1.addUser(user3);
                lobby2.addUser(user4);
                lobby1.changeTargetUsersNb(4);
                lobby2.changeTargetUsersNb(4);
                matchmaking.addLobby(lobby1);
                matchmaking.addLobby(lobby2);
                assert.equal(1, matchmaking.games.length);
                done();
            });
        });
    });
});
