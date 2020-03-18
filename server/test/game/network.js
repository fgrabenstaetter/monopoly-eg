const ioClient    = require('socket.io-client');
const assert      = require('assert')
const app         = require('express')();
const http        = require('http');
const Constants   = require('../../lib/constants');
const Errors      = require('../../lib/errors');
const User        = require('../../game/user');
const Lobby       = require('../../game/lobby');
const Matchmaking = require('../../game/matchmaking');
const Network     = require('../../game/network');

describe('Network + sockets', () => {

    const port = 3002;
    const server = http.createServer(app).listen(port);
    const ioServer = require('socket.io')(server);
    let clientSocket, serverSocket;
    let user = new User({
        id                  : 12489324,
        nickname            : 'Danyl',
        email               : 'danyl@gmail.com',
        level               : 2,
        exp                 : 0,
        inscriptionDatetime : 834823492323
    });

    let GLOBAL = {
        users   : [],
        lobbies : [],
        games   : []
    };
    GLOBAL.matchmaking = new Matchmaking(GLOBAL);
    GLOBAL.network     = new Network(ioServer, GLOBAL);

    ioServer.on('connection', (sock) => {
        serverSocket = sock;
        user.socket = serverSocket;
        sock.emit('YES');
    });

    after( () => {
        process.exit(0);
    });

    beforeEach( (done) => {
        GLOBAL.users = [];
        GLOBAL.lobbies = [];
        GLOBAL.games = [];

        clientSocket = ioClient.connect('http://localhost:' + port);
        clientSocket.on('YES', () => {
            done();
        });
    });
    afterEach( (done) => {
        serverSocket.disconnect();
        clientSocket.close();
        done();
    });

    it('Réception de lobbyCreatedRes par l\'hôte', (done) => {
        const lobby = new Lobby(user, GLOBAL);
        GLOBAL.lobbies.push(lobby);
        clientSocket.on('lobbyCreatedRes', (data) => {
            done();
        });
        clientSocket.emit('lobbyReadyReq');
    });
});

// CODE DE DANYL
//
//server.once("connection", function (socket) {
//    serverSocket = socket;
//});

//clientSocket = client.connect();

//describe('Fast and isolated socket tests', function() {
//    //Exemple de test socket => Adapter avec network, appels de méthodes!
//    it('Les sockets devraient communiquer sans server', function(done) {
//        serverSocket.on('message', function (message) {
//        console.log(message);
//        assert.equal('Hello World!', message);
