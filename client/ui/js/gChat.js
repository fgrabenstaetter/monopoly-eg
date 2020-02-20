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
    var msg = document.createElement('div');
    msg.className = 'msg-me';

    var msgAuthor = document.createElement('div');
    msgAuthor.className = 'msg-author';
    msgAuthor.innerHTML = `<div class="msg-author">Moi</div>`;

    var msgContent = document.createElement('div');
    msgContent.innerText = chatMsg;

    msg.appendChild(msgAuthor);
    msg.appendChild(msgContent);

		document.getElementById('chat').value="";
    chat = document.getElementById('msgChat');

    socket.emit('lobbyChatSendReq', {content: chatMsg});
    chat.appendChild(msg);
  }
}

socket.on('lobbyChatReceiveRes', (msg) => {
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
