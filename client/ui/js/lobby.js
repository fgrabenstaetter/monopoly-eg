let iAmHost = false

socket.on('lobbyCreatedRes', (res) => {
    console.log('lobbyCreatedRes: ' + Object.keys(res));
    iAmHost = true;
    // nb désiré de joueurs par défaut
    document.getElementById('nbJoueurs').textContent = res.targetUsersNb;

    // je suis l'hote => activer les flèches pour changer le nb désiré de joueurs
    $('#leftNbJ').click( () => {
        const nb = parseFloat(document.getElementById('nbJoueurs').textContent);
        if (nb > 2)
            socket.emit('lobbyChangeTargetUsersNbReq', { nb: nb - 1 });
    });

    $('#rightNbJ').click( () => {
        const nb = parseFloat(document.getElementById('nbJoueurs').textContent);
        if (nb < 8)
            socket.emit('lobbyChangeTargetUsersNbReq', { nb: nb + 1 });
    });
});

socket.on('lobbyJoinedRes', (res) => {
    console.log('lobbyJoinedRes: ' + Object.keys(res));
    // res.targetUsersNb
    // res.pawn = pion du joueur (non hôte)
    // res.players = liste des users présents (nickname + pion)
    // res.messages = liste des anciens messages du lobby (senderNickname + text + createdTime)

    // nb par défaut de joueurs désiré
    document.getElementById('nbJoueurs').textContent = res.targetUsersNb;

    for (const mess of res.messages)
        addMsg(mess)

    // non hôte => masquer les fleches du nombre de désiré joueur
    $('#leftNbJ, #rightNbJ').css('display', 'none');
});

socket.on('lobbyUserLeftRes', (res) => {
    console.log('lobbyUserLeftRes: ' + Object.keys(res));
});

socket.on('lobbyChatReceiveRes', (msg) => {
    console.log('lobbyChatReceiveRes');
    addMsg(msg);
});

socket.on('lobbyTargetUsersNbChangedRes', (res) => {
    document.getElementById('nbJoueurs').textContent = res.nb;
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
