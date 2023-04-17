const { SocketEventsEnum } = require("./constants");
const GameModel = require("../models/gameModel");

const uuidV4 = require("uuid").v4;

class Connections {
  connections = {};

  addConnection(ws, userId, userLogin) {
    const id = uuidV4();
    let connection = {
      id,
      users: [{ userId, userLogin, userWs: ws, side: Math.round(Math.random()) === 0 ? 'b' : 'w' }],
      isFull: false,
			messages: [],
	  moves: [],
    };
    this.connections[id] = connection;
    return connection;
  }

  getConnections() {
    return this.connections;
  }

  joinAvailableConnection(ws, userId, userLogin) {
    let connection = Object.values(this.connections).find((c) => !c.isFull);

    if (!connection) {
			connection = this.addConnection(ws, userId, userLogin);
      ws.send(JSON.stringify({ type: SocketEventsEnum.NEW_GAME, messages: connection.messages, connectionId: connection.id }));
      return connection;
    }

	const userSide = connection.users[0].side === 'w' ? 'b' : 'w';
	this.connections[connection.id] = {
      ...connection,
      users: [...connection.users, { userId, userLogin, userWs: ws, side: userSide }],
      isFull: true,
    };

	ws.send(JSON.stringify({ type: SocketEventsEnum.START_GAME, side: userSide, 
		opponent: connection.users[0].userLogin, connectionId: connection.id }));
	connection.users[0].userWs.send(JSON.stringify({ type: SocketEventsEnum.START_GAME, side: connection.users[0].side, 
		opponent: userLogin, connectionId: connection.id }));

    return connection;
  }
  
  async userGiveUpGameEnd(id, userId, userLogin) {
	let connection = this.connections[id];
	
	console.log("moves: ", connection.moves);

	if (!connection) {
		throw new Error('Сессии не существует');
	}

	const otherUserWs = connection.users.find(u => u.userId !== userId)?.userWs;
	
	if(!otherUserWs) {
		throw new Error('Оппонент не найден');
	}

	otherUserWs.send(JSON.stringify({ type: SocketEventsEnum.GIVE_UP, userId, userLogin }));

	const dateGame = (new Date()).toDateString();

	let newMoves = connection.moves.map(([figure, capture, start, end]) => {
		let move;
		let rowEnd = 8 - Math.floor(end / 8);
		let columnEnd = String.fromCharCode((end % 8) + 97);
		let endPoint = `${columnEnd}${rowEnd}`;
		if (capture) {
			if (figure.toLowerCase() === "p"){
				let columnStart = String.fromCharCode((start % 8) + 97);
				move = `${columnStart}x${endPoint}`;
			}
			else move = `${figure.toUpperCase()}x${endPoint}`;
		} else {
			if (figure.toLowerCase() === "p"){
				move = `${endPoint}`;
			} else move = `${figure.toUpperCase()}${endPoint}`;
		}
		if ((figure.toLowerCase() === "k") && ((Math.abs(start - end)) === 2
		)){
			move = ((end - start) > 0) ? "0-0" : "0-0-0";
		}
		
		return [move];
	  });

	let notation = '';
	for (let i = 0; i < newMoves.length; i += 2) {
		const number = (i / 2) + 1;
		const whiteMove = newMoves[i][0];
		const blackMove = newMoves[i+1] ? newMoves[i+1][0] : '';
		notation += `${number}. ${whiteMove} ${blackMove} `;
	}

	console.log(notation);
	console.log(newMoves);
	console.log(connection.users);
	let userThatGiveUp = connection.users.find((u) => u.userLogin === userLogin);
	let gameResult = (userThatGiveUp.side === "w") ? "0-1" : "1-0";

	const game = await GameModel.create({ playerWhite: connection.users[0].userId, 
		playerBlack: connection.users[1].userId, playerWhiteLogin: connection.users[0].userLogin, 
		playerBlackLogin: connection.users[1].userLogin, gameResult: gameResult, pgn: notation, date: dateGame });
		
  }

  removeUserConnection(userId) {
    const connection = Object.values(this.connections).find((c) => c.users.some(u => u.userId === userId));
    
		if (!connection) {
			return;
		}

		const otherUserWs = connection.users.find(u => u.userId !== userId)?.userWs;
		
		if(otherUserWs) {
			otherUserWs.send(JSON.stringify({ type: SocketEventsEnum.GAME_OVER }));
		}
		
    delete this.connections[connection.id];
  }

	exchangeMessage(id, userId, message) {
		let connection = this.connections[id];
    
		if (!connection) {
			throw new Error('Сессии не существует');
		}

		const otherUserWs = connection.users.find(u => u.userId !== userId)?.userWs;
		
		if(!otherUserWs) {
			throw new Error('Оппонент не найден');
		}

		this.connections[connection.id] = {
			...connection,
			messages: [...connection.messages, { userId, message }],
		};
		otherUserWs.send(JSON.stringify({ type: SocketEventsEnum.CHAT, message, userId }));
	}

	sendMove(id, userId, figure, figureEnd, start, end) {
		let connection = this.connections[id];
    
		if (!connection) {
        throw new Error('Сессии не существует');
    }

		const otherUserWs = connection.users.find(u => u.userId !== userId)?.userWs;

		if(!otherUserWs) {
			throw new Error('Оппонент не найден');
		}

		console.log(figure, figureEnd, start, end);
		otherUserWs.send(JSON.stringify({ type: SocketEventsEnum.MOVE, figure, figureEnd, start, end }));

		connection.moves.push([figure, figureEnd, start, end]);
	}
}

module.exports = new Connections();
