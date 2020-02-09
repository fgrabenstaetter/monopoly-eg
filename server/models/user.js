var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var schema = new Schema({
    nickname: {type: String, required: true},
    email: {type: String, required: true},
    password: {type: String, required: true},
    inscriptionDate: {type: Date, default: Date.now, required: true},
    level: {type: Number, default: 1, required: true}
});

module.exports = mongoose.model('User', schema);