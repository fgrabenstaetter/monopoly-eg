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


Constants.ENVIRONMENT = 'test';


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
        assert.strictEqual(lobby.users.length, 2);
        GLOBAL.lobbies.push(lobby);
        lobby.delUser(user2);

        clientSocket2.emit('lobbyUserLeftRes');
        clientSocket.on('lobbyUserLeftRes', (data) => {
            assert.equal(data.userID, user2.id);
            assert.equal(data.hostID, user.id);
            done();
        });
    });

    it('Changement du nombre de joueur pour la partie à chercher (matchmaking)', (done) => {
        const lobby = new Lobby(user, GLOBAL);
        GLOBAL.lobbies.push(lobby);
        const random = Math.floor(Math.random() * 7 + 2);

        clientSocket.emit('lobbyChangeTargetUsersNbReq', {nb: random});

        clientSocket.on('lobbyTargetUsersNbChangedRes', (data) => {
            assert.equal(data.nb, lobby.targetUsersNb);
            done();
        });
    });

    it('Changement de la durée de partie', (done) => {
        const lobby = new Lobby(user, GLOBAL);
        GLOBAL.lobbies.push(lobby);
        let nb = 0;

        clientSocket.on('lobbyChangeDurationRes', (data) => {
            assert.strictEqual(data.error, 0);
            if (++ nb === 2) done();
        });

        clientSocket.on('lobbyDurationChangedRes', (data) => {
            assert.strictEqual(data.newDuration, 60);
            assert.strictEqual(lobby.gameDuration, 60);
            if (++ nb === 2) done();
        });

        clientSocket.emit('lobbyChangeDurationReq', { newDuration: 60 });
    });
    it('Envoi de message dans le chat', (done) => {
        const lobby = new Lobby(user, GLOBAL);
        lobby.addUser(user2);
        GLOBAL.lobbies.push(lobby);

        let msg = 'Bonjour c\'est moi!';
        let nb = 0;

        clientSocket2.on('lobbyChatReceiveRes', (data) => {
            if (data.senderUserId === user.id) {
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
        let nb = 0;

        clientSocket.on('lobbyPlayRes', (data) => {
            assert.equal(data.error, 0);
            if (++ nb === 2) done();
        });

        clientSocket.on('lobbyGameFoundRes', (data) => {
            assert.equal(false, lobby.open);
            //La game a été lancée
            assert.equal(1, GLOBAL.games.length);
            if (++ nb === 2) done();
        });

        clientSocket.emit('lobbyPlayReq');
    });

    it('Lancement d\'une game avec 2 utilisateurs chacun lobby séparé pour une partie à 2 joueurs', (done) => {
        const lobby = new Lobby(user, GLOBAL);
        const lobby2 = new Lobby(user2, GLOBAL);
        GLOBAL.lobbies.push(lobby);
        GLOBAL.lobbies.push(lobby2);
        assert.strictEqual(true, lobby.open);
        assert.strictEqual(true, lobby2.open);
        lobby.changeTargetUsersNb(2);
        lobby2.changeTargetUsersNb(2);
        let nb = 0;

        for (const sock of [clientSocket, clientSocket2]) {
            sock.on('lobbyPlayRes', (data) => {
                assert.strictEqual(data.error, 0);
                GLOBAL.matchmaking.checkLaunch();
                if (++ nb === 4) done();
            });

            sock.on('lobbyGameFoundRes', (data) => {
                assert.strictEqual(false, lobby.open);
                assert.strictEqual(false, lobby2.open);
                assert.strictEqual(GLOBAL.games.length, 1);
                const game = GLOBAL.games[0];
                assert.strictEqual(game.players.length, 2);
                assert.notStrictEqual(game.playerByID(user.id), null);
                assert.notStrictEqual(game.playerByID(user2.id), null);

                if (++ nb === 4)
                    done();
            });

            sock.emit('lobbyPlayReq');
        }
    });

    it('Lancement d\'une game avec 2 utilisateurs chacun lobby séparé pour une partie à 2 joueurs avec une durée de 30 mins', (done) => {
        const lobby = new Lobby(user, GLOBAL);
        const lobby2 = new Lobby(user2, GLOBAL);
        GLOBAL.lobbies.push(lobby);
        GLOBAL.lobbies.push(lobby2);
        assert.strictEqual(true, lobby.open);
        assert.strictEqual(true, lobby2.open);
        lobby.changeTargetUsersNb(2);
        lobby2.changeTargetUsersNb(2);
        let nb = 0;

        clientSocket.on('lobbyChangeDurationRes', (data) => {
            assert.strictEqual(data.error, 0);
            if (++ nb === 6) done();
        });

        clientSocket.on('lobbyDurationChangedRes', (data) => {
            assert.strictEqual(data.newDuration, 30);
            assert.strictEqual(lobby.gameDuration, 30);
            if (++ nb === 6) done();
        });

        clientSocket.emit('lobbyChangeDurationReq', { newDuration: 30 });

        clientSocket2.on('lobbyChangeDurationRes', (data) => {
            assert.strictEqual(data.error, 0);
            if (++ nb === 6) done();
        });

        clientSocket2.on('lobbyDurationChangedRes', (data) => {
            assert.strictEqual(data.newDuration, 60);
            assert.strictEqual(lobby2.gameDuration, 60);
            if (++ nb === 6) done();
        });

        clientSocket2.emit('lobbyChangeDurationReq', { newDuration: 60 });


        for (const sock of [clientSocket, clientSocket2]) {
            sock.on('lobbyPlayRes', (data) => {
                assert.strictEqual(data.error, 0);
                GLOBAL.matchmaking.checkLaunch();
                if (++ nb === 6) done();
            });
            //console.log(GLOBAL.lobbies);

            sock.on('lobbyGameFoundRes', (data) => {
                //console.log("tata");
                assert.strictEqual(false, lobby.open);
                assert.strictEqual(false, lobby2.open);
                assert.strictEqual(GLOBAL.games.length, 1);
                const game = GLOBAL.games[0];
                assert.strictEqual(game.players.length, 2);
                assert.notStrictEqual(game.playerByID(user.id), null);
                assert.notStrictEqual(game.playerByID(user2.id), null);

                if (++ nb === 6)
                    done();
            });

            sock.emit('lobbyPlayReq');
        }
    });
});
