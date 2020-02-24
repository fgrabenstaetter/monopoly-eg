socket.on('lobbyCreatedRes', (res) => {
    console.log('lobbyCreatedRes');
});

socket.on('lobbyJoinedRes', (res) => {
    console.log('lobbyJoinedRes');
});

socket.on('lobbyChatReceiveRes', (msg) => {
    const element = document.getElementById("msgChat");
    const isScroll = element.scrollHeight - element.clientHeight <= element.scrollTop + 1;
    let html = `<div class="msg-other"><div class="msg-author">` + msg.sender + `</div>` + msg.content + `</div>`;
    $('#msgChat').append(html);
    if (isScroll)
        updateScroll();
});

$(document).ready( () => {

    updateScroll();
    $('#friendBar').keyup( (e) => {
        let input, filter, element, a, i, txtValue;
        input = document.getElementById("friendBar");
        filter = input.value.toUpperCase();
        console.log(filter);
        element = document.getElementsByClassName("friend-entry");
        for (i = 0; i < element.length; i++) {
            txtValue = element[i].innerHTML;
            if (txtValue.toUpperCase().indexOf(filter) > -1)
                element[i].style.display = "";
            else
                element[i].style.display = "none";
        }
    });

    $('#chat').keypress( (e) => {
        if (e.keyCode == '13') {
            sendMsg()
            updateScroll();
        }
    });

    $('#btnSendMsg').click( () => {
        sendMsg()
        updateScroll();
    });

    $('#leftNbJ').click( () => {
        leftNbJ();
    });

    $('#rightNbJ').click( () => {
        rightNbJ();
    });
})

/** Fonction qui affiche le message envoyer par le joueur sur le chat
*/
function sendMsg() {
    let chatMsg = document.getElementById('chat').value;

    if (chatMsg.trim()!="") {
        let msg = document.createElement('div');
        msg.className = 'msg-me';

        let msgAuthor = document.createElement('div');
        msgAuthor.className = 'msg-author';
        msgAuthor.innerHTML = `<div class="msg-author">Moi</div>`;

        let msgContent = document.createElement('div');
        msgContent.innerText = chatMsg;

        msg.appendChild(msgAuthor);
        msg.appendChild(msgContent);

        document.getElementById('chat').value="";
        chat = document.getElementById('msgChat');

        socket.emit('lobbyChatSendReq', {content: chatMsg});
        chat.appendChild(msg);
    }
}

/** Fonction qui remet la barre de défilement en bas
*/
function updateScroll(){
    const element = document.getElementById("msgChat");
    element.scrollTop = element.scrollHeight;
}

/** Fonction qui decremente le nombre de joueur
*/
function leftNbJ() {
    let nb = parseFloat(document.getElementById('nbJoueurs').innerHTML);
    if (nb > 2) {
        nb--;
        document.getElementById('nbJoueurs').innerHTML = nb;
    }
}

/** Fonction qui incermente le nombre de joueur
*/
function rightNbJ() {
    let nb = parseFloat(document.getElementById('nbJoueurs').innerHTML);
    if (nb < 8) {
        nb++;
        document.getElementById('nbJoueurs').innerHTML = nb;
    }
}
