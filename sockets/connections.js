const { SocketEventsEnum } = require("./constants");

const uuidV4 = require("uuid").v4;

class Connections {
  connections = {};

  addConnection(ws, userId) {
    const id = uuidV4();
    const connection = {
      id,
      users: [{ userId, userWs: ws, side: Math.round(Math.random()) === 0 ? 'b' : 'w' }],
      isFull: false,
			messages: [],
    };
    this.connections[id] = connection;
    return connection;
  }

  getConnections() {
    return this.connections;
  }

  joinAvailableConnection(ws, userId) {
    let connection = Object.values(this.connections).find((c) => !c.isFull);

    if (!connection) {
			connection = this.addConnection(ws, userId);
      ws.send(JSON.stringify({ type: SocketEventsEnum.NEW_GAME, messages: connection.messages, connectionId: connection.id }));
      return connection;
    }

		const userSide = connection.users[0].side === 'w' ? 'b' : 'w';
		this.connections[connection.id] = {
      ...connection,
      users: [...connection.users, { userId, userWs: ws, side: userSide }],
      isFull: true,
    };
		ws.send(JSON.stringify({ type: SocketEventsEnum.START_GAME, side: userSide, connectionId: connection.id }));
		connection.users[0].userWs.send(JSON.stringify({ type: SocketEventsEnum.START_GAME, side: connection.users[0].side, connectionId: connection.id }));
    return connection;
  }
  
  userGiveUpGameEnd(id, userId) {
	let connection = this.connections[id];
    
	if (!connection) {
		throw new Error('Сессии не существует');
	}

	const otherUserWs = connection.users.find(u => u.userId !== userId)?.userWs;
	
	if(!otherUserWs) {
		throw new Error('Оппонент не найден');
	}

	otherUserWs.send(JSON.stringify({ type: SocketEventsEnum.GIVE_UP, userId }));
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

	}
}

module.exports = new Connections();
