const User = require('../../game/user');
const Lobby = require('../../game/lobby');
const Matchmaking = require('../../game/matchmaking');
const Game = require('../../game/game');
const Network = require('../../game/network');
const app = require('express')();
const http = require('http');
const express = require('express');
const assert = require('assert');

const port = 5000;

// autorisation de toutes les requêtes externes
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

let server = http.createServer(app).listen(port);
const io = require('socket.io')(server, {origins:'localhost:* http://localhost:*'});

let GLOBAL = {
    users: [], // Utilisateurs actuellement connectés (hors jeu ou en jeu)
    lobbies: [], // Lobbies actuellement créés
    games: [], // Parties de jeu actuellement en cours
}

GLOBAL.matchmaking = new Matchmaking(GLOBAL);
GLOBAL.network = new Network(io, GLOBAL);

describe("Test sur la classe Lobby + Matchmaking", function() {
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
    const user1 = new User(userSchema1);
    const user2 = new User(userSchema2);
    const user3 = new User(userSchema3);
    const user4 = new User(userSchema4);
    /*const lobby = new Lobby(user1, GLOBAL);

    it("Le lobby vient d'être créé, il y a donc un seul joueur (François) qui en est l'hôte", function() {
        assert.equal(1, lobby.users.length);
        assert.equal(1, lobby.pawns.length);
        //On essaye de rajouter le mm user, cela ne devrait pas fonctionner
        lobby.addUser(user1);
        assert.equal(1, lobby.users.length);
        assert.equal(1, lobby.pawns.length);
        assert.equal("François", lobby.users[0].nickname);
    });

    it("On rajoute un second joueur au lobby de François", function() {
        lobby.addUser(user2);
        assert.equal(2, lobby.users.length);
        assert.equal(2, lobby.pawns.length);
    });

    it("Le premier joueur dans le tableau est l'hôte du lobby", function() {
        assert.equal(true, lobby.isHost(user1));
        //On supprime le premier user1 puis on le rajoute, user2 devrait être le nouvel hôte
        lobby.delUser(user1);
        lobby.addUser(user1);
        assert.equal(true, lobby.isHost(user2));
        assert.equal(false, lobby.isHost(user1));
    });

    it("Est ce que Florian se trouve dans le lobby ?", function() {
        assert.equal(null, lobby.userByNickname("Florian"));
        lobby.addUser(user3);
        assert.equal(user3, lobby.userByNickname("Florian"));
    });

    it("Le nombre de joueurs de la partie à chercher doit être entre 2 et 8", function() {
        lobby.changeTargetUsersNb(4);
        assert.equal(4, lobby.targetUsersNb);
        lobby.changeTargetUsersNb(10);
        assert.equal(8, lobby.targetUsersNb);
        lobby.changeTargetUsersNb(7);
        assert.equal(7, lobby.targetUsersNb);
        lobby.changeTargetUsersNb(0);
        assert.equal(2, lobby.targetUsersNb);
    });

    it("Le lobby est fermé, il n'est plus possible de rajouter d'autres joueurs", function() {
        //La recherche de partie est lancée
        lobby.searchGame();
        lobby.addUser(user4);
        assert.equal(3, lobby.users.length);
        assert.equal(3, lobby.pawns.length);
        assert.equal(null, lobby.userByNickname("Matthias"));
    });

    it("Suppression du lobby", function() {
        //BUG A CORRIGER => Potentiellement dans delUser
        lobby.delete();
        assert.equal(0, lobby.users.length);
        assert.equal(0, lobby.pawns.length);
    });*/
});
