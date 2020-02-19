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
    
    socket.emit('chat message', chatMsg);

    chat.appendChild(msg);
    
    updateScroll();
    }
}

socket.on('chat message', function(msg) {
  let html = `<div class="msg-other"><div class="msg-author">` + msg.author + `</div>` + msg.content + `</div>`;
  $('#msgChat').append(html);
  updateScroll();
});

/** Fonction qui remet la barre de défilement en bas
 */
function updateScroll(){
  const element = document.getElementById("msgChat");
  element.scrollTop = element.scrollHeight;
}
