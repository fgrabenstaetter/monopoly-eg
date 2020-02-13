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
        if (!nickname || !rawPassword)
            return cb(Errors.LOGIN.MISSING_FIELD);

        UserSchema.findOne({ nickname: nickname }, (err, user) => {
            if (err)
                return cb(Errors.INTERNAL_ERROR);
            
            if (!user)
                return cb(Errors.LOGIN.INVALID_CREDENTIALS);

            UserManager.validPassword(rawPassword, user.password, (success) => {
                if (success)
                    return cb(Errors.SUCCESS, user);
                else
                    return cb(Errors.LOGIN.INVALID_CREDENTIALS);
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
        if (!nickname || !email || !rawPassword)
            return cb(Errors.REGISTER.MISSING_FIELD);
        
        if (nickname.length < 4)
            return cb(Errors.REGISTER.ERR_NICKNAME_LEN);
        
        if (rawPassword.length < 4)
            return cb(Errors.REGISTER.ERR_PASSWORD_LEN);
        
        if (!UserManager.isEmail(email))
            return cb(Errors.REGISTER.ERR_EMAIL_FORMAT);

        UserSchema.findOne({ email: email }, (err, user) => {
            if (err)
                return cb(Errors.INTERNAL_ERROR);
            
            if (user)
                return cb(Errors.REGISTER.EMAIL_TAKEN);

            UserSchema.findOne({ nickname: nickname }, (err, user) => {
                if (err)
                    return cb(Errors.INTERNAL_ERROR);
                
                if (user)
                    return cb(Errors.REGISTER.NICKNAME_TAKEN);

                UserManager.encryptPassword(rawPassword, (hash) => {
                    if (!hash)
                        return cb(Errors.INTERNAL_ERROR);

                    let newUser = UserSchema();
                    newUser.nickname = nickname;
                    newUser.email = email;
                    newUser.password = hash;

                    newUser.save((err) => {
                        if (err)
                            return cb(Errors.INTERNAL_ERROR);
                        else
                            return cb(Errors.SUCCESS);
                    });
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
            if (err != null)
                return cb(null);
            
            return cb(hash);
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
