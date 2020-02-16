document.getElementById('chat').addEventListener('keypress', function (e) {
  if (e.key === 'Enter')
    sendMsg();
});
document.getElementById('btnSendMsg').addEventListener("click", sendMsg);

function sendMsg() {
	if (document.getElementById('chat').value.trim()!="") {
    const element = document.getElementById("msgChat");
    const isScroll = element.scrollHeight - element.clientHeight <= element.scrollTop + 1;

    msg = document.createElement('div');
		msg.className = 'msg-me';
		msg.innerHTML = document.getElementById('chat').value;
		document.getElementById('chat').value="";
		chat = document.getElementById('msgChat');
		chat.appendChild(msg);
    if (isScroll)
      updateScroll();
	}
}

function updateScroll(){
  const element = document.getElementById("msgChat");
  console.log(element.scrollTop);
  console.log(element.scrollHeight);

  element.scrollTop = element.scrollHeight;
}
