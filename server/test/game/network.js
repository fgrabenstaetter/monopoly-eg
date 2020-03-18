const mocket = require("mocket-io");
const assert = require('assert');

const server = new mocket.Server();
const client = new mocket.Client(server);

let clientSocket, serverSocket;

server.once("connection", function (socket) {
    serverSocket = socket;
});

clientSocket = client.connect();

describe('Fast and isolated socket tests', function() {
    //Exemple de test socket => Adapter avec network, appels de méthodes!
    it('Les sockets devraient communiquer sans server', function(done) {
        serverSocket.on('message', function (message) {
        console.log(message);
        assert.equal('Hello World!', message);
        done();
    });
        clientSocket.emit('message', 'Hello World!');
    });
});
