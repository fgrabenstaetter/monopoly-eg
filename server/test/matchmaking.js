'use strict'
const User = require('../game/user');
const Lobby = require('../game/lobby');
const Matchmaking = require('../game/matchmaking');
const Game = require('../game/game');
const Network = require('../game/network');
const Express = require('express');
const Http = require('http');
const ioserver = require('socket.io');
const ioclient = require('socket.io-client');
const assert = require('assert');

const NODE_PORT = process.env.NODE_PORT || 3000

let GLOBAL = {
    users: [], // Utilisateurs actuellement connectés (hors jeu ou en jeu)
    lobbies: [], // Lobbies actuellement créés
    games: [], // Parties de jeu actuellement en cours
}

describe("Matchmaking", function() {
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

    beforeEach(() => {
		const express = new Express();
		this._http = Http.Server(express);
		this._ioserver = ioserver(this._http);
		this._http.listen(NODE_PORT);
		this._client = null;
	});
    //Lancez un matchmaking Ici
    it("Lancement d'une partie", (done) => {
		this._ioserver.use((socket, next) => {
			return next();
		});

		this._client = ioclient.connect('http://localhost:${NODE_PORT}');
		/* si nous attendons le serveur et tuons le socket du serveur
		* le client essaiera de se reconnecter et ne sera pas tué par mocha
        */
		this._client.on('connect', () => {
            GLOBAL.matchmaking = new Matchmaking(GLOBAL);
            GLOBAL.network = new Network(this._ioserver, GLOBAL);
            let user = new User(userSchema1);
            user.socket = this._client;
            let lobby = new Lobby(user, GLOBAL);
            lobby.changeTargetUsersNb(2);
            lobby.searchGame();
            assert.equal(2, lobby.targetUsersNb);
			done();
		});
        done();
	});

    afterEach(() => {
		// this last call forces the client to stop connecting
		// even if tests failed
		this._client.close();
		this._ioserver.close();
		this._http.close();
	});
});
