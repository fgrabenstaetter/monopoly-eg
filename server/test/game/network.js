const mocket = require("mocket-io");
const assert = require('assert');

const server = new mocket.Server();
const client = new mocket.Client(server);

let clientSocket, serverSocket;

    after( () => {
        process.exit(0);
    });

    beforeEach( (done) => {
        GLOBAL.users = [];
        GLOBAL.lobbies = [];
        GLOBAL.games = [];

        clientSocket = ioClient.connect('http://localhost:' + port);
        clientSocket.on('YES', () => {
            done();
        });
    });
    afterEach( (done) => {
        serverSocket.disconnect();
        clientSocket.close();
        done();
    });
        clientSocket.emit('message', 'Hello World!');
    });
});
