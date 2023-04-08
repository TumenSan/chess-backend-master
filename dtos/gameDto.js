class GameDto {
    playerWhite;
    playerBlack;
    id;
  
    constructor(model) {
      this.playerWhite = model.playerWhite;
      this.playerBlack = model.playerBlack;
      this.id = model._id;
    }
  }
  
  module.exports = GameDto;
  