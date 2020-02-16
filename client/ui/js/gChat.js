document.getElementById('chat').addEventListener('keypress', function (e) {
    if (e.key === 'Enter') {
		sendMsg();
    }
});
document.getElementById('btnSendMsg').addEventListener("click", sendMsg);

function sendMsg() {
	if (document.getElementById('chat').value.trim()!="") {
		msg = document.createElement('div');
		msg.className = 'msg-me';
		msg.innerHTML = document.getElementById('chat').value;
		document.getElementById('chat').value="";
		chat = document.getElementById('msgChat');
		chat.appendChild(msg);
	}
}
