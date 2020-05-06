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
        },
        CANNOT_OVERBID_MY: {
            code: 5,
            status: 'Vous ne pouvez pas surenchérir votre propre enchère'
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
            status: 'Le pseudo doit comporter entre 3 et 16 caractères'
        },
        ERR_PASSWORD_LEN: {
            code: 5,
            status: 'Mot de passe trop court (min 4 caractères)'
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
        },
        NOT_IN_MATCHMAKING: {
            code: 7,
            status: 'Vous n\'êtes pas en recherche de partie'
        },
        ALREADY_IN_FRIEND_LOBBY: {
            code: 8,
            status: 'Vous êtes déjà dans le lobby de votre ami'
        },
        ALREADY_INVITED: {
            code: 9,
            status: 'Ce joueur a déjà été invité dans ce lobby'
        },
        CHAT_LIMIT_REACHED: {
            code: 10,
            status: 'Vous ne pouvez pas envoyer autant de message si rapidement'
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
        },
        PLAYER_IN_FAILURE: {
            code: 8,
            status: 'Le joueur est en faillite'
        },
        ENDED: {
            code: 9,
            status: 'La partie est terminée'
        },
        UPGRADE_INVALID_PROPERTY: {
            code: 10,
            status: 'Une propriété est invalide'
        },
        UPGRADE_NOT_ENOUGH_MONEY: {
            code: 11,
            status: 'Vous n\'avez pas assez d\'argent pour effectuer l\'amélioration'
        },
        UPGRADE_NOT_MONOPOLY: {
            code: 12,
            status: 'Vous n\'avez pas le monopole d\'une propriété'
        },
        PROPERTY_ALREADY_SOLD: {
            code: 13,
            status: 'Cette propriété a déjà été achetée'
        },
        NOT_ENOUGH_FOR_BUY: {
            code: 14,
            status: 'Vous n\'avez pas assez d\'argent pour acheter cette propriété'
        },
        UPGRADE_PROPERTY_MORTGAGED: {
            code: 15,
            status: 'Une propriété est hypothéquée'
        },
        OFFER_LIMIT_REACHED: {
            code: 16,
            status: 'Vous ne pouvez pas envoyer autant d\'offres au même joueur si rapidement'
        },
        PRICE_OUT_OF_RANGE: {
            code: 17,
            status: 'Le prix entré est invalide (hors de portée)'
        },
        UPGRADE_MONOPOLY_ONE_MORTGAGED: {
            code: 18,
            status: 'Une propriété dont une propriété du même monopole est hypothéquée'
        },
        PROPERTY_NOT_EMPTY: {
            code: 19,
            status: 'Cette propriété possède des maisons ou un hôtel'
        },
        PROPERTY_MONOPOLY_CONTAINS_BUILDING: {
            code: 20,
            status: 'Un terrain faisant parti d\'un monopole comportant des constructions ne peut pas être vendu'
        }
    }
});
