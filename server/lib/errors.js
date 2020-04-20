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

    //BID ERRORS
    BID: {
        ENDED: {
            code: 1,
            status: 'Enchère terminée'
        },
        DIFF_LOWER_THAN_MIN: {
            code: 2,
            status: 'Votre enchère n\'est pas assez élevée'
        },
        NOT_ENOUGH_MONEY: {
            code: 3,
            status: 'Vous n\'avez pas assez d\'argent pour surenchérir'
        },
        ONE_MANUAL_MAX: {
            code: 4,
            status: 'Une enchère manuelle est déjà en cours'
        }
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

    // UPDATE PROFILE
    UPDATE_PROFILE: {
      NOT_EXISTS: {
          code: 1,
          status: 'Compte utilisateur non trouvé'
      },
      AVATAR_TOO_BIG: {
          code: 2,
          status: 'Votre avatar est trop grand (taille max 1Mo)'
      },
      AVATAR_WRONG_TYPE: {
          code: 3,
          status: 'Votre avatar doit être au format JPG'
      },
      AVATAR_UNKNOWN: {
          code: 4,
          status: 'Error lors de la mise à jour de votre avatar'
      }
    },

    // FRIENDS
    FRIENDS: {
        NOT_CONNECTED: {
            code: 1,
            status: 'Ami non connecté'
        },
        IN_GAME: {
            code: 2,
            status: 'Ami en jeu'
        },
        NOT_EXISTS: {
            code: 3,
            status: 'Cet utilisateur n\'existe pas'
        },
        REQUEST_ERROR: {
            code: 4,
            status: 'Erreur lors de l\'envoi de la requête d\'ami'
        },
        INVITATION_ACTION_PROCESS_ERROR: {
            code: 5,
            status: 'Erreur action traitement de la requête d\'ami'
        },
        CANT_INVITE_YOURSELF: {
            code: 6,
            status: 'Vous ne pouvez pas vous inviter vous-même en ami'
        },
        ALREADY_INVITED: {
            code: 7,
            status: 'Vous avez déjà demandé cette personne en ami (en attente de sa réponse)'
        },
        ALREADY_INVITED_BY_THIS_MEMBER: {
            code: 8,
            status: 'Vous avez déjà été demandé en ami par cette personne (acceptez sa demande !)'
        },
        ALREADY_FRIENDS: {
            code: 9,
            status: 'Vous êtes déjà ami avec cette personne'
        },
        ALREADY_SAME_LOBBY: {
            code: 10,
            status: 'Votre ami est déjà dans ce lobby'
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
        PAWN_ALREADY_USED: {
            code: 5,
            status: 'Pion déjà utilisé'
        },
        WRONG_DURATION: {
            code: 6,
            status: 'Valeur de durée de partie incorrecte'
        }
    },

    // GAME
    GAME: {
        NOT_MY_TURN: {
            code: 1,
            status: 'Ce n\'est plus à votre tour de jouer'
        },
        NOT_STARTED: {
            code: 2,
            status: 'La partie n\'a pas encore démarrée'
        },
        NOT_ENOUGH_FOR_MORTGAGE: {
            code: 3,
            status: 'Le montant total n\'est pas suffisant pour payer le loyer'
        },
        NOT_ENOUGH_FOR_OFFER: {
            code: 4,
            status: 'Vous n\'avez pas assez d\'argent pour accepter cette offre'
        },
        NOT_ENOUGH_FOR_UNMORTGAGE: {
            code: 5,
            status: 'Vous n\'avez pas assez d\'argent pour annuler l\'hypothèque'
        },
        NOT_MORTGAGED: {
            code: 6,
            status: 'Vous n\'avez pas hypothéqué cette propriété'
        },
        PROPERTY_IS_MORTGAGED: {
            code: 7,
            status: 'Cette propriété est hypothéquée'
        }
    },

    BUY_PROPERTY: {
        NOT_EXISTS: {
            code: 1,
            status: 'Cette propriété n\'existe pas'
        },
        ALREADY_SOLD: {
            code: 2,
            status: 'Cette propriété a déjà été vendue'
        },
        NOT_ENOUGH_MONEY: {
            code: 3,
            status: 'Vous n\'avez pas assez d\'argent pour acheter cette propriété'
        }
    }
});
