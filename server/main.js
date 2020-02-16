function foundArg (arg) {
    return process.argv.indexOf(arg) != -1;
}

const app = require('express')();
const http = require('http');
const https = require('https');
const fs = require('fs');
const express = require('express');
const session = require('express-session');
const MemoryStore = require('memorystore')(session);
const cookie = require('cookie');
const cookieSignature = require('cookie-signature');
const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/monopolyeg', { useNewUrlParser: true, useUnifiedTopology: true });

const Constants = require('./lib/constants');
const Errors = require('./lib/errors');
const { UserSchema, UserManager } = require('./models/user');

const User = require('./game/user');
const Lobby = require('./game/lobby');
const Matchmaking = require('./game/matchmaking');
const Network = require('./game/network');

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

////////////////////////////////////////////
// CONFIG MODE PRODUCTION / DEVELOPPEMENT //
////////////////////////////////////////////

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
    const port = 3000;

    // autorisation de toutes les requêtes externes
    app.use(function(req, res, next) {
        res.header("Access-Control-Allow-Origin", "*");
        res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
        next();
    });

    console.log('Démarrage en mode [ DÉVELOPPEMENT ]');
    server = http.createServer(app).listen(port);
}

app.use(session(sessionConfig));
const io = require('socket.io')(server);

// Parse le contenu "URL-encoded" (i.e. formulaires HTML)
app.use(express.urlencoded({ extended: true }));
// Parse le contenu JSON (i.e. clients de l'API)
app.use(express.json());

app.get('/', (req, res) => {
    // pour test
    res.send(`<h1>Bonjour</h1>
              <b>IP:</b> ` + req.socket.remoteAddress + `<br />
              <b>Port:</b> ` + req.socket.remotePort + `<br />
              <b>express session ID:</b> ` + req.sessionID + `<br />
              <a href="/tests">tests console</a>`
    );
});

///////////////////
// API ENDPOINTS //
///////////////////

app.post('/api/register', (req, res) => {
    UserManager.register(req.body.nickname, req.body.email, req.body.password, (err) => {
        if (err.code !== Errors.SUCCESS.code)
            res.status(400);
        res.json({ error: err.code, status: err.status });
    });
});

app.post('/api/login', (req, res) => {
    UserManager.login(req.body.nickname, req.body.password, (err, userSchema) => {
        if (err.code === Errors.SUCCESS.code)
            req.session.user = new User(userSchema);
        else
            res.status(400);
        res.json({ error: err.code, status: err.status });
    });
});

//////////////////////
// VARIABLES DE JEU //
//////////////////////

let GLOBAL = {
    users: [], // Utilisateurs actuellement connectés (hors jeu ou en jeu)
    lobbies: [], // Lobbies actuellement créés
    games: [], // Parties de jeu actuellement en cours
}

GLOBAL.matchmaking = new Matchmaking(GLOBAL.lobbies, GLOBAL.games);
GLOBAL.network = new Network(io, GLOBAL.users, GLOBAL.lobbies, GLOBAL.games, GLOBAL.matchmaking);

///////////////////////
// CONNECTION SOCKET //
///////////////////////

// socket.io connections
io.on('connection', (socket) => {
    // si le client n'est pas connecté, refuser la connexion au socket
    // demande de connexion au socket = création de lobby pour le user

    // petit trick pour récuperer la session express depuis le cookie connect.sid
    const cookieVal = cookie.parse(socket.handshake.headers.cookie)['connect.sid'];
    const unsignedSessionID = cookieSignature.unsign(cookieVal.replace('s:', ''), sessionConfig.secret);

    let session = null;
    sessionConfig.store.get(unsignedSessionID, (err, expressSession) => {
        if (err || !expressSession) {
            console.log('[IO CONNEXION] ÉCHEC. Impossible de récuperer une session correspondant au socket');
            return;
        }
        session = expressSession;
    });

    if (!session || !session.user) {
        console.log('[IO CONNEXION] ÉCHEC. La session est trouvée, mais le le client correspondant au socket n\'est pas connecté (/ap/login)');
        return;
    }

    console.log('[IO CONNEXION] SUCCÈS. { session ID: ' + unsignedSessionID + ', user nickname: ' + session.user.nickname + ' }');

    session.user.socket = socket;
    // Création du lobby avec cet utilisateur ====> interactions via SOCKET à partir de maintenant
    new Lobby(GLOBAL.lobbies, GLOBAL.network, session.user, GLOBAL.matchmaking);
});













////////////////
// TESTS ZONE //
////////////////

// pour les tests (dans ./tests/) uniquement
app.get('/tests', (req, res) => {
    res.sendFile(process.env.PWD + '/tests/index.html');
});


app.get('/add-user-in-db/:username/:email', (req, res) => {
    let newUserSchema = new UserSchema({
        nickname: req.params.username,
        email: req.params.email,
        password: '$[hash]'
    });

    newUserSchema.save((err, result) => {
        if (err)
            res.send('Une erreur est survenue :/');
        else
            res.send('Utilisateur ajouté dans la base de données !');
    });
});

app.get('/get-users-from-db', (req, res) => {
    UserSchema.find((err, users) => {
        let html = '';
        for (let i = 0; i < users.length; i++) {
            html += '<b>' + users[i].nickname + '</b><br>' + users[i].email + '<br>' + users[i].password + '<br><hr>';
        }
        res.send(html);
    });
});

app.get('/delete-users-from-db', (req, res) => {
    UserSchema.deleteMany({}, (err, result) => {
        if (err)
            res.send('Une erreur est survenue :/');
        else
            res.send('Tous les utilisateurs ont bien été supprimés de la base de données !');
    });
});

const Cell = require('./game/cell');
app.get('/cell-test', (req, res) => {
    let cells = [
        new Cell(Constants.CELL_TYPE.PARC, null),
        new Cell(Constants.CELL_TYPE.PRISON, null),
        new Cell(-1, null),
        new Cell(Constants.CELL_TYPE.CHANCE_CARD, null)
    ];

    console.log(cells);

    res.send('Voir debug dans la console NodeJS // ' + cells[0].name);
});
