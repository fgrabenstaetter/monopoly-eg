// Requête HTTP AJAX - gChat
$(document).ready(function() {
    updateScroll();
    $('#chat').keypress(function(e) {
      if (e.keyCode == '13') {
        if ($('#chat').val().trim()!="") {
          $.post(urlApi,
            {
              user: $('#nickname-input').val(),
              msg: $('#chat').val()
            }, sendMsg())
        }
      }
    });

		$('#btnSendMsg').click(function() {
      if ($('#chat').val().trim()!="") {
        $.post(urlApi,
          {
            user: $('#nickname-input').val(),
            msg: $('#chat').val()
          }, sendMsg())
      }
    });

    $.get(urlApi,function(data, status){
      const element = document.getElementById("msgChat");
      const isScroll = element.scrollHeight - element.clientHeight <= element.scrollTop + 1;

      msg = document.createElement('div');
  		msg.className = 'msg-other';
  		msg.innerHTML = data;
  		chat = document.getElementById('msgChat');
  		chat.appendChild(msg);
      if (isScroll)
        updateScroll();
    });
});

/** Fonction qui affiche le message envoyer par le joueur sur le chat
 */
function sendMsg() {
	if (document.getElementById('chat').value.trim()!="") {
    const element = document.getElementById("msgChat");

    msg = document.createElement('div');
		msg.className = 'msg-me';
		msg.innerHTML = document.getElementById('chat').value;
		document.getElementById('chat').value="";
		chat = document.getElementById('msgChat');
		chat.appendChild(msg);
    updateScroll();
    }
}

/** Fonction qui remet la barre de défilement en bas
 */
function updateScroll(){
  const element = document.getElementById("msgChat");
  console.log(element.scrollTop);
  console.log(element.scrollHeight);

  element.scrollTop = element.scrollHeight;
}
