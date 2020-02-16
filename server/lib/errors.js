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

    // NETWORK
    NETWORK: {
        FRIEND_NOT_CONNECTED: {
            code: 1,
            status: 'Friend is not connected'
        },
        FRIEND_IN_GAME: {
            code: 2,
            status: 'Friend is already in game'
        },
        FRIEND_NOT_EXISTS: {
            code: 3,
            status: 'Friend don\'t exists'
        },
        LOBBY_FULL: {
            code: 4,
            status: 'Lobby plein'
        },
        NOT_IN_LOBBY: {
            code: 5,
            status: 'Vous n\'êtes pas dans un lobby'
        },
        INVITATION_NOT_EXISTS: {
            code: 6,
            status: 'L\'invitation n\'existe pas'
        },
        LOBBY_CLOSED: {
            code: 7,
            status: 'Lobby fermé'
        },
        LOBBY_NOT_FULL: {
            code: 8,
            status: 'Lobby non plein'
        },
        PAWN_ALREADY_USED: {
            code: 9,
            status: 'Pion déjà utilisé'
        }
    },
});
