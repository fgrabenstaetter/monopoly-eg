const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const User = require('../game/user.js');
const Constants = require('../lib/constants');

let userSchema = new Schema({
    nickname: {type: String, required: true},
    email: {type: String, required: true},
    password: {type: String, required: true},
    inscriptionDate: {type: Date, default: Date.now, required: true},
    level: {type: Number, default: 1, required: true},
    exp: {type: Number, default: 0, required: true}
});

/**
 * @param nickname Le pseudo de l'utilisateur
 * @param rawPassword Le mot de passe en clair
 * @param cb La fonction de callback
 * @callback-return code d'erreur (USER_LOGIN_ERROR_CODE, voir constants.js)
 * En cas de succès, l'objet est mis à jour avec les attributs de l'utilisateur auquel la connexion à réussie
 */
userSchema.methods.login = (nickname, rawPassword, cb) => {
    if (!nickname || !rawPassword) {
        cb(Constants.USER_LOGIN_ERROR_CODE.MISSING_FIELD);
        return;
    } else if (nickname.length < 4 || rawPassword.length < 4) {
        cb(Constants.USER_LOGIN_ERROR_CODE.FAILED);
        return;
    }

    UserModel.findOne({ nickname: nickname }, (err, user) => {
        if (err) {
            cb(Constants.USER_LOGIN_ERROR_CODE.INTERNAL_ERROR);
            return;
        } else if (!user) {
            cb(Constants.USER_LOGIN_ERROR_CODE.FAILED);
            return;
        }

        User.validPassword(rawPassword, user.password, (success) => {
            if (success) {
                this.nickname = user.nickname;
                this.email = user.email;
                this.password = user.password;
                this.inscriptionDate = user.inscriptionDate;
                this.level = user.level;
                this.exp = user.exp;
                cb(Constants.USER_LOGIN_ERROR_CODE.SUCCESS);
            } else
                cb(Constants.USER_LOGIN_ERROR_CODE.FAILED);
        });
    });
}

/**
 * @param nickname Le pseudo de l'utilisateur
 * @param email Son email
 * @param rawPassword Le mot de passe en clair
 * @param cb La fonction de callback
 * @callback-return code d'erreur (USER_REGISTER_ERROR_CODE, voir constants.js)
 */
userSchema.methods.register = (nickname, email, rawPassword, cb) => {
    if (!nickname || !email || !rawPassword) {
        cb(Constants.USER_REGISTER_ERROR_CODE.MISSING_FIELD)
        return;
    } else if (nickname.length < 4 || rawPassword.length < 4 || !User.isEmail(email)) {
        cb(Constants.USER_REGISTER_ERROR_CODE.ERR_FORMAT);
        return;
    }

    UserModel.findOne({ email: email }, (err, user) => {
        if (err) {
            cb(Constants.USER_REGISTER_ERROR_CODE.INTERNAL_ERROR);
            return;
        } else if (user) {
            cb(Constants.USER_REGISTER_ERROR_CODE.EMAIL_EXISTS);
            return;
        }

        UserModel.findOne({ nickname: nickname }, (err, user) => {
            if (err) {
                cb(Constants.USER_REGISTER_ERROR_CODE.INTERNAL_ERROR);
                return;
            } else if (user) {
                cb(Constants.USER_REGISTER_ERROR_CODE.NICKNAME_EXISTS);
                return;
            }

            User.encryptPassword(rawPassword, (hash) => {
                if (!hash)
                    cb(Constants.USER_REGISTER_ERROR_CODE.INTERNAL_ERROR);
                else {
                    this.nickname = nickname;
                    this.email = email;
                    this.password = hash;

                    this.save( (err) => {
                        if (er)
                            cb(Constants.USER_REGISTER_ERROR_CODE.INTERNAL_ERROR);
                        else
                            cb(Constants.USER_REGISTER_ERROR_CODE.SUCCESS);
                    });
                }
            });
        });
    });
}

module.exports = mongoose.model('User', userSchema);
