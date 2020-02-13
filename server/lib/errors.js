module.exports = Object.freeze({
    // USER
    SUCCESS: 0,
    LOGIN: {
        FAILED: 1,
        MISSING_FIELD: 2,
        INTERNAL_ERROR: 3
    },
    REGISTER: {
        EMAIL_EXISTS: 1,
        NICKNAME_EXISTS: 2,
        ERR_FORMAT: 3,
        MISSING_FIELD: 4,
        INTERNAL_ERROR: 5
    }
});
