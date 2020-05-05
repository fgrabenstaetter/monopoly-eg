const Constants = {
    ENVIRONMENT: 'dev',
    ENVIRONMENTS: {
        PROD: 'prod',
        TEST: 'test',
        DEV: 'dev'
    },
    CELL_TYPE: {
        PROPERTY: 'property',
        COMMUNITY: 'community',
        CHANCE: 'chance',
        GOPRISON: 'goprison',
        TAX: 'tax',
        OTHER: 'other'
    },
    PROPERTY_TYPE: {
        TRAIN_STATION: 'trainStation',
        STREET: 'street',
        PUBLIC_COMPANY: 'publicCompany'
    },
    STREET_COLOR: {
        BROWN: 'brown',
        LIGHTBLUE: 'cyan',
        PURPLE: 'purple',
        ORANGE: 'orange',
        RED: 'red',
        YELLOW: 'yellow',
        GREEN: 'green',
        BLUE: 'blue'
    },
    GAME_PARAM: {
        WAITING_TIME_AFTER_READY: 2e3,
        GET_MONEY_FROM_START: 200,
        BANK_INITIAL_MONEY: 8e3,
        PLAYER_INITIAL_MONEY: 1500,
        OFFER_EXPIRE_AFTER: 4e4,
        BID_EXPIRE_AFTER: 3e4,
        TURN_MAX_DURATION: 5e4,
        TURN_DISCONNECTED_MAX_DURATION: 1e4,
        TURN_DOUBLE_DICE_ADDED_TIME: 2e4,
        TURN_AUTO_ROLL_DICE_MIN_INTERVAL: 5e3,
        PERSIST_GAMESTATE_INTERVAL: 5e3
    },
    GAME_ASYNC_REQUEST_TYPE: {
        CAN_BUY: 'canBuy',
        SHOULD_MORTGAGE: 'shouldMortgage'
    }
}

module.exports = Constants;
