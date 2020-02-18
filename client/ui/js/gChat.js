const jwt = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjVlNGJlNDhiODZkOGJjNTliZjJkY2I5MiIsIm5pY2tuYW1lIjoidGVzdCIsImVtYWlsIjoiMTJib3Jpcy5mbGVzY2hAZ21haWwuY29tIiwiaWF0IjoxNTgyMDQwMDgwLCJleHAiOjE1ODIxMjY0ODB9.dW-raKEe0x7_0G_ExAmkSMErxCED6R6llE4OZHSoO08';

var socket = io.connect('http://localhost:3000', {
  'query': 'token=' + jwt
});

socket.on("error", function(error) {
  if (error.type == "UnauthorizedError" || error.code == "invalid_token") {
    // redirect user to login page perhaps?
    alert("User's token has expired");
  }
});

socket.on("unauthorized", function(error) {
  if (error.data.type == "UnauthorizedError" || error.data.code == "invalid_token") {
    alert("User's token has expired (invalid token)");
  }
});

// Requête HTTP AJAX - gChat
$(document).ready(function() {
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
