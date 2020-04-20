const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const schema = new Schema(
    {
        startedTime: {type: Date, required: true}, // timestamp de démarrage en ms
        isActive: {type: Boolean, required: true},
        duration: {type: Number},
        gameEndTime: {type: Date},
        players: [{ type: Schema.Types.ObjectId, ref: 'Player'}],

    },
    { timestamps: true }
);

const GameSchema = mongoose.model('Game', schema);

module.exports = GameSchema;
