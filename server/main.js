function foundArg (arg) {
    return process.argv.indexOf(arg) != -1;
}

const app         = require('express')();
const http        = require('http');
const https       = require('https');
const fs          = require('fs');
const express     = require('express');
const jwt         = require('jsonwebtoken');
const expressJwt  = require('express-jwt');
const socketioJwt = require('socketio-jwt');
const mongoose    = require('mongoose');

const Constants   = require('./lib/constants');
const Errors      = require('./lib/errors');
const User        = require('./game/user');
const Lobby       = require('./game/lobby');
const Matchmaking = require('./game/matchmaking');
const Network     = require('./game/network');
const { UserSchema, UserManager } = require('./models/user');

let server;
let production = false;
if (foundArg('production'))
    production = true;

mongoose.connect('mongodb://localhost:27017/monopolyeg', { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false });
const JWT_SECRET = 'J@-(icrwUsD*IH5';

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
        cert          : fs.readFileSync('./ssl/fullchain.pem'),
        key           : fs.readFileSync('./ssl/privkey.pem'),
        secureOptions : constants.SSL_OP_NO_TLSv1
    };

    server = https.createServer(options, app).listen(securePort);

    // Redirection du port 'redirectionPort' vers le port 'securePort'
    http.createServer( (req, res) => {
        res.writeHead(301, { 'Location': 'https://' + req.headers['host'] + req.url });
        res.end();
    }).listen(redirectionPort);

} else {
    // mode développement
    const port = 3000;

    // autorisation de toutes les requêtes externes
    app.use( (req, res, next) => {
        res.header('Access-Control-Allow-Origin', '*');
        res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
        next();
    });

    console.log('Démarrage en mode [ DÉVELOPPEMENT ]');
    server = http.createServer(app).listen(port);
}

const io = require('socket.io')(server, {origins:'localhost:* http://localhost:*'});

// Parse le contenu "URL-encoded" (i.e. formulaires HTML)
app.use(express.urlencoded({ extended: true }));
// Parse le contenu JSON (i.e. clients de l'API)
app.use(express.json());

app.get('/', (req, res) => {
    res.send('<h1>Bonjour</h1>');
});

//////////////////////
// VARIABLES DE JEU //
//////////////////////

let GLOBAL = {
    users   : [], // Utilisateurs actuellement connectés (hors jeu ou en jeu)
    lobbies : [], // Lobbies actuellement créés
    games   : [], // Parties de jeu actuellement en cours
}

GLOBAL.matchmaking = new Matchmaking(GLOBAL);
GLOBAL.network     = new Network(io, GLOBAL);

function getConnectedUserById (id) {
    for (const usr of GLOBAL.users) {
        if (usr.id === id)
            return usr;
    }
    return null;
}

///////////////////
// API ENDPOINTS //
///////////////////

app.use(expressJwt({ secret: JWT_SECRET }).unless({ path: ['/api/register', '/api/login', /\/avatars\/*/, /\/test*/] }));
app.use(express.static(__dirname + "/public"));

app.use( (err, req, res, next) => {
    if (err.name === 'UnauthorizedError')
        res.status(401).send('Invalid JWT token');
});

app.post('/api/register', (req, res) => {
    UserManager.register(req.body.nickname, req.body.email, req.body.password, (err) => {
        if (err.code !== Errors.SUCCESS.code)
            res.status(400);
        res.json({ error: err.code, status: err.status });
    });
});

app.post('/api/login', (req, res) => {
    UserManager.login(req.body.nickname, req.body.password, (err, userSchema) => {
        let token = null, id = null;

        if (err.code === Errors.SUCCESS.code) {
            // si le user n'est pas déjà dans la liste, l'y ajouter
            let user = getConnectedUserById(userSchema._id);
            if (!user) {
                user = new User(userSchema);
                GLOBAL.users.push(user);
            }

            id = userSchema.id;
            token = jwt.sign({ id: userSchema._id }, JWT_SECRET, {
                expiresIn: 86400 // expires in 24 hours
            });
        } else
            res.status(400);

        res.json({
            error  : err.code,
            status : err.status,
            token  : token,
            user: userSchema
        });
    });
});

//////////////////////
// CONNEXION SOCKET //
//////////////////////

io.use(socketioJwt.authorize({
    secret: JWT_SECRET,
    handshake: true
}));

io.on('connection', (socket) => {
    const decodedToken = socket.decoded_token;

    let user = getConnectedUserById(decodedToken.id);
    if (!user) {
        console.log('[SOCKET] USER NOT FOUND (not connected), sending notLoggedRes');
        socket.emit('notLoggedRes');
        return;
    }

    console.log('[SOCKET] Utilisateur ' + user.id + ' (' + user.nickname + ') connecté');

    socket.on('disconnect', () => {
        console.log('[SOCKET] Utilisateur ' + user.nickname + ' déconnecté');

        // si il est dans un lobby, l'y supprimer
        for (const lobby of GLOBAL.lobbies) {
            if (lobby.userByID(user.id)) {
                lobby.delUser(user); // il ne sera supprimé que si il n'a pas été invité
                return;
            }
        }

        // si il est dans une partie de jeu, l'y déconnecter (PAS SUPPRIMER POUR RECONNEXION)
        for (const game of GLOBAL.games) {
            const player = game.playerByID(user.id);
            if (player) {
                GLOBAL.network.gamePlayerDisconnected(player, game);
                return;
            }
        }
    });

    user.socket = socket;

    // regarder si le joueur est dans une partie
    for (const game of GLOBAL.games) {
        const player = game.playerByID(user.id);
        if (player) {
            // le joueur est dans une partie !
            if (!player.connected) // RECONNEXION
                GLOBAL.network.gamePlayerReconnected(player, game);
            else // ARRIVÉE DANS LE JEU DEPUIS LOBBY
                GLOBAL.network.gamePlayerListen(player, game);
            socket.emit('canReconnectToGame');
            return;
        }
    }

    // regarder si le joueur est déjà dans un lobby  === a été invité
    for (const lobby of GLOBAL.lobbies) {
        const usr = lobby.userByID(user.id);
        if (usr) {
            const ind = lobby.invitedUsers.indexOf(usr);
            if (ind !== -1)
                lobby.invitedUsers.splice(ind, 1);
            GLOBAL.network.lobbyUserListen(usr, lobby);
            return;
        }
    }

    // Mettre le user dans un nouveau Lobby
    GLOBAL.lobbies.push(new Lobby(user, GLOBAL));
});
