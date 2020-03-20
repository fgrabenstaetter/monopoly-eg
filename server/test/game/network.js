const ioClient    = require('socket.io-client');
const assert      = require('assert')
const app         = require('express')();
const http        = require('http');
const Constants   = require('../../lib/constants');
const Errors      = require('../../lib/errors');
const User        = require('../../game/user');
const Lobby       = require('../../game/lobby');
const Game        = require('../../game/game');
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

    /////////////////
    // TESTS LOBBY //
    /////////////////

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

    ////////////////
    // GAME TESTS //
    ////////////////

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

            if (++ nb === 2)
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

    it('Réception de gameTurnRes + cohérence données', (done) => {
        const game = new Game([user, user2], [0, 1], GLOBAL);
        // démarrage manuel
        for (const player of game.players)
            player.isReady = true;
        game.start(true);

        let nb = 0;
        function process (data) {
            assert.strictEqual(data.error, Errors.SUCCESS.CODE);
            assert.strictEqual(data.playerID, game.curPlayer.id);
            assert.ok(data.turnEndTime);
            if (++ nb === 2)
                done();
        }

        clientSocket.on('gameTurnRes', (data) => {
            process(data);
        });
        clientSocket2.on('gameTurnRes', (data) => {
            process(data);
        });
    });

    it('Un joueur dont ce n\'est pas le tour ne peux pas lancer les dés', (done) => {
        const game = new Game([user, user2], [0, 1], GLOBAL);
        // démarrage manuel
        for (const player of game.players)
            player.isReady = true;
        game.start(true);

        let sock;
        if (game.curPlayer.user.socket === serverSocket)
            sock = clientSocket2;
        else
            sock = clientSocket;

        sock.on('gameRollDiceRes', (data) => {
            assert.strictEqual(data.error, Errors.GAME.NOT_MY_TURN.code);
            done();
        });
        sock.emit('gameRollDiceReq');
    });

    it('Le joueur actuel lance les dés + cohérence données action de jeu', (done) => {
        const game = new Game([user, user2], [0, 1], GLOBAL);
        // démarrage manuel
        for (const player of game.players)
            player.isReady = true;
        game.start(true);

        let sock, id, nb = 0;
        if (game.curPlayer.user.socket === serverSocket) {
            sock = clientSocket;
            id = user.id;
        } else {
            sock = clientSocket2;
            id = user2.id;
        }

        sock.on('gameActionRes', (data) => {
            assert.strictEqual(data.dicesRes.length, 2);
            assert.strictEqual(data.playerID, id);
            assert.strictEqual(data.cellID, game.playerByID(id).cellPos);
            assert.notStrictEqual(data.actionMessage, undefined);
            assert.notStrictEqual([null, 'canBuy', 'canUpgrade', 'shouldMortage'].indexOf(data.asyncRequestType), -1);
            assert.notStrictEqual(data.asyncRequestArgs, undefined);
            assert.ok(data.updateMoney);
            assert.ok(data.extra);
            if (++ nb === 2) done();
        });
        sock.on('gameRollDiceRes', (data) => {
            assert.strictEqual(data.error, Errors.SUCCESS.code);
            if (++ nb === 2) done();
        });
        sock.emit('gameRollDiceReq');
    });
});
