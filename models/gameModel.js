const { Schema, model } = require('mongoose');

const GameSchema = new Schema({
    playerWhite: { type: Schema.Types.ObjectId, ref: 'User' },
    playerBlack: { type: Schema.Types.ObjectId, ref: 'User' },
    playerWhiteLogin: { type: String, required: true },
    playerBlackLogin: { type: String, required: true },
    gameResult : { type: String, required: true },
    pgn: { type: String, required: true },
    date: { type: String },
});

module.exports = model('Game', GameSchema);