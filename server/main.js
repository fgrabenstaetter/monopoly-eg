function foundArg (arg) {
    return process.argv.indexOf(arg) != -1;
}

const app = require('express')();
const http = require('http');
const https = require('https');
const fs = require('fs');
const session = require('express-session');
const MemoryStore = require('memorystore')(session)
const cookie = require('cookie');
const cookieSignature = require('cookie-signature');

const db = new (require('./utils/db.js'))();
const Party = require('./game/party.js');
const Player = require('./game/player.js');

let server;
let production = false;
if (foundArg('production'))
    production = true;

let sessionConfig = {
    store: new MemoryStore({ checkPeriod: 3600000 }), // 1h
    secret: 'iA"8I3&p', // secret (random) pour signer le cookie de session ID (sécurité)
    unset: 'destroy', // efface l'instance de session lors de instance = null
    resave: false,
    saveUninitialized: true, // garder la même instance de session durant toute sa durée
    cookie: {
        maxAge: 21600000, // 6h
        httpOnly: true, // rendre inaccessible le cookie de session ID au côté client (sécurité)
        secure: false // default pour mode dev, mis à true pour mode prod
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

    sessionConfig.cookie.secure = true; // empêche les cookies de circuler hors HTTPS
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

app.use(session(sessionConfig));
const io = require('socket.io')(server);

app.get('/', (req, res) => {
    // pour test
    res.send(`<h1>Bonjour</h1>
              <b>IP:</b> ` + req.socket.remoteAddress + `<br />
              <b>Port:</b> ` + req.socket.remotePort + `<br />
              <b>express session ID:</b> ` + req.sessionID + `<br />
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
    //         req.session.pseudo = req.body.pseudo; // sauvegarder le pseudo en session (si session.pseudo != null => le client est connecté (pseudo + mdp)
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

    // petit trick pour récuperer la session express depuis le cookie connect.sid
    const cookieVal = cookie.parse(socket.handshake.headers.cookie)['connect.sid'];
    const unsignedSessionID = cookieSignature.unsign(cookieVal.replace('s:', ''), sessionConfig.secret);
    console.log('Socket.io connection (express session ID = ' + unsignedSessionID);

    let session = null;
    sessionConfig.store.get(unsignedSessionID, (err, expressSession) => {
        if (err != null || expressSession == null) {
            socket.emit('connectionRes', false);
            return;
        }
        session = expressSession;
    });

    if (session == null || session.pseudo == null) {
        socket.emit('connectionRes', false);
        return;
    }

    // le client est bien connecté (pseudo + mdp)
    socket.emit('connectionRes', true);
    waitingPlayers.push(new Player(session.pseudo, socket));

    // si nb de joueurs en attente > nb minimum pour une partie, démarrer une nouvelle partie
    if (waitingPlayers.length === partyMinPlayersNb) {
        parties.push(new Party(waitingPlayers, io));
        waitingPlayers = []; // retirer tous les jours de la file d'attente
    }
    // sinon attendre qu'un nouveau joueur "enclanche" le démarrage de partie
});

// pour les tests (dans ./tests/) uniquement
app.get('/tests', (req, res) => {
    res.sendFile(process.env.PWD + '/tests/index.html');
});
