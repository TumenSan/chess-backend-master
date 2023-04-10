const Connections = require("../sockets/connections");
const { SocketEventsEnum } = require("./constants");

function connectionHandler(ws, data, userId, userLogin) {
  const result = JSON.parse(data);
  console.log(result);
  switch (result.type) {
    case SocketEventsEnum.CONNECT:
      Connections.joinAvailableConnection(ws, userId, userLogin);
      console.log("cons: ", Connections.getConnections());
      break;
    case SocketEventsEnum.CHAT:
      Connections.exchangeMessage(result.connectionId, userId, result.message);
      break;
    case SocketEventsEnum.MOVE:
      Connections.sendMove(result.connectionId, userId, result.figure, result.figureEnd, result.start, result.end);
      break;
    case SocketEventsEnum.GIVE_UP:
      Connections.userGiveUpGameEnd(result.connectionId, userId, userLogin);
      break;
  }
}

module.exports = connectionHandler;
