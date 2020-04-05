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
const Offer       = require('../game/offer');

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
        assert.strictEqual(lobby.changeDuration(60), true);

        clientSocket.emit('lobbyReadyReq');
        clientSocket2.emit('lobbyReadyReq');

        let nb = 0;
        function check (data) {
            assert.notStrictEqual(data.gameEndTime, undefined);
            assert.strictEqual(data.duration, 60);
            assert.strictEqual(data.playersMoney, Constants.GAME_PARAM.PLAYER_INITIAL_MONEY);
            assert.strictEqual(data.bankMoney, Constants.GAME_PARAM.BANK_INITIAL_MONEY);
            assert.strictEqual(data.players.length, 2);
            assert.strictEqual(data.cells.length, 40);
            assert.strictEqual(data.properties.length >= 10, true);

            if (++ nb === 2)
                done();
        }

        clientSocket.on('lobbyGameFoundRes', () => {
            clientSocket.on('gameStartedRes', (data) => {
                check(data);
            });
            clientSocket.emit('gameReadyReq');
        });

        clientSocket2.on('lobbyGameFoundRes', () => {
            clientSocket2.on('gameStartedRes', (data) => {
                check(data);
            });
            clientSocket2.emit('gameReadyReq');
        });

        clientSocket.emit('lobbyPlayReq');
    });

    it('Réception de gameTurnRes + cohérence données', (done) => {
        const game = new Game([user, user2], null, GLOBAL);
        // démarrage manuel
        for (const player of game.players)
            player.isReady = true;
        game.start(true);

        let nb = 0;
        function process (data) {
            assert.strictEqual(data.error, Errors.SUCCESS.CODE);
            assert.strictEqual(data.playerID, game.curPlayer.id);
            assert.strictEqual(data.turnEndTime, game.turnData.endTime);
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
        const game = new Game([user, user2], null, GLOBAL);
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
        const game = new Game([user, user2], null, GLOBAL);
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
        const game = new Game([user, user2], null, GLOBAL);
        // démarrage manuel
        for (const player of game.players)
            player.isReady = true;
        game.forcedDiceRes = [1, 2]; // => Properties.STREET[0]
        game.start(true);
        const player = game.curPlayer;

        let sock;
        if (player.user.socket === serverSocket)
            sock = clientSocket;
        else
            sock = clientSocket2;

        sock.on('gameActionRes', (data) => {
            assert.deepEqual(data.dicesRes, [1, 2]);
            assert.strictEqual(data.playerID, player.id);
            assert.strictEqual(data.cellPos, 3);
            assert.strictEqual(data.asyncRequestType, 'canBuy');
            assert.deepStrictEqual(data.asyncRequestArgs, [ Properties.STREET[1].prices.empty ]);

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
        const game = new Game([user, user2], null, GLOBAL);
        // démarrage manuel
        for (const player of game.players)
            player.isReady = true;
        game.forcedDiceRes = [1, 2]; // => Properties.STREET[0]
        game.start(true);
        const player = game.curPlayer;
        const property = game.cells[3].property;
        game.bank.delProperty(property);
        game.curPlayer.addProperty(property);

        let sock;
        if (player.user.socket === serverSocket)
            sock = clientSocket;
        else
            sock = clientSocket2;

        sock.on('gameActionRes', (data) => {
            assert.deepEqual(data.dicesRes, [1, 2]);
            assert.strictEqual(data.playerID, player.id);
            assert.strictEqual(data.cellPos, 3);
            assert.strictEqual(data.asyncRequestType, 'canUpgrade');
            //assert.deepStrictEqual(data.asyncRequestArgs, Properties.STREET[1]);

            sock.on('gamePropertyUpgradeRes', (data2) => {
                assert.strictEqual(data2.error, undefined);
                assert.strictEqual(data2.propertyID, game.curCell.property.id);
                assert.strictEqual(data2.playerID, player.id);
                //assert.strictEqual(data2.playerMoney, Constants.GAME_PARAM.PLAYER_INITIAL_MONEY - 1200);
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

    it('Payer un loyer (avec assez d\'argent)', (done) => {
        const game = new Game([user, user2], null, GLOBAL);
        // démarrage manuel
        for (const player of game.players)
            player.isReady = true;
        game.forcedDiceRes = [1, 2]; // => Properties.STREET[0]
        game.start(true);
        const player = game.curPlayer;
        const player2 = game.players[0] === player ? game.players[1] : game.players[0];
        const property = game.cells[3].property;
        game.bank.delProperty(property);
        player2.addProperty(property);

        let sock;
        if (player.user.socket === serverSocket)
            sock = clientSocket;
        else
            sock = clientSocket2;

        sock.on('gameActionRes', (data) => {
            assert.deepEqual(data.dicesRes, [1, 2]);
            assert.strictEqual(data.playerID, player.id);
            assert.strictEqual(data.cellPos, 3);
            assert.strictEqual(data.asyncRequestType, null);
            assert.deepStrictEqual(data.asyncRequestArgs, null);
            assert.deepStrictEqual(data.updateMoney, [{ playerID: player.id, money: Constants.GAME_PARAM.PLAYER_INITIAL_MONEY - property.rentalPrice }]);
            done();
        });

        sock.on('gameRollDiceRes', (data) => {
            assert.strictEqual(data.error, Errors.SUCCESS.code);
        });
        sock.emit('gameRollDiceReq');
    });

    it('Hypothèque forcée (pas assez pour payer loyer)', (done) => {
        const game = new Game([user, user2], null, GLOBAL);
        // démarrage manuel
        for (const player of game.players)
            player.isReady = true;
        game.forcedDiceRes = [1, 2]; // => Properties.STREET[0]
        game.start(true);
        const player = game.curPlayer; // doit payer loyer
        const player2 = game.players[0] === player ? game.players[1] : game.players[0]; // recoit le loyer
        // propriété dont player doit payer le loyer
        const property = game.cells[3].property;
        game.bank.delProperty(property);
        player2.addProperty(property);
        property.housesNb = 2; // rental price = 320
        // propriété de player2 qu'il va hypothéquer pour pouvoir payer
        const prop = game.cells[6].property;
        game.bank.delProperty(prop);
        player.addProperty(prop);
        prop.housesNb = 1; // mortage price = 80
        player.money = 22; // avec l'hypothèque il aura 302 => il devra lui rester 2$ après hypothèque forcée

        let sock;
        if (player.user.socket === serverSocket)
            sock = clientSocket;
        else
            sock = clientSocket2;

        sock.on('gameActionRes', (data) => {
            assert.deepEqual(data.dicesRes, [1, 2]);
            assert.strictEqual(data.playerID, player.id);
            assert.strictEqual(data.cellPos, 3);
            assert.strictEqual(data.asyncRequestType, 'shouldMortage');
            assert.deepStrictEqual(data.asyncRequestArgs, [ property.rentalPrice ]);

            sock.on('gamePropertyMortageRes', (data) => {
                assert.strictEqual(data.error, undefined);
                assert.deepStrictEqual(data.properties, [ prop.id ]);
                assert.strictEqual(data.playerID, player.id);
                assert.strictEqual(data.playerMoney, 37);
                assert.ok(data.message);
                assert.deepStrictEqual(data.rentalOwner, { id: player2.id, money: Constants.GAME_PARAM.PLAYER_INITIAL_MONEY + property.rentalPrice });
                done();
            });
            sock.emit('gamePropertyMortageReq', { properties: [prop.id] });
        });

        sock.on('gameRollDiceRes', (data) => {
            assert.strictEqual(data.error, Errors.SUCCESS.code);
        });
        sock.emit('gameRollDiceReq');
    });

    it('Test sur le retrait de carte chance/communauté', (done) => {
        const game = new Game([user, user2], null, GLOBAL);
        // démarrage manuel
        for (const player of game.players)
            player.isReady = true;
        game.forcedDiceRes = [3, 4]; // => Properties.STREET[0]
        game.start(true);
        const player = game.curPlayer;
        const money = player.money;
        let newMoney;

        let sock;
        if (player.user.socket === serverSocket)
            sock = clientSocket;
        else
            sock = clientSocket2;

        sock.on('gameActionRes', (data) => {
            const savedCard = game.chanceDeck.drawnCards[game.chanceDeck.drawnCards.length - 1];
            const receivedCard = data.extra.newCard;
            if (data.cellPos === 7) {
                assert.deepEqual(data.dicesRes, [3, 4]);
                assert.strictEqual(data.playerID, player.id);
                assert.strictEqual(data.cellPos, 7);
                assert.strictEqual(data.asyncRequestType, null);

                assert.strictEqual('chance', receivedCard.type);
                assert.deepStrictEqual(receivedCard.description, savedCard.description);
                switch (savedCard.effectType) {
                    case 'loseMoney':
                        newMoney = money - savedCard.effectArg1;
                        assert.strictEqual(newMoney, player.money);
                        break;

                    case 'gainMoney':
                        newMoney = money + savedCard.effectArg1;
                        assert.strictEqual(newMoney, player.money);
                        break;

                    case 'jailBreak':
                        break;

                    case 'jailTime':
                        break;

                    case 'repair':
                        break;

                    default:
                        //NE RIEN FAIRE
                        break;
                }
                done();
            }
            else if (data.cellPosTmp !== null) {
                assert.deepEqual(data.dicesRes, [3, 4]);
                assert.strictEqual(data.playerID, player.id);
                //assert.strictEqual(data.asyncRequestType, 'canBuy');
                assert.strictEqual('chance', receivedCard.type);
                assert.deepStrictEqual(receivedCard.description, savedCard.description);
                switch (savedCard.effectType) {
                    case 'moveAbsolute':
                        assert.strictEqual(player.cellPos, data.cellPos);
                        break;

                    case 'moveRelative':
                        assert.strictEqual(player.cellPos, data.cellPos);
                        break;

                    default:
                        //NE RIEN FAIRE
                        break;
                }
                done();
            }
        });

        sock.on('gameRollDiceRes', (data) => {
            assert.strictEqual(data.error, Errors.SUCCESS.code);
        });
        sock.emit('gameRollDiceReq');
    });

    it('Enchère créée sans surrenchérissement', (done) => {
        const game = new Game([user, user2], null, GLOBAL);
        // démarrage manuel
        for (const player of game.players)
            player.isReady = true;
        game.forcedDiceRes = [2, 4]; // => Properties.STREET[0]
        game.start(true);
        const player = game.curPlayer;
        let sock;
        if (player.user.socket === serverSocket)
            sock = clientSocket;
        else
            sock = clientSocket2;
        let nb = 0;
        sock.on('gameActionRes', (data) => {
            assert.deepEqual(data.dicesRes, [2, 4]);
            assert.strictEqual(data.playerID, player.id);
            assert.strictEqual(data.cellPos, 6);
            assert.strictEqual(data.asyncRequestType, 'canBuy');
            //On teste si les 2 joueurs ont bien reçu tous les deux l'évent gameBidRes
            clientSocket.on('gameBidRes', (data) => {
                assert.strictEqual(null, data.playerID);
                assert.strictEqual(data.price, game.cells[player.cellPos].property.prices.empty);
                assert.strictEqual(0, data.bidID);
                if (++ nb === 2) done();
            });

            clientSocket2.on('gameBidRes', (data) => {
                assert.strictEqual(null, data.playerID);
                assert.strictEqual(data.price, game.cells[player.cellPos].property.prices.empty);
                assert.strictEqual(0, data.bidID);
                if (++ nb === 2) done();
            });
            //Utile car sinon le timer du test expire avant celui du vrai timeout "IN-GAME"
            sock.emit('gameTurnEndReq');
        });

        sock.on('gameRollDiceRes', (data) => {
            assert.strictEqual(data.error, Errors.SUCCESS.code);
        });
        sock.emit('gameRollDiceReq');
    });

    it('Créer, recevoir et accepter une offre de propriété', (done) => {
        const game = new Game([user, user2], null, GLOBAL);
        // démarrage manuel
        for (const player of game.players)
            player.isReady = true;
        game.forcedDiceRes = [1, 2]; // => Properties.STREET[1] (inutile ici)
        game.start(true);
        const player = game.curPlayer; // va créer et envoyer l'offre à player2 et donc recevoir la propriété et perdre l'argent
        const player2 = game.players[0] === player ? game.players[1] : game.players[0]; // va accepter l'offre et donc perdre sa propriété
        const nextOfferID = Offer.idCounter;

        const property = game.cells[5].property; // train station
        game.bank.delProperty(property);
        player2.addProperty(property);

        let sock, sock2;
        if (player.user.socket === serverSocket) {
            sock = clientSocket;
            sock2 = clientSocket2;
        } else {
            sock = clientSocket2;
            sock2 = clientSocket;
        }

        let nb = 0;

        sock2.on('gameOfferReceiveRes', (data) => {
            assert.strictEqual(data.offerID, nextOfferID);
            assert.strictEqual(data.makerID, player.id);
            assert.strictEqual(data.receiverID, player2.id);
            assert.strictEqual(data.propertyID, property.id);
            assert.strictEqual(data.price, 456);

            sock2.on('gameOfferFinishedRes', (data) => {
                assert.strictEqual(data.receiverID, player2.id);
                assert.strictEqual(data.offerID, nextOfferID);
                assert.strictEqual(data.price, 456);
                assert.strictEqual(data.propertyID, property.id);
                assert.strictEqual(data.makerID, player.id);
                if (++ nb === 4) done();
            });

            sock.on('gameOfferFinishedRes', (data) => {
                assert.strictEqual(data.receiverID, player2.id);
                assert.strictEqual(data.offerID, nextOfferID);
                assert.strictEqual(data.price, 456);
                assert.strictEqual(data.propertyID, property.id);
                assert.strictEqual(data.makerID, player.id);

                // tests sur game
                assert.strictEqual(player2.money, Constants.GAME_PARAM.PLAYER_INITIAL_MONEY + 456);
                assert.strictEqual(player.money, Constants.GAME_PARAM.PLAYER_INITIAL_MONEY - 456);
                assert.strictEqual(property.owner, player);
                if (++ nb === 4) done();
            });

            sock2.on('gameOfferAcceptRes', (data) => {
                assert.strictEqual(data.error, 0);
                if (++ nb === 4) done();
            });

            sock2.emit('gameOfferAcceptReq', {
                offerID: nextOfferID
            });
        });

        sock.on('gameOfferSendRes', (data) => {
            assert.strictEqual(data.error, 0);
            if (++ nb === 4) done();
        });
        sock.emit('gameOfferSendReq', {
            receiverID: player2.id,
            propertyID: property.id,
            price: 456
        });
    });

    it('Créer, recevoir et accepter une offre de carte sortie de prison', (done) => {
        const game = new Game([user, user2], null, GLOBAL);
        // démarrage manuel
        for (const player of game.players)
            player.isReady = true;
        game.forcedDiceRes = [1, 2]; // => Properties.STREET[1] (inutile ici)
        game.start(true);
        const player = game.curPlayer; // va créer et envoyer l'offre à player2 donc recevoir la carte prison et perdre l'argent
        const player2 = game.players[0] === player ? game.players[1] : game.players[0]; // va accepter l'offre et donc perdre la carte prison et gagner l'argent
        const nextOfferID = Offer.idCounter;
        player2.nbJailEscapeCards ++; // = 1

        let sock, sock2;
        if (player.user.socket === serverSocket) {
            sock = clientSocket;
            sock2 = clientSocket2;
        } else {
            sock = clientSocket2;
            sock2 = clientSocket;
        }

        let nb = 0;

        sock2.on('gameOfferReceiveRes', (data) => {
            assert.strictEqual(data.offerID, nextOfferID);
            assert.strictEqual(data.makerID, player.id);
            assert.strictEqual(data.receiverID, player2.id);
            assert.strictEqual(data.propertyID, -1);
            assert.strictEqual(data.price, 456);

            sock2.on('gameOfferFinishedRes', (data) => {
                assert.strictEqual(data.receiverID, player2.id);
                assert.strictEqual(data.offerID, nextOfferID);
                assert.strictEqual(data.price, 456);
                assert.strictEqual(data.propertyID, -1);
                assert.strictEqual(data.makerID, player.id);
                if (++ nb === 4) done();
            });

            sock.on('gameOfferFinishedRes', (data) => {
                assert.strictEqual(data.receiverID, player2.id);
                assert.strictEqual(data.offerID, nextOfferID);
                assert.strictEqual(data.price, 456);
                assert.strictEqual(data.propertyID, -1);
                assert.strictEqual(data.makerID, player.id);

                // tests sur game
                assert.strictEqual(player2.money, Constants.GAME_PARAM.PLAYER_INITIAL_MONEY + 456);
                assert.strictEqual(player.money, Constants.GAME_PARAM.PLAYER_INITIAL_MONEY - 456);
                assert.strictEqual(player2.nbJailEscapeCards, 0);
                assert.strictEqual(player.nbJailEscapeCards, 1);
                if (++ nb === 4) done();
            });

            sock2.on('gameOfferAcceptRes', (data) => {
                assert.strictEqual(data.error, 0);
                if (++ nb === 4) done();
            });

            sock2.emit('gameOfferAcceptReq', {
                offerID: nextOfferID
            });
        });

        sock.on('gameOfferSendRes', (data) => {
            assert.strictEqual(data.error, 0);
            if (++ nb === 4) done();
        });
        sock.emit('gameOfferSendReq', {
            receiverID: player2.id,
            propertyID: -1,
            price: 456
        });
    });

    it('Le joueur actuel lance les dés fait un double donc le premier succès est actif ?', (done) => {
        const game = new Game([user, user2], null, GLOBAL);
        // démarrage manuel
        for (const player of game.players)
            player.isReady = true;
        game.forcedDiceRes = [3, 3]; //On force un double
        game.start(true);
        const player = game.curPlayer;

        let sock, id, nb = 0;
        if (player.user.socket === serverSocket) {
            sock = clientSocket;
            id = user.id;
        } else {
            sock = clientSocket2;
            id = user2.id;
        }

        // A Modifier lorsque l'event pour les succès sera prêt
        sock.on('gameActionRes', (data) => {
            game.successManager.check(game);
            //console.log(game.turnData);
            //console.log(game.successManager.datas[player.id]);
            assert.strictEqual(game.successManager.datas[player.id].nbDoubles, 1);
            assert.deepEqual(data.dicesRes, [3, 3]);
            assert.strictEqual(data.playerID, player.id);
            assert.strictEqual(data.cellPos, 6);
            done();
        });

        sock.on('gameRollDiceRes', (data) => {
            assert.strictEqual(data.error, Errors.SUCCESS.code);
        });
        sock.emit('gameRollDiceReq');
    });
});
