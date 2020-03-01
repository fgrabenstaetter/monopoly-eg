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

mongoose.connect('mongodb://localhost:27017/monopolyeg', { useNewUrlParser: true, useUnifiedTopology: true });
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
    // pour test
    res.send(`<h1>Bonjour</h1>
              <b>IP:</b> ` + req.socket.remoteAddress + `<br />
              <b>Port:</b> ` + req.socket.remotePort + `<br />
              <a href="/tests">tests console</a>`
    );
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

function nicknameToUser (nickname) {
    for (const usr of GLOBAL.users) {
        if (usr.nickname === nickname)
            return usr;
    }
    return null;
}

///////////////////
// API ENDPOINTS //
///////////////////

app.use(expressJwt({ secret: JWT_SECRET }).unless({ path: ['/api/register', '/api/login', /\/test*/] }));

app.use( (err, req, res, next) => {
    if (err.name === 'UnauthorizedError')
        res.status(401).send('Invalid JWT token');
});

app.get('/api/tokentest', (req, res) => {
    res.json(req.user);
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
        let token = null;

        if (err.code === Errors.SUCCESS.code) {
            // si le user n'est pas déjà dans la liste, l'y ajouter
            let user = nicknameToUser(userSchema.nickname);
            if (!user) {
                user = new User(userSchema);
                GLOBAL.users.push(user);
            }

            token = jwt.sign({ id: userSchema._id, nickname: user.nickname, email: user.email }, JWT_SECRET, {
                expiresIn: 86400 // expires in 24 hours
            });
        } else
            res.status(400);

        res.json({ error: err.code, status: err.status, token: token });
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
    console.log('[SOCKET] Utilisateur ' + decodedToken.nickname + ' connecté');

    // ------------------------------------------------

    let user = nicknameToUser(decodedToken.nickname);
    if (!user) {
        console.log('[SOCKET] USER NOT FOUND (not connected), sending notLoggedRes');
        socket.emit('notLoggedRes');
        return;
    }

    socket.on('disconnect', () => {
        console.log('[SOCKET] Utilisateur ' + user.nickname + ' déconnecté');
        for (const lobby of GLOBAL.lobbies) {
            if (lobby.userByNickname(user.nickname)) {
                lobby.delUser(user, false);
                break;
            }
        }
    });

    user.socket = socket;

    // regarder si le joueur est dans une partie
    // nécessaire car pour passer du lobby au jeu, le client change de page .. et donc doit se reconnecter à un nouveau socket
    for (const game of GLOBAL.games) {
        const player = game.playerByNickname(user.nickname);
        if (player) {
            // le joueur est dans une partie !
            GLOBAL.network.gamePlayerListen(player, game);
            return; // ne pas créer de lobby car dans une partie
        }
    }

    //

    // <--- TEMPORAIRE ---> (lobby global => 1 seul lobby pour tout le monde)
    // Créer le lobby
    if (GLOBAL.lobbies.length === 0) {
        console.log('Création du lobby global par ' + user.nickname);
        GLOBAL.lobbies.push(new Lobby(user, GLOBAL));
    } else {
        // rejoindre le lobby
        if (GLOBAL.lobbies[0].users.length >= GLOBAL.lobbies[0].maxUsersNb) {
            console.log('(user ' + user.nickname + ') Lobby global PLEIN, aurevoir');
            return;
        } else {
            GLOBAL.lobbies[0].addUser(user);
            console.log(user.nickname + ' a rejoin le lobby global (' + GLOBAL.lobbies[0].users.length + '/' + GLOBAL.lobbies[0].maxUsersNb + ')');
        }
    }
});















////////////////
// TESTS ZONE //
////////////////

// pour les tests (dans ./tests/) uniquement
app.get('/tests', (req, res) => {
    res.sendFile(process.env.PWD + '/tests/index.html');
});


// Créer une demande d'ami de userA vers userB (userX = ObjetcId)
// ex : /test/process-friend-request/5e457cb3d7d620e3e2bc5d22/5e43073fbd410f9edcdae8f7
// et pour "accepter" -> inverser les deux IDs
app.get('/test/process-friend-request/:userA/:userB', (req, res) => {
    UserSchema.requestFriend(req.params.userA, req.params.userB, (err) => {
        console.log('err', err);
        console.log(req.params.userA + " requested ----> " + req.params.userB);
    });

    res.send('ok');
});

// Récupère les amis de user (user = ObjectId)
// ex : /test/get-friends/5e43073fbd410f9edcdae8f7
app.get('/test/get-friends/:user', (req, res) => {
    UserSchema.getFriends(req.params.user, (err, friendships) => {
        console.log('err', err);
        console.log('User ' + req.params.user + ' friends :');
        console.log(friendships);
    });

    res.send('ok');
});


app.get('/test/add-user-in-db/:username/:email', (req, res) => {
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

app.get('/test/get-users-from-db', (req, res) => {
    UserSchema.find((err, users) => {
        let html = '';
        for (let i = 0; i < users.length; i++) {
            html += '<b>' + users[i].nickname + '</b><br>' + users[i].email + '<br>' + users[i].password + '<br><hr>';
        }
        res.send(html);
    });
});

app.get('/test/delete-users-from-db', (req, res) => {
    UserSchema.deleteMany({}, (err, result) => {
        if (err)
            res.send('Une erreur est survenue :/');
        else
            res.send('Tous les utilisateurs ont bien été supprimés de la base de données !');
    });
});

const Cell = require('./game/cell');
app.get('/test/cell-test', (req, res) => {
    let cells = [
        new Cell(Constants.CELL_TYPE.PARC, null),
        new Cell(Constants.CELL_TYPE.PRISON, null),
        new Cell(-1, null),
        new Cell(Constants.CELL_TYPE.CHANCE_CARD, null)
    ];

    console.log(cells);

    res.send('Voir debug dans la console NodeJS // ' + cells[0].name);
});
