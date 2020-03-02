let hostNickname;
// désactivers/masquer certaines actions/elements par défaut (et réactiver si hôte ensuite)
$('#leftNbJ, #rightNbJ').css('display', 'none'); // afficher que si hote
$('#play').addClass('disabled'); // seulement l'hôte peut lancer la partie !
lobbyInvitation('1', 'FullMerinos')

/////////////////////////////
// SOCKET EVENTS LISTENERS //
/////////////////////////////

socket.on('lobbyCreatedRes', (res) => {
    console.log('lobbyCreatedRes: ' + Object.keys(res));
    hostNickname = NICKNAME;
    // nb désiré de joueurs par défaut
    document.getElementById('nbJoueurs').textContent = res.targetUsersNb;

    // je suis l'hote => activer les flèches pour changer le nb désiré de joueurs
    imHost();
    addGroupUser(NICKNAME, res.pawn);
});

socket.on('lobbyJoinedRes', (res) => {
    console.log('lobbyJoinedRes: ' + Object.keys(res));
    // res.targetUsersNb
    // res.pawn = pion du joueur (non hôte)
    // res.users = liste des users présents (nickname + pion)
    // res.messages = liste des anciens messages du lobby (senderNickname + text + createdTime)

    // nb par défaut de joueurs désiré
    document.getElementById('nbJoueurs').textContent = res.targetUsersNb;

    for (const mess of res.messages)
        addMsg(mess)

    // l'hote est le premier user de la liste res.users
    hostNickname = res.users[0].nickname;

    for (const usr of res.users)
        addGroupUser(usr.nickname, usr.pawn);
});

socket.on('lobbyUserJoinedRes', (res) => {
    console.log('[Lobby] ' + res.nickname + 'a rejoin !');
    addGroupUser(res.nickname, res.pawn);
});

socket.on('lobbyUserLeftRes', (res) => {
    console.log('[Lobby] ' + res.nickname + ' est parti !');
    if (res.nickname === NICKNAME) {
        // j'ai été KICK
        window.location = '/lobby';
        return;
    }

    if (hostNickname !== res.host) {
        // ...=> changement d'hote
    }
    hostNickname = res.host;
    console.log('newhost = ' + res.host)
    if (hostNickname === NICKNAME)
        imHost();

    // supprimer de la liste dans grouplist
    delGroupUser(res.nickname);
});

socket.on('lobbyChatReceiveRes', (msg) => {
    console.log('lobbyChatReceiveRes');
    addMsg(msg);
});

socket.on('lobbyTargetUsersNbChangedRes', (res) => {
    document.getElementById('nbJoueurs').textContent = res.nb;

    if (hostNickname === NICKNAME)
        updateNbUsersArrows();
});

socket.on('lobbyPlayRes', (res) => {
    if (res.error === 0)
        window.location = '/game';
    else // hôte uniquement
        alert(res.status);
});

socket.emit('lobbyReadyReq'); // AUCUN EVENT SOCKET (ON) APRES CECI

////////////////////////////
// INTERFACE JS FUNCTIONS //
////////////////////////////

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
        if (e.keyCode == '13') { // touche entrer
            sendMsg()
            updateScroll();
        }
    });

    $('#btnSendMsg').click( () => {
        sendMsg()
        updateScroll();
    });

    $('#play').click( () => {
        if (imHost)
            socket.emit('lobbyPlayReq');
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

/** Fonction qui remet la barre de défilement en bas
*/
function updateScroll(){
    const element = document.getElementById('msgChat');
    element.scrollTop = element.scrollHeight;
}

/**
 * Maj des flèches de changement du nombre désiré de users (que pour l'hote)
 */
function updateNbUsersArrows () {
    $('#leftNbJ').css('display', '');
    $('#rightNbJ').css('display', '');
    const nb = parseInt(document.getElementById('nbJoueurs').textContent);
    if (nb === 2 || nb === document.getElementsByClassName('group-entry').length)
        $('#leftNbJ').css('display', 'none');
    else if (nb === 8)
        $('#rightNbJ').css('display', 'none');
}

/**
 * Actions possibles lorsqu'on est hôte
 */
function imHost () {
    console.log('je suis hote')
    updateNbUsersArrows();
    $('#play').removeClass('disabled');

    $('#leftNbJ').click( () => {
        const nb = parseFloat(document.getElementById('nbJoueurs').textContent);
        if (nb > 2 && nb > document.getElementsByClassName('group-entry').length)
            socket.emit('lobbyChangeTargetUsersNbReq', { nb: nb - 1 });
    });

    $('#rightNbJ').click( () => {
        const nb = parseFloat(document.getElementById('nbJoueurs').textContent);
        if (nb < 8)
            socket.emit('lobbyChangeTargetUsersNbReq', { nb: nb + 1 });
    });

    // maj l'icone leader et les boutons exclure du groupe de lobby
    $('.grouplist .friend-action').css('display', '');
    const els = document.querySelectorAll('.grouplist .friends-name');
    for (const el of els) {
        if (el.textContent === NICKNAME) {
            if (!el.parentNode.classList.contains('leader'))
                el.parentNode.classList.add('leader');
            el.parentNode.querySelector('.friend-action').style.display = 'none';
            break;
        }
    }
}

/**
 * Cree et affiche une invitation recu à rejoindre une partie
 * @param invitationID Identifiant de l'invitation pour rejoindre une partie
 * @param senderFriendNickname Nom de la personne qui a inviter le joueur
 */
function lobbyInvitation(invitationID, senderFriendNickname) {
    const html = `
        <div class="card notification" id="` + invitationID + `">
            <div class="card-header">
                INVITATION
            </div>
            <div class="card-body">
                <p class="card-text">`+ senderFriendNickname + ` vous invite à rejoindre sa partie</p>
                <button class="btn btn-primary">ACCEPTER</button>
                <button class="btn btn-secondary">REFUSER</button>
            </div>
        </div>`;

    $('#inviteGameContainer').append(html);

    $('.notification-container .btn-primary').click(function() {
        const invitationID = $(this).parent().parent().attr('id');
        let error = 0;
        let status = 100;
        alert("A implementer");


        if (!error) {
            $(this).parent().parent().remove();
        }
        else {
            alert("erreur : " + status)
        }
    });

    $('.notification-container .btn-secondary').click(function() {
        $(this).parent().parent().remove();
    });
}

function addGroupUser (nickname, pawn) {
    if (nickname === hostNickname) {
        // ajouter marqueur HOTE
    }

    if (nickname === NICKNAME) {
        // ajouter marqueur MOI
    }

    const shouldDisplayKickButton = NICKNAME === hostNickname && nickname !== NICKNAME;
    const isHost = nickname === hostNickname;
    const html = `
        <div class="group-entry` + (isHost ? ' leader' : '') + `">
            <img class="friends-avatar" src="img/ui/avatar1.jpg">
            <div class="friends-name">` + nickname + `</div>
            <div class="friend-action" style="display: ` + (shouldDisplayKickButton ? 'block' : 'none') + `;">exclure</div>
        </div>`;

    $('.grouplist .group-entries-container > div').append(html);

    // actualisation de l'event click (car html modifié)
    $('.grouplist .friend-action').click(function() {
        // = bouton EXCLURE
        // Uniquement si HÔTE
        const nick = $(this).parent().find('.friends-name').text();
        socket.emit('lobbyKickReq', { userToKickNickname: nick });
    });
}

function delGroupUser (nickname) {
    const els = document.querySelectorAll('.grouplist .friends-name');
    for (const el of els) {
        if (el.textContent === nickname) {
            el.parentNode.parentNode.removeChild(el.parentNode);
            break;
        }
    }
}

$('.friendList .friend-action').click(function() {
    let friendName = $(this).prev('.friends-name').text();

    alert("A implementer...");
});

$('.friend-request-accept').click(function() {
    const senderNickname = $(this).parent().attr('id');
    const action = 'accept';
    let error = 0;
    let status = 100;

    alert("A implementer");

    if (!error) {
        $(this).parent().remove();
    }
    else {
        alert("erreur : " + status)
    }

});

$('.friend-request-deny').click(function() {
    const senderNickname = $(this).parent().attr('id');
    const action = 'reject';
    let error = 0;
    let status = 100;

    alert("A implementer");

    if (!error) {
        $(this).parent().remove();
    }
    else {
        alert("erreur : " + status)
    }
});
