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

describe('Network + Game', () => {
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
            assert.strictEqual(data.playersMoney, Constants.GAME_PARAM.PLAYER_INITIAL_MONEY);
            assert.strictEqual(data.bankMoney, Constants.GAME_PARAM.BANK_INITIAL_MONEY);
            assert.strictEqual(data.players.length, 2);
            assert.deepStrictEqual(data.players, [{ id: user.id,  nickname: user.nickname, pawn: 0 },
                                                  { id: user2.id, nickname: user2.nickname, pawn: 1 }]);
            assert.strictEqual(data.cells.length, 40);
            assert.strictEqual(data.properties.length >= 10, true);

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
            assert.strictEqual(data.cellPos, game.playerByID(id).cellPos);
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

    it('Achat d\'une propriété par un joueur', (done) => {
        const game = new Game([user, user2], [0, 1], GLOBAL);
        // démarrage manuel
        for (const player of game.players)
            player.isReady = true;
        game.forcedDiceRes = [1, 3]; // => Properties.STREET[0]
        game.start(true);
        const player = game.curPlayer;

        let sock;
        if (player.user.socket === serverSocket)
            sock = clientSocket;
        else
            sock = clientSocket2;

        sock.on('gameActionRes', (data) => {
            assert.deepEqual(data.dicesRes, [1, 3]);
            assert.strictEqual(data.playerID, player.id);
            assert.strictEqual(data.cellPos, 4);
            assert.strictEqual(data.asyncRequestType, 'canBuy');
            assert.deepStrictEqual(data.asyncRequestArgs, [ Properties.STREET[0].prices.empty ]);

            sock.on('gamePropertyBuyRes', (data) => {
                assert.strictEqual(data.error, undefined);
                assert.strictEqual(data.propertyID, game.curCell.property.id);
                assert.strictEqual(data.playerID, player.id);
                assert.strictEqual(data.playerMoney, Constants.GAME_PARAM.PLAYER_INITIAL_MONEY - game.curCell.property.prices.empty);
                assert.strictEqual(data.bankMoney, Constants.GAME_PARAM.BANK_INITIAL_MONEY + game.curCell.property.prices.empty);
                done();
            });
            sock.emit('gamePropertyBuyReq');
        });

        sock.on('gameRollDiceRes', (data) => {
            assert.strictEqual(data.error, Errors.SUCCESS.code);
        });
        sock.emit('gameRollDiceReq');
    });

    it('Amélioration d\'une propriété par un joueur', (done) => {
        const game = new Game([user, user2], [0, 1], GLOBAL);
        // démarrage manuel
        for (const player of game.players)
            player.isReady = true;
        game.forcedDiceRes = [1, 3]; // => Properties.STREET[0]
        game.start(true);
        const player = game.curPlayer;
        const property = game.cells[4].property;
        game.bank.delProperty(property);
        game.curPlayer.addProperty(property);

        let sock;
        if (player.user.socket === serverSocket)
            sock = clientSocket;
        else
            sock = clientSocket2;

        sock.on('gameActionRes', (data) => {
            assert.deepEqual(data.dicesRes, [1, 3]);
            assert.strictEqual(data.playerID, player.id);
            assert.strictEqual(data.cellPos, 4);
            assert.strictEqual(data.asyncRequestType, 'canUpgrade');
            assert.deepStrictEqual(data.asyncRequestArgs, [400, 800, 1200, null, null]);

            sock.on('gamePropertyUpgradeRes', (data2) => {
                assert.strictEqual(data2.error, undefined);
                assert.strictEqual(data2.propertyID, game.curCell.property.id);
                assert.strictEqual(data2.playerID, player.id);
                assert.strictEqual(data2.playerMoney, Constants.GAME_PARAM.PLAYER_INITIAL_MONEY - 1200);
                assert.strictEqual(data2.level, 3);
                done();
            });
            sock.emit('gamePropertyUpgradeReq', { level: 3 });
        });

        sock.on('gameRollDiceRes', (data) => {
            assert.strictEqual(data.error, Errors.SUCCESS.code);
        });
        sock.emit('gameRollDiceReq');
    });
});
