const gameService = require("../service/GameService");
const ApiError = require("../exceptions/apiError");
const MqClass = require("../service/mqservice");

class GameController {
    async sendPosition(req, res) {
      try {
        //MqClass.connectQueue; // call connectQueue function
        await MqClass.startConsume();
        await MqClass.sendData(req.body);
        
        return res.sendStatus(200);
      } catch (e) {
        console.log(e);
      }
    }

    async sendGame(req, res) {
        try {
          //MqClass.connectQueue; // call connectQueue function
          await MqClass.startConsume();
          await MqClass.sendData(req.body);
          
          return res.sendStatus(200);
        } catch (e) {
          console.log(e);
        }
      }

    async sendSaveGame(req, res) {
        try {
            await gameService.saveGame(req.body.playerWhite, req.body.playerBlack, 
                req.body.gameResult, req.body.pgn, req.body.date);
            
            return res.sendStatus(200);
        } catch (e) {
            console.log(e);
        }
    }

    async getAllGamesUser(req, res) {
      try {
        const games = await gameService.getAllGamesUser(req.body.userLogin);
        return res.json(games);

      } catch (e) {
          console.log(e);
      }
    }

    async getGameUser(req, res) {
        try {
            const games = await gameService.getGameUser(req.body.idGame);
            return res.json(games);

        } catch (e) {
            console.log(e);
        }
    }

    async getGames(req, res) {
        try {
            const games = await gameService.getGames();
            return res.json(games);

        } catch (e) {
            console.log(e);
        }
    }
  }
  
  module.exports = new GameController();