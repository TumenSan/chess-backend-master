const GameModel = require("../models/gameModel");
const GameDto = require("../dtos/gameDto");
const ApiError = require("../exceptions/apiError");
const userModel = require("../models/userModel");

class GameService {
  async saveGame(playerWhite, playerBlack, pgn) {
    const PlayerWhite = await userModel.findOne({ login: playerWhite });
    console.log(PlayerWhite);
    const userWhiteId = PlayerWhite._id;
    console.log(userWhiteId);
    const PlayerBlack = await userModel.findOne({ login: playerBlack });
    console.log(PlayerBlack);
    const userBlackId = PlayerBlack._id;
    console.log(userBlackId);
    const game = await GameModel.create({ playerWhite: userWhiteId, playerBlack: userBlackId, 
      playerWhiteLogin: PlayerWhite.login, playerBlackLogin: PlayerBlack.login, pgn });
    console.log("any game: ", game);

    return { game };
  }

  async getAllGames() {
    const games = await GameModel.find();
    return games;
  }
}

module.exports = new GameService();
