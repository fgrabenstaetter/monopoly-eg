const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const schema = new Schema(
    {
        _id: { type: String },
        gameEndTime: { type: Date },
        players: { type: Array },
        bank: {
            money: { type: Number },
            debts: { type: Array },
            properties: { type: Array }
        }
    },
    { timestamps: true }
);

const activeGameSchema = mongoose.model('ActiveGame', schema);

module.exports = activeGameSchema;
