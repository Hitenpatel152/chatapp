const express = require('express');

const app = express();

const http = require('http').createServer(app);

const PORT = process.env.PORT || 3000;

http.listen(PORT, () => {
	console.log(`listen on ${PORT}`);
});

app.use(express.static(__dirname + '/public'));

app.get('/', (req, res) => {
	res.sendFile(__dirname + '/index.html');
});

//socket ....

const io = require('socket.io')(http);

const moment = require('moment');
var { userJoin, getCurrentUser, allUser, roomUser, leaveRoom } = require('./user');

io.on('connection', (socket) => {
	socket.on('joinroom', (obj) => {
		const user = userJoin(socket.id, obj.userName, obj.roomFromArray);

		//io.to(socket.id).emit('message', { msgData: 'Welcome in ChatApp!!' ,time:moment().format('h:mm a') });

		socket.join(user.room);

		//to user room for update list
		//io.to(user.room).emit('updatenewuser' , {roomUser: roomUser(user.room) ,current:getCurrentUser(socket.id)});
		io.to(user.room).emit('updatenewuser', { roomUser: roomUser(user.room), current: getCurrentUser(socket.id) });

		//welcome current user...
		socket.emit('message', { msgData: 'Welcome in ChatApp!!', time: moment().format('h:mm a') });

		//broadcast msg..
		socket.broadcast.to(user.room).emit('message', { msgData: `${user.userName} has joined the chat`, time: moment().format('h:mm a') });
	});

	socket.on('chatMessage', (msgdata) => {
		socket.broadcast.emit('chmessage', msgdata);
	});

	//one to one msg...
	socket.on('OneToOneMessage', (msgdata) => {
		io.to(msgdata.id).emit('chmessage', msgdata);
	});

	//diconnect...
	socket.on('disconnect', () => {
		let user = leaveRoom(socket.id);
		console.log(allUser());
		if (user) {
			//to user room for update list
			socket.broadcast.to(user.room).emit('updatenewuser', { roomUser: roomUser(user.room), current: { room: user.room } });

			socket.broadcast.to(user.room).emit('message', { msgData: `${user.userName} has left the chat`, time: moment().format('h:mm a') });
		}
	});
});
