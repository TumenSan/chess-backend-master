const GameModel = require("../models/gameModel");
const GameDto = require("../dtos/gameDto");
const ApiError = require("../exceptions/apiError");
const userModel = require("../models/userModel");

class GameService {
  async saveGame(playerWhite, playerBlack, gameResult, pgn, date) {
    const PlayerWhite = await userModel.findOne({ login: playerWhite });
    console.log(PlayerWhite);
    const userWhiteId = PlayerWhite._id;
    console.log(userWhiteId);
    const PlayerBlack = await userModel.findOne({ login: playerBlack });
    console.log(PlayerBlack);
    const userBlackId = PlayerBlack._id;
    console.log(userBlackId);
    const game = await GameModel.create({ playerWhite: userWhiteId, playerBlack: userBlackId, 
      playerWhiteLogin: PlayerWhite.login, playerBlackLogin: PlayerBlack.login, gameResult, pgn, date });
    console.log("any game: ", game);

    return { game };
  }

  async getAllGamesUser(userLogin) {
    const games = await GameModel.find({ login: userLogin });
    console.log(games);
    return games;
  }

  async getGames() {
    const games = await GameModel.find();
    return games;
  }
}

module.exports = new GameService();
