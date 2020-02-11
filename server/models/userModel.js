let mongoose = require('mongoose');
let bcrypt = require('bcrypt');
let Schema = mongoose.Schema;

let userSchema = new Schema({
    nickname: {type: String, required: true},
    email: {type: String, required: true},
    password: {type: String, required: true},
    inscriptionDate: {type: Date, default: Date.now, required: true},
    level: {type: Number, default: 1, required: true}
});

<<<<<<< HEAD:server/models/user.js
userSchema.methods.encryptPassword = (password) => {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(5), null);
};

module.exports = mongoose.model('User', userSchema);
=======
module.exports = mongoose.model('UserModel', schema);
>>>>>>> 9c82e79588234cd87ac839d30db5edfa778f3d48:server/models/userModel.js
