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
    const localeDate = new Date(msg.createdTime).toLocaleString();
    const html = `
        <div class="` + msgClass + `" title="` + localeDate + `">
            <div class="msg-author">` + msg.sender + `</div>`
            + msg.content +
        `</div>`;

    $('#msgChat').append(html);
    if (isScroll)
        updateScroll();
}
