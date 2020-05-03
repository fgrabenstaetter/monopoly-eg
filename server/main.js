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
const nodemailer  = require('nodemailer');

const Constants   = require('./lib/constants');
const Errors      = require('./lib/errors');
const User        = require('./game/user');
const Matchmaking = require('./game/matchmaking');
const Network     = require('./game/network');
const { UserSchema, UserManager } = require('./models/user');

let server;
const production = foundArg('production');

mongoose.connect('mongodb://localhost:27017/monopolyeg', { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false });
const JWT_SECRET = 'J@-(icrwUsD*IH5';

////////////////////////////////////////////
// CONFIG MODE PRODUCTION / DEVELOPPEMENT //
////////////////////////////////////////////

if (production) {
    // mode production
    const port = 8087;

    // autorisation de toutes les requ  tes externes
    app.use( (req, res, next) => {
        // Website you wish to allow to connect
        res.setHeader('Access-Control-Allow-Origin', '*');

        // Request methods you wish to allow
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

        // Request headers you wish to allow
        res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

        // Set to true if you need the website to include cookies in the requests sent
        // to the API (e.g. in case you use sessions)
        res.setHeader('Access-Control-Allow-Credentials', true);
        next();
    });

    console.log('Demarrage en mode PRODUCTION');
    server = http.createServer(app).listen(port);

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

// Configuration EMAILING
const emailTransporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    requireTLS: true,
    auth: {
        user: 'projet.monopolyeg@gmail.com',
        pass: '2wSkel}l|hGwAtU'
    }
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
        if (err.code === Errors.SUCCESS.code) {
            const mailOptions = {
                from: 'Monopoly EG <projet.monopolyeg@gmail.com>',
                to: req.body.email,
                subject: 'Bienvenue sur Monopoly EG !',
                text: `Bonjour ${req.body.nickname},\n\nBienvenue sur Monopoly EG !\n\nTu peux jouer dès à présent en te connectant sur https://eg.singlequote.net.\nPour encore plus de performances \& fluidité, tu peux également télécharger notre jeu sur ton ordinateur (Windows, MacOS ou Linux) !\n\nA bientôt,\n\nL'équipe Monopoly EG`,
                html: `Bonjour ${req.body.nickname},<br><br>Bienvenue sur Monopoly EG !<br><br>Tu peux jouer dès à présent en te connectant sur https://eg.singlequote.net.<br>Pour encore plus de performances \& fluidité, tu peux également télécharger notre jeu sur ton ordinateur (Windows, MacOS ou Linux) !<br><br>A bientôt,<br><br>L'équipe Monopoly EG`
            };
                
            emailTransporter.sendMail(mailOptions, function(error, info){
                if (error)
                    console.log(error);
                else
                    console.log('Email inscription envoyé : ' + info.response);

                res.json({ error: err.code, status: err.status });
            });
        } else {
            res.status(400);
            res.json({ error: err.code, status: err.status });
        }
    });
});

app.post('/api/login', (req, res) => {
    UserManager.login(req.body.nickname, req.body.password, (err, userSchema) => {
        let token = null, id = null, avatar = "";

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

            // Ajouter l'avatar dans la réponse
            avatar = userSchema.getAvatar();
        } else
            res.status(400);

        res.json({
            error  : err.code,
            status : err.status,
            token  : token,
            user: userSchema,
            avatar: avatar
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
io.origins('*:*');

io.on('connection', (socket) => {
    const decodedToken = socket.decoded_token;
    const user = getConnectedUserById(decodedToken.id);

    if (!user) {
        console.log('[SOCKET] Utilisateur du socket ' + socket.id + ' non trouvé');
        socket.emit('notLoggedRes');
        return;
    }

    GLOBAL.network.handleConnection(user, socket);
});
