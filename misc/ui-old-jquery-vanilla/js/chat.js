$(document).ready(() => {
    updateScroll();
    $('#chat').keypress((e) => {
        if (e.keyCode == '13') { // touche entrer
            sendMsg()
            updateScroll();
        }
    });

    $('#btnSendMsg').click(() => {
        sendMsg()
        updateScroll();
    });
});


const newMessageSfx = new Howl({
    src: ['/audio/sfx/when.mp3'],
    autoplay: false,
    loop: false,
    volume: 0.5
});

socket.on('lobbyChatReceiveRes', (mess) => {
    if (mess.senderUserID != loggedUser._id) {
        newMessageSfx.play();
    }
    addMsg(mess.senderUserID, mess.content, mess.createdTime);
});

/** Fonction qui remet la barre de défilement en bas
*/
function updateScroll() {
    const element = document.getElementById('msgChat');
    element.scrollTop = element.scrollHeight;
}

/** Fonction qui envoie un message via socket
*/
function sendMsg() {
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
function addMsg(senderID, text, createdTime) {
    const element = document.getElementById('msgChat');
    const isScroll = element.scrollHeight - element.clientHeight <= element.scrollTop + 1;
    const msgClass = 'msg-' + (senderID === ID ? 'me' : 'other');
    const localeDate = new Date(createdTime).toLocaleString();
    const html = `
        <div class="` + msgClass + `" title="` + localeDate + `">
            <div class="msg-author">` + (senderID === -1 ? '[Serveur]' : idToNick(senderID)) + `</div>`
        + text +
        `</div>`;

    $('#msgChat').append(html);
    if (isScroll)
        updateScroll();
}

/**
 * Fonction qui affiche une offre d'enchère reçue
 * @param msg L'object message reçu par socket
 */
function addOfferMsg(senderID, text, createdTime, amount) {
    const element = document.getElementById('msgChat');
    const isScroll = element.scrollHeight - element.clientHeight <= element.scrollTop + 1;
    const localeDate = new Date(createdTime).toLocaleString();
    const html = `
        <div class="purchase-offer" title="` + localeDate + `">
            <div class="msg-author">Enchère</div>
            <span>` + (senderID === -1 ? '[Serveur]' : idToNick(senderID)) + `</span> propose de vous acheter ??? pour ` + amout + `€
			<div class="buttons-container">
                <div class="accept-button">accepter</div>
                <div class="deny-button">refuser</div>
            </div>
        </div>`;

    $('#msgChat').append(html);
    if (isScroll)
        updateScroll();
}
