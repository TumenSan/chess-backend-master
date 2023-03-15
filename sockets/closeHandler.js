const Connections = require("../sockets/connections");

function closeHandler(userId) {
  Connections.removeUserConnection(userId);
}

module.exports = closeHandler;
