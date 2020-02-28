const ioClient = require("socket.io-client");
const io = require("socket.io");
const chai = require("chai");
const Network = require("../../game/network");
const User = require('../../game/user');

describe("Test sur la classe Network + Sockets", function() {
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

    const user1 = new User(userSchema1);
    user1.socket = io;
    const user2 = new User(userSchema2);
    const network = new Network(io, [user1, user2], [{}], [{}]);
    /*it("Doit renvoyer l'ID de l'invit + le pseudo de l'ami", function() {
        network.lobbyInvitationReq(user1, network.lobbies[0]);
    });*/
});
