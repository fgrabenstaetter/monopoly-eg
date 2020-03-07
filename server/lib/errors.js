module.exports = Object.freeze({
    // GLOBAL ERRORS
    SUCCESS: {
        code: 0,
        status: 'Succès'
    },
    INTERNAL_ERROR: {
        code: 1000,
        status: 'Erreur interne'
    },
    MISSING_FIELD: {
        code: 1001,
        status: 'Champ manquant'
    },
    UNKNOW: {
        code: 1002,
        status: 'Inconnu'
    },

    // LOGIN ERRORS
    LOGIN: {
        INVALID_CREDENTIALS: {
            code: 1,
            status: 'Identifiants incorrects'
        }
    },

    // REGISTER ERRORS
    REGISTER: {
        EMAIL_TAKEN: {
            code: 1,
            status: 'Adresse email déjà utilisée'
        },
        NICKNAME_TAKEN: {
            code: 2,
            status: 'Pseudo déjà utilisé'
        },
        ERR_EMAIL_FORMAT: {
            code: 3,
            status: 'Adresse email invalide'
        },
        ERR_NICKNAME_LEN: {
            code: 4,
            status: 'Pseudo trop court'
        },
        ERR_PASSWORD_LEN: {
            code: 5,
            status: 'Mot de passe trop court'
        },
    },

    // FRIENDS
    FRIENDS: {
        NOT_CONNECTED: {
            code: 1,
            status: 'Friend is not connected'
        },
        IN_GAME: {
            code: 2,
            status: 'Friend is already in game'
        },
        NOT_EXISTS: {
            code: 3,
            status: 'Friend don\'t exists'
        }
    },

    // LOBBY
    LOBBY: {
        FULL: {
            code: 1,
            status: 'Lobby plein'
        },
        NOT_IN_LOBBY: {
            code: 2,
            status: 'Vous n\'êtes pas dans un lobby'
        },
        INVITATION_NOT_EXISTS: {
            code: 3,
            status: 'L\'invitation n\'existe pas'
        },
        CLOSED: {
            code: 4,
            status: 'Lobby fermé'
        },
        NOT_FULL: {
            code: 5,
            status: 'Lobby non plein'
        },
        PAWN_ALREADY_USED: {
            code: 6,
            status: 'Pion déjà utilisé'
        }
    },

    // GAME
    GAME: {
        NOT_MY_TURN: {
            code: 1,
            status: 'Ce n\'est pas votre tour de jeu'
        },
        NOT_STARTED: {
            code: 2,
            status: 'La partie n\'a pas encore démarrée'
        }
    },
});
