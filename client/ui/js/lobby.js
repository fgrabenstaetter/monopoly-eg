socket.on('lobbyCreatedRes', (res) => {
    console.log('lobbyCreatedRes: ' + Object.keys(res));
});

socket.on('lobbyJoinedRes', (res) => {
    console.log('lobbyJoinedRes: ' + Object.keys(res));
    // res.targetUsersNb
    // res.pawn = pion du joueur (non hôte)
    // res.players = liste des users présents (nickname + pion)
    // res.messages = liste des anciens messages du lobby (senderNickname + text + createdTime)
    for (const mess of res.messages)
        addMsg(mess)
});

socket.on('lobbyUserLeftRes', (res) => {
    console.log('lobbyUserLeftRes: ' + Object.keys(res));
});

socket.on('lobbyChatReceiveRes', (msg) => {
    console.log('lobbyChatReceiveRes');
    addMsg(msg);
});

$(document).ready( () => {

    updateScroll();
    $('#friendBar').keyup((e) => {
        let input, filter, element, a, i, txtValue;
        input = document.getElementById('friendBar');
        filter = input.value.toUpperCase();
        element = document.getElementsByClassName('friend-entry');
        for (i = 0; i < element.length; i++) {
            txtValue = element[i].getElementsByClassName('friends-name')[0].innerHTML;
            if (txtValue.toUpperCase().indexOf(filter) > -1)
                element[i].style.display = '';
            else
                element[i].style.display = 'none';
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
});

/** Fonction qui envoie un message via socket
*/
function sendMsg () {
    const chatMsg = document.getElementById('chat');
    if (chatMsg.value.trim() != '') {
        socket.emit('lobbyChatSendReq', {content: chatMsg.value});
        chatMsg.value = '';
    }
}

/**
 * Fonction qui affiche un messag reçu
 * @param msg L'object message reçu par socket
 */
function addMsg (msg) {
    const element = document.getElementById('msgChat');
    const isScroll = element.scrollHeight - element.clientHeight <= element.scrollTop + 1;
    const msgClass = 'msg-' + (msg.sender === NICKNAME ? 'me' : 'other');
    const html = `
        <div class="` + msgClass + `">
            <div class="msg-author">` + msg.sender + `</div>`
            + msg.content +
        `</div>`;

    $('#msgChat').append(html);
    if (isScroll)
        updateScroll();
}

/** Fonction qui remet la barre de défilement en bas
*/
function updateScroll(){
    const element = document.getElementById('msgChat');
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
