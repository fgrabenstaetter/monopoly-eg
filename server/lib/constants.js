const Constants = {
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
        EXIT_JAIL_PRICE: 50,
        GET_MONEY_FROM_START: 200,
        BANK_INITIAL_MONEY: 4000,
        PLAYER_INITIAL_MONEY: 1500,
        OFFER_EXPIRE_AFTER: 2e4,
        BID_EXPIRE_AFTER: 40e3,
        TURN_MAX_DURATION: 6e4,
        TURN_DISCONNECTED_MAX_DURATION: 1e4,
        TURN_DOUBLE_DICE_ADDED_TIME: 2e4,
        TURN_ROLL_DICE_INTERVAL_AFTER_TIMEOUT: 5e3

    },
    GAME_ASYNC_REQUEST_TYPE: {
        CAN_BUY: 'canBuy',
        CAN_UPGRADE: 'canUpgrade',
        SHOULD_MORTGAGE: 'shouldMortgage'
    }
}

module.exports = Constants;
