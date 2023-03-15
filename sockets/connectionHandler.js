const Connections = require("../sockets/connections");
const { SocketEventsEnum } = require("./constants");

function connectionHandler(ws, data, userId) {
  const result = JSON.parse(data);
  console.log(result);
  switch (result.type) {
    case SocketEventsEnum.CONNECT:
      Connections.joinAvailableConnection(ws, userId);
      console.log("cons: ", Connections.getConnections());
      break;
    case SocketEventsEnum.CHAT:
      Connections.exchangeMessage(result.connectionId, userId, result.message);
      break;
    case SocketEventsEnum.MOVE:
      Connections.sendMove(result.connectionId, userId, result.start, result.end);
      break;
  }
}

module.exports = connectionHandler;
