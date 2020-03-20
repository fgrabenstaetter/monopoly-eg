const ioClient    = require('socket.io-client');
const assert      = require('assert')
const app         = require('express')();
const http        = require('http');
const Constants   = require('../lib/constants');
const Errors      = require('../lib/errors');
const User        = require('../game/user');
const Lobby       = require('../game/lobby');
const Game        = require('../game/game');
const Matchmaking = require('../game/matchmaking');
const Network     = require('../game/network');
const Properties  = require('../lib/properties');

describe('Network + Lobby', () => {
    const port = 3003;
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

    afterEach( () => {
        serverSocket.disconnect();
        serverSocket2.disconnect();
        clientSocket.close();
        clientSocket2.close();
    });

    after( () => {
        server.close();
    });

    it('Réception de lobbyCreatedRes par l\'hôte', (done) => {
        const lobby = new Lobby(user, GLOBAL);
        GLOBAL.lobbies.push(lobby);

        clientSocket.on('lobbyCreatedRes', (data) => {
            done();
        });
        clientSocket.emit('lobbyReadyReq');
        done();
    });

    it('Kick d\'un user quittant un lobby', (done) => {
        const lobby = new Lobby(user, GLOBAL);
        lobby.addUser(user2);
        assert.equal(2, lobby.users.length);
        GLOBAL.lobbies.push(lobby);
        lobby.delUser(user2);

        clientSocket2.emit('lobbyUserLeftRes');
        clientSocket.on('lobbyUserLeftRes', (data) => {
            assert.equal(data.userID, user2.id);
            assert.equal(data.hostID, user.id);
            done();
        });
    });

    it('Changement de pion', (done) => {
        const lobby = new Lobby(user, GLOBAL);
        GLOBAL.lobbies.push(lobby);
        clientSocket.emit('lobbyChangePawnReq', {pawn: 6});

        clientSocket.on('lobbyUserPawnChangedRes', (data) => {
            //console.log(data);
            assert.equal(data.userID, user.id);
            assert.equal(data.pawn, 6);
            done();
        });
    });

    it('Changement du nombre de joueur pour la partie à chercher (matchmaking)', (done) => {
        const lobby = new Lobby(user, GLOBAL);
        GLOBAL.lobbies.push(lobby);
        const random = Math.floor(Math.random()*(8-2+1)+2);

        clientSocket.emit('lobbyChangeTargetUsersNbReq', {nb: random});

        clientSocket.on('lobbyTargetUsersNbChangedRes', (data) => {
            //console.log(data);
            assert.equal(data.nb, lobby.targetUsersNb);
            done();
        });
    });

    it('Envoi de message dans le chat', (done) => {
        const lobby = new Lobby(user, GLOBAL);
        lobby.addUser(user2);
        GLOBAL.lobbies.push(lobby);

        let msg = 'Bonjour c\'est moi!';
        let nb = 0;

        clientSocket2.on('lobbyChatReceiveRes', (data) => {
            if (data.senderUserId === user.id) {
                console.log(data);
                assert.equal(user.id, data.senderUserID);
                assert.equal(msg, data.content);

            } else if (data.senderUserID !== user.id) {
                msg = user2.nickname + ' a rejoint !';
                assert.equal(-1, data.senderUserID);
                assert.equal(msg, data.content);
            }

            if (++ nb === 2) done();
        });

        clientSocket.on('lobbyChatSendRes', (data) => {
            assert.strictEqual(data.error, Errors.SUCCESS.code);
            if (++ nb === 2) done();
        });
        clientSocket.emit('lobbyChatSendReq', {content: msg});
    });

    it('Lancement d\'une game avec 2 utilisateurs dans un lobby pour une partie à 2 joueurs', (done) => {
        const lobby = new Lobby(user, GLOBAL);
        lobby.addUser(user2);
        GLOBAL.lobbies.push(lobby);
        assert.equal(true, lobby.open);
        lobby.changeTargetUsersNb(2);
        clientSocket.emit('lobbyPlayReq');
        clientSocket.on('lobbyPlayRes', (data) => {
            assert.equal(false, lobby.open);
            //La game a été lancée
            assert.equal(Errors.SUCCESS.code, data.error);
            assert.equal(Errors.SUCCESS.status, data.status);
            assert.equal(1, GLOBAL.games.length);
            done();
        });
    });
});
