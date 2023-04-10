require("dotenv").config();
const http = require("http");
const { WebSocketServer } = require('ws');
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const router = require("./router/index");
const mongoose = require("mongoose");
const errorMiddleware = require("./middlewares/errorMiddleware");
const socketAuthMiddleware = require("./middlewares/socketAuthMiddleware");
const connectionHandler = require('./sockets/connectionHandler');
const closeHandler = require('./sockets/closeHandler');
const MqClass = require("./service/mqservice")

const PORT = process.env.PORT || 5000;

const start = async () => {
  try {
    MqClass.connectQueue();

    const app = express();
    const server = http.createServer(app);

    const wss = new WebSocketServer({ noServer: true });

    app.use(express.json());
    app.use(cookieParser());
    app.use(
      cors({
        credentials: true,
        origin: process.env.CLIENT_URL,
      })
    );
    app.use("/api", router);
    app.use(errorMiddleware);

    server.on('upgrade', function upgrade(request, socket, head) {
      socketAuthMiddleware(request, function next(err, user) {
        if (err || !user) {
          socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n');
          socket.destroy();
          return;
        }
    
        wss.handleUpgrade(request, socket, head, function done(ws) {
          wss.emit('connection', ws, request, user);
        });
      });
    });

    wss.on('connection', function connection(ws, request, user) {
      console.log('here', user);
      
      ws.on('message', (data) => {
        connectionHandler(ws, data, user.id, user.login);
      });

      ws.on('close', (data) => {
        closeHandler(user.id);
      });
    });

    await mongoose.connect(process.env.DB_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    server.listen(PORT, () => {
      console.log(`App listening on port ${PORT}`);
    });
  } catch (error) {
    console.log("Enable to start a server: ", error);
  }
};

start();
