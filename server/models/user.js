const bcrypt = require('bcrypt');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const User = require('../game/user.js');
const Errors = require('../lib/errors');

let userSchema = new Schema({
    nickname: {type: String, required: true},
    email: {type: String, required: true},
    password: {type: String, required: true},
    inscriptionDate: {type: Date, default: Date.now, required: true},
    level: {type: Number, default: 1, required: true},
    exp: {type: Number, default: 0, required: true}
});

const UserSchema = mongoose.model('User', userSchema);

/**
 * UserManager gère les intéractions avec la BDD et le UserSchema
 */
class UserManager { // abstract
    /**
     * @param nickname Le pseudo de l'utilisateur
     * @param rawPassword Le mot de passe en clair
     * @param cb La fonction de callback (code, userSchema) où data contient le schéma de l'utilisateur si la connexion a réussie
     * @callback-return code d'erreur (Errors.LOGIN, voir errors.js)
     * En cas de succès, l'objet est mis à jour avec les attributs de l'utilisateur auquel la connexion à réussie
     */
    static login (nickname, rawPassword, cb) {
        if (!nickname || !rawPassword) {
            cb(Errors.LOGIN.MISSING_FIELD);
            return;
        } else if (nickname.length < 4 || rawPassword.length < 4) {
            cb(Errors.LOGIN.FAILED);
            return;
        }

        UserSchema.findOne({ nickname: nickname }, (err, user) => {
            if (err) {
                cb(Errors.LOGIN.INTERNAL_ERROR);
                return;
            } else if (!user) {
                cb(Errors.LOGIN.FAILED);
                return;
            }

            UserManager.validPassword(rawPassword, user.password, (success) => {
                if (success)
                    cb(Errors.SUCCESS, user);
                else
                    cb(Errors.LOGIN.FAILED);
            });
        });
    }

    /**
     * @param nickname Le pseudo de l'utilisateur
     * @param email Son email
     * @param rawPassword Le mot de passe en clair
     * @param cb La fonction de callback
     * @callback-return code d'erreur (Errors.REGISTER, voir errors.js)
     */
    static register (nickname, email, rawPassword, cb) {
        if (!nickname || !email || !rawPassword) {
            cb(Errors.REGISTER.MISSING_FIELD)
            return;
        } else if (nickname.length < 4 || rawPassword.length < 4 || !UserManager.isEmail(email)) {
            cb(Errors.REGISTER.ERR_FORMAT);
            return;
        }

        UserSchema.findOne({ email: email }, (err, user) => {
            if (err) {
                cb(Errors.REGISTER.INTERNAL_ERROR);
                return;
            } else if (user) {
                cb(Errors.REGISTER.EMAIL_EXISTS);
                return;
            }

            UserSchema.findOne({ nickname: nickname }, (err, user) => {
                if (err) {
                    cb(Errors.REGISTER.INTERNAL_ERROR);
                    return;
                } else if (user) {
                    cb(Errors.REGISTER.NICKNAME_EXISTS);
                    return;
                }

                UserManager.encryptPassword(rawPassword, (hash) => {
                    if (!hash)
                        cb(Errors.REGISTER.INTERNAL_ERROR);
                    else {
                        let newUser = UserSchema();
                        newUser.nickname = nickname;
                        newUser.email = email;
                        newUser.password = hash;

                        newUser.save( (err) => {
                            if (err)
                                cb(Errors.REGISTER.INTERNAL_ERROR);
                            else
                                cb(Errors.SUCCESS);
                        });
                    }
                });
            });
        });
    }

    /**
     * @param rawPassword Le mot de passe en clair
     * @param cb La fonction de callback
     * @callback-return null si erreur, le hash sinon
     */
    static encryptPassword (rawPassword, cb) {
        const saltRounds = 10;
        bcrypt.hash(rawPassword, saltRounds, (err, hash) => {
            if (err != null) {
                cb(null);
                return;
            }
            cb(hash);
        });
    }

    /**
     * @param rawPassword Le mot de passe en clair
     * @param hashPassword Le mot de passe hashé
     * @param cb La fonction de callback
     * @callback-return false s'ils ne correpondent pas, true sinon
     */
    static validPassword (rawPassword, hashPassword, cb) {
        bcrypt.compare(rawPassword, hashPassword, (err, res) => {
            if (err == null && res === true)
                cb(true);
            else
                cb(false);
        });
    }


    /**
     * @param email L'email à tester
     * @return true si email est valide, false sinon
     */
    static isEmail (email) {
        const regex = /^[a-zA-Z0-9_.-]+@[A-Za-z]+\.[a-z]{2,6}/;
        return regex.test(email);
    }
}

module.exports = { UserSchema, UserManager };
