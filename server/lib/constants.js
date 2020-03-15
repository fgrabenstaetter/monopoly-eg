const Constants = {
    CELL_TYPES: {
        START: 'START',
        PROPERTY: 'PROPERTY',
        COMMUNITY_CHEST: 'COMMUNITY_CHEST',
        CHANCE: 'CHANCE',
        PRISON: 'PRISON',
        OTHER: 'OTHER' // custom effects, like "Pay $200 Income Tax"
    },
    PROPERTY_TYPES: {
        TRAIN_STATION: 'TRAIN_STATION',
        STREET: 'STREET',
        PUBLIC_COMPANY: 'PUBLIC_COMPANY'

    },
    STREET_COLORS: {
        RED: 'RED',
        GREEN: 'GREEN',
        BLUE: 'BLUE',
        PINK: 'PINK'
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
