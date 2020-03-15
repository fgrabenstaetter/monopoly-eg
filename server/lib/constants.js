const Constants = {
    // CELL
    CELL_TYPE: {
        PARC      : 0,
        PRISON    : 1,
        PROPERTY  : 2,
        CHANCE    : 3,
        COMMUNITY : 4,
        START     : 5
    },

    // PROPERTY
    PROPERTY_TYPE: {
        TRAIN_STATION  : 0,
        STREET         : 1,
        PUBLIC_COMPANY : 2,
    },
    PROPERTY_COLOR: {
        RED:   0,
        GREEN: 1,
        BLUE:  2,
        PINK:  3
    },

    // CHAT
    CHAT_MESSAGE_TYPE: {
        TEXT  : 0,
        OFFER : 1
    },

    // GAME
    GAME_PARAM: {
        WAITING_TIME_AFTER_READY : 2e3,
        TURN_MAX_DURATION        : 2e4,
        EXIT_JAIL_PRICE          : 50,
        GET_MONEY_FROM_START     : 200,
        BANK_INITIAL_MONEY       : 4000
    },
    // Action d'un tour de jeu
    GAME_ASYNC_REQUEST_TYPE: {
        CAN_BUY        : 'canBuy',
        CAN_UPGRADE    : 'canUpgrade',
        SHOULD_MORTAGE : 'shouldMortage'
    }
}

module.exports = Constants;
