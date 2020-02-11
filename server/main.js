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
const { check, validationResult } = require('express-validator');
const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/monopolyeg', { useNewUrlParser: true, useUnifiedTopology: true });

const Constants = require('./lib/constants');
const User = require('./models/user');
const Cell = require('./models/cell');

// const db = new (require('./utils/db.js'))();
// const Party = require('./game/party.js');
// const Player = require('./game/player.js');

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
app.post('/register', [
    check('nickname', 'Pseudo invalide').isLength({min: 2}),
    check('email', 'Email invalide').isEmail(),
    check('password', 'Mot de passe invalide (4 caractères minimum)').isLength({min: 4})
], (req, res) => {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const extractedErrors = []
        errors.array().map(err => extractedErrors.push({ [err.param]: err.msg }))
        
        return res.status(422).json({ success: false, msg: 'Erreur de validation', data: extractedErrors });
    }

    User.findOne({ email: req.body.email }, (err, user) => {
        if (err)
            return res.status(424).json({ success: false, msg: 'Erreur MongoDB', data: err });

        if (user)
            return res.status(409).json({ success: false, msg: 'Email déjà utilisé', data: [] });

        User.findOne({ nickname: req.body.nickname }, (err, user) => {
            if (err)
                return res.status(424).json({ success: false, msg: 'Erreur MongoDB', data: err });
    
            if (user)
                return res.status(409).json({ success: false, msg: 'Pseudo déjà utilisé', data: [] });

            let newUser = User();
            newUser.nickname = req.body.nickname;
            newUser.email = req.body.email;
            newUser.password = newUser.encryptPassword(req.body.password);

            newUser.save((err) => {
                if (err)
                    return res.status(424).json({ success: false, msg: 'Erreur MongoDB', data: err });
                
                return res.status(200).json({ success: true, msg: 'Utilisateur créé', data: newUser});
            });
        });
    });
});

app.post('/login', (req, res) => {
    if (req.body == null) {
        res.send(false);
        return;
    }
});
///////////////////////
// FIN API ENDPOINTS //
///////////////////////

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


////////////////
// TESTS ZONE //
////////////////

// pour les tests (dans ./tests/) uniquement
app.get('/tests', (req, res) => {
    res.sendFile(process.env.PWD + '/tests/index.html');
});


app.get('/add-user-in-db/:username/:email', (req, res) => {
    let newUser = new User({
        nickname: req.params.username,
        email: req.params.email,
        password: '$[hash]'
    });

    newUser.save((err, result) => {
        if (err)
            res.send('Une erreur est survenue :/');
        else
            res.send('Utilisateur ajouté dans la base de données !');
    });
});

app.get('/get-users-from-db', (req, res) => {
    User.find((err, users) => {
        let html = '';
        for (let i = 0; i < users.length; i++) {
            html += '<b>' + users[i].nickname + '</b><br>' + users[i].email + '<br>' + users[i].password + '<br><hr>';
        }
        res.send(html);
    });
});

app.get('/delete-users-from-db', (req, res) => {
    User.remove({}, (err, result) => {
        if (err)
            res.send('Une erreur est survenue :/');
        else
            res.send('Tous les utilisateurs ont bien été supprimés de la base de données !');
    });
});

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