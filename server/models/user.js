const bcrypt = require('bcrypt');
const fs = require('fs');
const mongoose = require('mongoose');
const User = require('../game/user.js');
const Errors = require('../lib/errors');
const friends = require('mongoose-friends');
const Schema = mongoose.Schema;

let userSchema = new Schema({
    nickname: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String, required: true },
    inscriptionDate: { type: Date, required: true, default: Date.now },
    level: { type: Number, required: true, default: 1 },
    exp: { type: Number, required: true, default: 0 },
    friends: [{ type: Schema.Types.ObjectId, ref: 'Friend' }],
    settings: {
        graphicsQuality: { type: Number, required: true, enum: [0, 1, 2], default: 1 },
        autoZoom: { type: Boolean, required: true, default: true },
        musicLevel: { type: Number, required: true, default: 50 },
        sfxLevel: { type: Number, required: true, default: 50 }
    },
    success: [{ type: Number }]
});

userSchema.methods.getAvatar = function () {
    try {
        const avatarPath = `/avatars/${this._id}.jpg`;
        if (fs.existsSync(`${__dirname}/../public${avatarPath}`)) {
            return avatarPath;
        } else {
            return '/avatars/default.jpg';
        }
    } catch (err) {
        return '/avatars/default.jpg';
    }
};

userSchema.plugin(friends());

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
    static login(nickname, rawPassword, cb) {
        if (!nickname || !rawPassword)
            return cb(Errors.MISSING_FIELD);

        UserSchema.findOne({ nickname: { $regex: new RegExp('^'+ nickname + '$', "i") } }, (err, user) => {
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
     * Enregistre un nouvel utilisateur dans la base de données
     * @param nickname Le pseudo de l'utilisateur
     * @param email Son email
     * @param rawPassword Le mot de passe en clair
     * @param cb La fonction de callback
     * @callback-return code d'erreur (Errors.REGISTER, voir errors.js)
     */
    static register(nickname, email, rawPassword, cb) {
        if (!nickname || !email || !rawPassword)
            return cb(Errors.MISSING_FIELD);

        if (nickname.length < 4)
            return cb(Errors.REGISTER.ERR_NICKNAME_LEN);

        if (rawPassword.length < 4)
            return cb(Errors.REGISTER.ERR_PASSWORD_LEN);

        if (!UserManager.isEmail(email))
            return cb(Errors.REGISTER.ERR_EMAIL_FORMAT);

        UserSchema.findOne({ email: { $regex: new RegExp('^'+ email + '$', "i") } }, (err, user) => {
            if (err)
                return cb(Errors.INTERNAL_ERROR);

            if (user)
                return cb(Errors.REGISTER.EMAIL_TAKEN);

            UserSchema.findOne({ nickname: { $regex: new RegExp('^'+ nickname + '$', "i") } }, (err, user) => {
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
     * Met à jour le profil d'un utilisateur dans la base de données
     * @param id L'id de l'utilisateur
     * @param nickname Le pseudo de l'utilisateur
     * @param email L'email de l'utilisateur
     * @param rawPassword Le mot de passe en clair
     * @param cb La fonction de callback
     * @callback-return code d'erreur (Errors.REGISTER, voir errors.js)
     */
    static updateProfile(id, nickname, email, rawPassword, cb) {
        if (!nickname || !email)
            return cb(Errors.MISSING_FIELD, null);

        if (nickname.length < 4)
            return cb(Errors.REGISTER.ERR_NICKNAME_LEN, null);

        if (rawPassword && rawPassword.length < 4)
            return cb(Errors.REGISTER.ERR_PASSWORD_LEN, null);

        if (!UserManager.isEmail(email))
            return cb(Errors.REGISTER.ERR_EMAIL_FORMAT, null);

        UserSchema.findById(id, (errDb, userDb) => {
            if (errDb || !userDb) {
                return cb(Errors.UPDATE_PROFILE.NOT_EXISTS, null);
            }

            UserSchema.findOne({ _id: { $nin: [id] }, email: email }, (err, user) => {
                if (err)
                    return cb(Errors.INTERNAL_ERROR, null);

                if (user)
                    return cb(Errors.REGISTER.EMAIL_TAKEN, null);

                UserSchema.findOne({ _id: { $nin: [id] }, nickname: nickname }, (err, user) => {
                    if (err)
                        return cb(Errors.INTERNAL_ERROR, null);

                    if (user)
                        return cb(Errors.REGISTER.NICKNAME_TAKEN, null);


                    if (rawPassword) {
                        UserManager.encryptPassword(rawPassword, (hash) => {
                            if (!hash)
                                return cb(Errors.INTERNAL_ERROR, null);

                            userDb.nickname = nickname;
                            userDb.email = email;
                            userDb.password = hash;

                            userDb.save((err) => {
                                if (err)
                                    return cb(Errors.INTERNAL_ERROR, null);
                                else
                                    return cb(Errors.SUCCESS, userDb);
                            });
                        });
                    } else {
                        userDb.nickname = nickname;
                        userDb.email = email;

                        userDb.save((err) => {
                            if (err)
                                return cb(Errors.INTERNAL_ERROR, null);
                            else
                                return cb(Errors.SUCCESS, userDb);
                        });
                    }
                });
            });
        });
    }

    /**
     * Encrypte un mot de passe
     * @param rawPassword Le mot de passe en clair
     * @param cb La fonction de callback
     * @callback-return null si erreur, le hash sinon
     */
    static encryptPassword(rawPassword, cb) {
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
    static validPassword(rawPassword, hashPassword, cb) {
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
    static isEmail(email) {
        const regex = /^[a-zA-Z0-9_.-]+@[A-Za-z]+\.[a-z]{2,6}/;
        return regex.test(email);
    }
}

module.exports = { UserSchema, UserManager };
