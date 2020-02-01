function findArg (num) { // num >= 1, ne compte pas les args de base
    if (process.argc < num + 1)
        return null;
    return process.argv[num + 1];
}

const app = require('express')();
const http = require('http');
const https = require('https');
const fs = require('fs');

const db = new (require('./utils/db.js'))();
const users = new (require('./utils/users.js'))();
const Party = require('./game/party.js');
const Player = require('./game/player.js');
// users = clients connectés (par pseudo + mdp)
// stocker l'IP et le port sert à connaître si un client est connecté ou non (utile surtout pour la connexion au socket)

let production = false;
let server;

const arg1 = findArg(1);
if (arg1 != null) {
    if (arg1 === 'production')
        production = true;
    else {
        console.error('Argument incorrect: ' + arg1);
        process.exit(1);
    }
}

if (production) {
    // mode production
    const securePort = 443;
    const redirectionPort = 80;
    console.log('Démarrage en mode [ PRODUCTION ]');

    // SSL Let's Encrypt certificats
    const constants = require('crypto');
    const options = {
        cert: fs.readFileSync('./ssl/fullchain.pem'),
        key: fs.readFileSync('./ssl/privkey.pem'),
        secureOptions: constants.SSL_OP_NO_TLSv1
    };

    server = https.createServer(options, app).listen(securePort);

    // Redirection du port 'redirectionPort' vers le port 'securePort'
    http.createServer( (req, res) => {
        res.writeHead(301, { "Location": "https://" + req.headers['host'] + req.url });
        res.end();
    }).listen(redirectionPort);

} else {
    // mode développement
    const port = 8080;
    console.log('Démarrage en mode [ DÉVELOPPEMENT ]');

    server = http.createServer(app).listen(port);
}

const io = require('socket.io')(server);

app.get('/', (req, res) => {
    res.send(`<h1>Bonjour</h1>
              <b>IP:</b> ` + req.socket.remoteAddress + `<br />
              <b>Port:</b> ` + req.socket.remotePort + `
              <a href="/tests">tests console</a>`
    );
});

// routage
app.post('/login', (req, res) => {
    if (req.body == null) {
        res.send(false);
        return;
    }

//     db.login(req.body.pseudo, req.body.password, (success) => {
//         if (success) {
//             res.send(true);
//             // vérifier que le client n'est pas déjà connecté
//             users.add(req.body.pseudo);
//         } else
//             res.send(false);
//     });
});

app.post('/register', (req, res) => {
    if (req.body == null) {
        res.send(false);
        return;
    }

    // db.register(req.body.pseudo, req.body.password, (success) => {
    //     if (success)
    //         res.send(true);
    //     else
    //         res.send(false);
    // });
});

// tableau des données de jeu principales
let waitingPlayers = []; // joueurs en attente de partie
let parties = []; // toutes les parties en cours
const partyMinPlayersNb = 2;

// socket.io connections
io.on('connection', (socket) => {
    // si le client n'est pas connecté, refuser la connexion au socket
    // demande de connexion au socket = demande de rejoindre une partie
    // PROBLÈME: faire le lien entre le client connecté (pseudo + mdp) avec ce socket (voir sessions express.js)

    console.log('Connexion socket ACCEPTÉE');
    socket.emit('connectionRes', true);

    waitingPlayers.push(new Player('pseudoTest', socket));
    // si nb de joueurs en attente > nb minimum pour une partie, démarrer une nouvelle partie
    if (waitingPlayers.length === partyMinPlayersNb) {
        // démarrer la partie
        parties.push(new Party(waitingPlayers, io));
        // retirer tous les jours de la file d'attente
        waitingPlayers = [];
    }
    // sinon attendre qu'un nouveau joueur "enclanche" le démarrage de partie
});

// pour les tests (dans ./tests/) uniquement
app.get('/tests', (req, res) => {
    res.sendFile(process.env.PWD + '/tests/index.html');
});
