module.exports = Object.freeze({
    // CELL
    CELL_TYPE: {
        PARC:      0,
        PRISON:    1,
        PROPERTY:  2,
        CHANCE:    3,
        COMMUNITY: 4
    },

    // PROPERTY
    PROPERTY_TYPE: {
        TRAIN_STATION:   0,
        STREET:         1,
        PUBLIC_COMPANY: 2,
    },
    PROPERTY_COLOR: {
        RED:   0,
        GREEN: 1,
        BLUE:  2,
        PINK:  3
    },

    // USER
    USER_LOGIN_ERROR_CODE: {
        SUCCESS: 0,
        FAILED: 1,
        MISSING_FIELD: 2,
        INTERNAL_ERROR: 3
    },
    USER_REGISTER_ERROR_CODE: {
        SUCCESS: 0,
        EMAIL_EXISTS: 1,
        NICKNAME_EXISTS: 2,
        ERR_FORMAT: 3,
        MISSING_FIELD: 4,
        INTERNAL_ERROR: 5
    }
});
