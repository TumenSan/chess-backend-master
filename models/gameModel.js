const { Schema, model } = require('mongoose');

const GameSchema = new Schema({
    user: { type: Schema.Types.ObjectId, ref: 'User' },
    gameNumber: { type: Number, required: true },
    game: { type: String, required: true },
});

module.exports = model('Game', GameSchema);