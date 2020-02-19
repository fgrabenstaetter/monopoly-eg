// Requête HTTP AJAX - gChat
$(document).ready(function() {
    updateScroll();
    $('#chat').keypress(function(e) {
      if (e.keyCode == '13') {
        sendMsg()
        updateScroll();
      }
    });

		$('#btnSendMsg').click(function() {
      sendMsg()
      updateScroll();
    });
});


/** Fonction qui affiche le message envoyer par le joueur sur le chat
 */
function sendMsg() {
  let chatMsg = document.getElementById('chat').value;

	if (chatMsg.trim()!="") {
    const element = document.getElementById("msgChat");

    msg = document.createElement('div');
		msg.className = 'msg-me';
		msg.innerHTML = `<div class="msg-author">Moi</div>`+ chatMsg;
		document.getElementById('chat').value="";
    chat = document.getElementById('msgChat');

    socket.emit('lobbyChatMessageReq', {content: chatMsg});

    chat.appendChild(msg);

  }
}

socket.on('lobbyChatMessageRes', (msg) => {
  const element = document.getElementById("msgChat");
  const isScroll = element.scrollHeight - element.clientHeight <= element.scrollTop + 1;
  let html = `<div class="msg-other"><div class="msg-author">` + msg.sender + `</div>` + msg.content + `</div>`;
  $('#msgChat').append(html);
  console.log(element);
  if (isScroll)
    updateScroll();
});

/** Fonction qui remet la barre de défilement en bas
 */
function updateScroll(){
  const element = document.getElementById("msgChat");
  element.scrollTop = element.scrollHeight;
}
