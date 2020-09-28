jQuery(() => {
	$('#chatapp').hide();
	var userName;

	var $FNameLNameRegEx = /^([a-zA-Z]{2,20})$/;
	let TxtNameFlag = false,
		ddlflag = false;

	$('#btnsubmituser').on('click', () => {
		if ($('#TextName').val() == '') {
			$('#TextNameValidate').html('(*) UserName is Required');
		} else {
			if (!$('#TextName').val().match($FNameLNameRegEx)) {
				$('#TextNameValidate').html('Invalid Last Name..!!');
				TxtNameFlag = false;
			} else {
				TxtNameFlag = true;
			}
		}

		let arrayroom = ['room1', 'room2', 'room3', 'room4'];
		let roomFromArray = $('#ddl_room option:selected').text();
		if (arrayroom.includes(roomFromArray)) {
			ddlflag = true;
		}
		if (TxtNameFlag === true && ddlflag === true) {
			userName = $('#TextName').val().trim();
			$('#chatapp').hide();
			$('#form').hide();
			$('#chatapp').show();

			sidebarUpdate(userName, roomFromArray);

			document.querySelector('.header').id = socket.id;
			document.querySelector('.header').innerText = document.querySelector('.header').innerText + ' ' + userName;

			socket.emit('joinroom', { userName, roomFromArray });
		} else {
			alert('invalid input!!!!');
		}
	});

	jQuery('#LeaveBtn').on('click', () => {
		TxtNameFlag = false;
		ddlflag = false;

		socket.disconnect();
		var oldurl = window.location.href;
		window.location.replace(oldurl);
		$('#chatapp').empty();
		$('#chatapp').append(
			`<div class="container mx-auto flex w-2/3 justify-between bg-purple-600 h-16 item-center px-1 py-1 mt-16 rounded-t-lg">
				<center align="left" class="flex">
					<h1 class="text-2xl font-bold ml-10 mt-2 text-white"><i class="fas fa-smile"></i></h1>
					<h1 class="header text-2xl font-bold ml-4 mt-2 text-white">ChatApp</h1>
				</center>
				<center align="right">
					<button id="LeaveBtn" class="text-xl p-2 mr-10 rounded bg-green-300 text-white hover:text-white hover:bg-red-600 font-bold ml-4 mt-2 text-white" style="outline: none;">Leave</button>
				</center>
			</div>

			<div class="headbox container flex mx-auto w-2/3 item-center rounded-b-lg justify-between">
				
				<div class="magArea container mx-auto bg-gray-200 h-64 p-4 overflow-y-auto"></div>
			</div>

			<div class="container mx-auto flex w-2/3 bg-purple-600 h-16 item-center p-4 rounded-b-lg">
				<input placeholder="Write a message...." id="senddata" class="pb-2 pl-2 mr-2 h-8 w-full mx-auto text-purple-800 outline-none bg-gray-300 text-black font-bold py-2 px-4 border-b-4 border-blue-700" />
				<button id="btnsend" class="bg-blue-500 hover:bg-blue-400 text-white font-bold py-1 px-3 border-b-4 border-blue-700" style="outline: none">
					<i class="fa fa-paper-plane" class="pb-1 outline-none h-12 w-full mx-auto" aria-hidden="true"></i>
				</button>
			</div>`
		);
		$('#form').show();
		$('#chatapp').hide();
	});

	jQuery(document).on('click', '#btnsend', () => {
		var magObj;
		if (jQuery('#senddata').val() !== '') {
			magObj = $('#senddata').val();

			let newid = jQuery('#userList option:selected').attr('id');
			let newtype = jQuery('#userList option:selected').attr('type');
			let newtext = jQuery('#userList option:selected').text();

			if (newtype === 'users') {
				var msgsendtoserver = {
					msgData: magObj,
					userName: userName,
					type: 'outgoing',
					time: moment().format('h:mm a'),
					id: newid,
					toname: newtext,
				};

				document.getElementById('senddata').value = '';
				outputMsg(msgsendtoserver);

				msgsendtoserver.type = 'incoming';

				socket.emit('OneToOneMessage', msgsendtoserver);
			} else {
				var msgsendtoserver = {
					msgData: magObj,
					userName: userName,
					type: 'outgoing',
					time: moment().format('h:mm a'),
				};

				document.getElementById('senddata').value = '';
				outputMsg(msgsendtoserver);

				msgsendtoserver.type = 'incoming';

				// emiting msg to server....
				socket.emit('chatMessage', msgsendtoserver);
			}
		}
	});

	$(document).on('click', '.userMember', function () {
		$(`#${$(this).attr('id')} h1`).removeClass('bg-blue-700');

		$(`#${$(this).attr('id')} h1`).addClass('bg-red-600');

		$('#senddata').attr('userid', $(this).attr('id'));
		$('#senddata').attr('username', $(this).text());
	});
});

const socket = io();
const msgArea = document.querySelector('.magArea');
const header = document.querySelector('.header');
socket.on('message', (msg) => {
	//mesg from server..

	outputMsg(msg);
	msgArea.scrollTop = msgArea.scrollHeight;
});
function outputMsg(msg) {
	//msg body update , append ......
	let mainDiv = document.createElement('div');
	mainDiv.classList.add('mb-3');
	let markup;
	if (!msg.userName) {
		markup = `
		<p class="bg-yellow-600 text-white rounded w-auto inline-block p-3">${msg.msgData}</p>
		<p>${msg.time}</p>
	`;
	} else {
		if (msg.type === 'outgoing') {
			mainDiv.setAttribute('align', 'right');
			markup = `
				<h3 class="text-sl font-bold w-auto pl-1">${msg.userName}</h3>
				<p class="bg-pink-600 text-white rounded w-auto inline-block p-3">${msg.msgData}<br>
				${msg.toname ? `To : ${msg.toname}` : ''}</p>
				<p>${msg.time}</p>

			`;
		} else {
			markup = `
				<h3 class="text-sl font-bold w-auto pl-1">${msg.userName}</h3>
				<p class="bg-red-600 text-white rounded w-auto inline-block p-3">${msg.msgData}</p>
				<p>${msg.time}</p>
			`;
		}
	}
	mainDiv.innerHTML = markup;
	msgArea.appendChild(mainDiv);
	document.querySelector('.magArea').scrollTop = document.querySelector('.magArea').scrollHeight;
}
socket.on('chmessage', (msg) => {
	//mesg from server..

	outputMsg(msg);

	//scroll
	msgArea.scrollTop = msgArea.scrollHeight;
});

//sidebar update...

function sidebarUpdate(userName, roomFromArray) {
	console.log(userName, roomFromArray);
	let headbox = document.querySelector('.headbox');

	sideDiv = document.createElement('div');
	sideDiv.setAttribute('align', 'left');
	sideDiv.classList.add('userlist', 'container', 'mx-auto', 'bg-blue-500', 'h-64', 'overflow-y-auto', 'w-1/3');
	const markupsidebar = `
					<center>
						<h1 class="text-xl font-bold mt-2 text-white"><i class="fa fa-comments-o"></i> Room Name:</h1>
						<h1 class="text-md font-bold mt-2 text-white bg-blue-700">${roomFromArray}</h1>
					</center>
					<center>
						<h1 class="text-xl font-bold mt-2 text-white"><i class="fa fa-users"></i> User Name:</h1>
						<select id="userList" class="bg-gray-200 py-2 px-4 mb-5 appearance-none border-2 border-gray-200 rounded w-1/2 text-gray-700" style="outline: none">

						</select>
					</center>
				</div>
	`;
	sideDiv.innerHTML = markupsidebar;
	headbox.insertBefore(sideDiv, headbox.firstChild);

	console.log(headbox);
}

function updateNewUser(newusername, roomName) {
	console.log(roomName);
	const listofuser = document.getElementById('userList');

	listofuser.innerHTML = `<option selected="selected" id= "${roomName.id ? roomName.id : roomName.room}" type="room">${roomName.room}</option>`;
	for (var i = 0; i < newusername.length; i++) {
		if (newusername[i].id !== document.querySelector('.header').id) {
			listofuser.innerHTML = listofuser.innerHTML + `<option id = ${newusername[i].id} type = "users">${newusername[i].userName}</option>`;
			//listofuser.innerHTML = listofuser.innerHTML + `<opetion  class="userMember "  id = "${newusername[i].id}"><h1 class=" text-md font-bold mt-2 text-white hover:bg-blue-400 bg-blue-700">${newusername[i].userName}</h1></option>`
		}
	}
}

socket.on('updatenewuser', (msg) => {
	console.log('useruphjvhjbjhbjh', msg);
	updateNewUser(msg.roomUser, msg.current);
});
