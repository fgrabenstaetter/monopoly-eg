$(document).ready( () => {

    updateScroll();
    $('#chat').keypress( (e) => {
        if (e.keyCode == '13') { // touche entrer
            sendMsg()
            updateScroll();
        }
    });

    $('#btnSendMsg').click( () => {
        sendMsg()
        updateScroll();
    });
});

socket.on('lobbyChatReceiveRes', (mess) => {
    console.log('lobbyChatReceiveRes');
    addMsg(mess.senderUserID, mess.content, mess.createdTime);
});

/** Fonction qui remet la barre de défilement en bas
*/
function updateScroll(){
    const element = document.getElementById('msgChat');
    element.scrollTop = element.scrollHeight;
}

/** Fonction qui envoie un message via socket
*/
function sendMsg () {
    const chatMsg = document.getElementById('chat');
    if (chatMsg.value.trim() != '') {
        const inGame = window.location.pathname === '/game';
        if (inGame)
            socket.emit('gameChatSendReq', { text: chatMsg.value });
        else // lobby
            socket.emit('lobbyChatSendReq', { content: chatMsg.value });
        chatMsg.value = '';
    }
}

/**
 * Fonction qui affiche un messag reçu
 * @param msg L'object message reçu par socket
 */
function addMsg (senderID, text, createdTime) {
    const element = document.getElementById('msgChat');
    const isScroll = element.scrollHeight - element.clientHeight <= element.scrollTop + 1;
    const msgClass = 'msg-' + (senderID === ID ? 'me' : 'other');
    const localeDate = new Date(createdTime).toLocaleString();
    const html = `
        <div class="` + msgClass + `" title="` + localeDate + `">
            <div class="msg-author">` + idToNick(senderID) + `</div>`
            + text +
        `</div>`;

    $('#msgChat').append(html);
    if (isScroll)
        updateScroll();
}
