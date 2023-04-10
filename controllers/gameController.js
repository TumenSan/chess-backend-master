const gameService = require("../service/GameService");
const { validationResult } = require("express-validator");
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
                req.body.gameResult, req.body.pgn);
            
            return res.sendStatus(200);
        } catch (e) {
            console.log(e);
        }
    }

    async getGames(req, res) {
        try {
            const games = await gameService.getAllGames();
            return res.json(games);

        } catch (e) {
            console.log(e);
        }
    }
  }
  
  module.exports = new GameController();