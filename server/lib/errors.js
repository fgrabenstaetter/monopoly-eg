module.exports = Object.freeze({
    // GLOBAL ERRORS
    SUCCESS: 0,
    INTERNAL_ERROR: 1000,
    MISSING_FIELD: 1001,

    // LOGIN ERRORS
    LOGIN: {
        INVALID_CREDENTIALS: 1
    },
    
    // REGISTER ERRORS
    REGISTER: {
        EMAIL_TAKEN: 1,
        NICKNAME_TAKEN: 2,
        ERR_EMAIL_FORMAT: 3,
        ERR_NICKNAME_LEN: 4,
        ERR_PASSWORD_LEN: 5
    }
});
