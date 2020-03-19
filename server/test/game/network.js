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
    let clientSocket, clientSocket2, serverSocket, serverSocket2;

    let user = new User({
        id                  : 12489324,
        nickname            : 'Danyl',
        email               : 'danyl@gmail.com',
        level               : 2,
        exp                 : 0,
        inscriptionDatetime : 834823492323
    });
    let user2 = new User({
        id                  : 12489322,
        nickname            : 'Danyl2',
        email               : 'danyl2@gmail.com',
        level               : 3,
        exp                 : 10,
        inscriptionDatetime : 834823492345
    });

    let GLOBAL = {
        users   : [user, user2],
        lobbies : [],
        games   : []
    };
    GLOBAL.matchmaking = new Matchmaking(GLOBAL);
    GLOBAL.network     = new Network(ioServer, GLOBAL);

    let tmp; // mettre 1 ou 2 selon que on connecte le socket 1 ou 2 (pour faire lien socket client / socket serveur);

    ioServer.on('connection', (sock) => {
        if (tmp === 1)
            serverSocket = sock;
        else
            serverSocket2 = sock;
        sock.emit('YES');
    });

    after( () => {
        process.exit(0);
    });

    beforeEach( (done) => {
        GLOBAL.lobbies = [];
        GLOBAL.games = [];

        tmp = 1;
        clientSocket = ioClient.connect('http://localhost:' + port);
        clientSocket.on('YES', () => {
            user.socket = serverSocket;

            tmp = 2;
            clientSocket2 = ioClient.connect('http://localhost:' + port);
            clientSocket2.on('YES', () => {
                user2.socket = serverSocket2;
                done();
            });
        });

    });

    afterEach( (done) => {
        serverSocket.disconnect();
        serverSocket2.disconnect();
        clientSocket.close();
        clientSocket2.close();
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

    it('Réception gameStartedRes + cohérence données reçues', (done) => {
        const lobby = new Lobby(user, GLOBAL);
        GLOBAL.lobbies.push(lobby);

        lobby.addUser(user2);
        lobby.changeTargetUsersNb(2);

        clientSocket.emit('lobbyReadyReq');
        clientSocket2.emit('lobbyReadyReq');

        let nb = 0;
        function check (data) {
            assert.ok(data.gameEndTime);
            assert.strictEqual(data.players.length, 2);
            assert.ok(data.cells);
            assert.ok(data.properties);

            nb ++;
            if (nb === 2)
                done();
        }

        clientSocket.on('lobbyPlayRes', () => {
            clientSocket.on('gameStartedRes', (data) => {
                check(data);
            });
            clientSocket.emit('gameReadyReq');
        });

        clientSocket2.on('lobbyPlayRes', () => {
            clientSocket2.on('gameStartedRes', (data) => {
                check(data);
            });
            clientSocket2.emit('gameReadyReq');
        });

        clientSocket.emit('lobbyPlayReq');
    });
});
