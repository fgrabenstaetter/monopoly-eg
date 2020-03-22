const Constants = {
    CELL_TYPE: {
        PROPERTY  : 'property',
        COMMUNITY : 'community',
        CHANCE    : 'chance',
        PRISON    : 'prison',
        OTHER     : 'other'
    },
    PROPERTY_TYPE: {
        TRAIN_STATION  : 'trainStation',
        STREET         : 'street',
        PUBLIC_COMPANY : 'publicCompany'

    },
    STREET_COLOR: {
        RED   : 'red',
        GREEN : 'green',
        BLUE  : 'blue',
        PINK  : 'pink'
    },
    CHAT_MESSAGE_TYPE: {
        TEXT  : 'text',
        OFFER : 'offer'
    },
    GAME_PARAM: {
        WAITING_TIME_AFTER_READY : 2e3,
        TURN_MAX_DURATION        : 4e4,
        EXIT_JAIL_PRICE          : 50,
        GET_MONEY_FROM_START     : 200,
        BANK_INITIAL_MONEY       : 4000,
        PLAYER_INITIAL_MONEY     : 1500
    },
    GAME_ASYNC_REQUEST_TYPE: {
        CAN_BUY        : 'canBuy',
        CAN_UPGRADE    : 'canUpgrade',
        SHOULD_MORTAGE : 'shouldMortage'
    }
}

module.exports = Constants;
