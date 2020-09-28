const users = [];
function userJoin(id, userName, room) {
	const user = { id, userName, room };

	users.push(user);

	return user;
}

function getCurrentUser(id) {
	return users.find((user) => user.id === id);
}

function allUser() {
	return users;
}

function roomUser(room) {
	const roomMember = users.filter((user) => user.room === room);

	return roomMember;
}
function leaveRoom(id) {
	const userIndex = users.findIndex((user) => user.id === id);
	if (userIndex !== -1) {
		return users.splice(userIndex, 1)[0];
	}
}
module.exports = {
	userJoin,
	getCurrentUser,
	allUser,
	roomUser,
	leaveRoom,
};
