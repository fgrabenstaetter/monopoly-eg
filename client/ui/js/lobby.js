// Fonction d'ajout d'un message d'invitation d'ami
function friendRequest(id, name) {
    $(".friends-entries-container").prepend("<div class=\"friend-request\"> <div class=\"friend-request-text\"><span data-id=\"" + id + "\">" + name + "</span> souhaite vous ajouter à sa liste d'amis</div><div class=\"accept-button\">accepter</div><div class=\"deny-button\">refuser</div></div>");
}

$(function () {
    $("#friend-request-trigger").click(function () {
        friendRequest(2, "FullMerinos");
    });
});

// Fonction ajout d'un ami dans la liste d'amis
function addFriend(id, name, avatar) {
    $(".friends-entries-container").append('<div class="friend-entry"><img class="friends-avatar" src=' + avatar + '><div class="friends-name" data-id="' + id + '">' + name + '</div><div class="friend-action">inviter</div></div>')
}

$(function () {
    $("#add-friend-trigger").click(function () {
        addFriend(2, "FullMerinos", "img/ui/avatar1.jpg");
    });
});

// Animation bouton JOUER pendant matchmaking
$(function () {
    $("#play").click(function () {
        if ($("#play").hasClass("loading")) {
            $(this).removeClass("loading");
        }
        else {
            $(this).addClass("loading");
        }
    });
});


// ??
let users = []; // = liste de { nickname: string, id: int }
function nickToId(nick) {
    for (const row of users) {
        if (row.nickname === nick)
            return row.id;
    }
}
function idToNick(id) {
    for (const row of users) {
        if (row.id === id)
            return row.nickname;
    }
}

let hostID;
// désactivers/masquer certaines actions/elements par défaut (et réactiver si hôte ensuite)
$('#leftNbJ, #rightNbJ').css('display', 'none'); // afficher que si hote
$('#play').addClass('disabled'); // seulement l'hôte peut lancer la partie !

/////////////////////////////
// SOCKET EVENTS LISTENERS //
/////////////////////////////

socket.on('lobbyCreatedRes', (res) => {
    console.log('lobbyCreatedRes: ' + Object.keys(res));
    hostID = ID;
    // nb désiré de joueurs par défaut
    document.getElementById('nbJoueurs').textContent = res.targetUsersNb;

    // je suis l'hote => activer les flèches pour changer le nb désiré de joueurs
    imHost();
    users.push({ nickname: NICKNAME, id: ID });
    addGroupUser(ID, res.pawn);
});

socket.on('lobbyJoinedRes', (res) => {
    console.log('lobbyJoinedRes: ' + Object.keys(res));
    console.log(res);
    // res.targetUsersNb
    // res.pawn = pion du joueur (non hôte)
    // res.users = liste des users présents (nickname + pion)
    // res.messages = liste des anciens messages du lobby (senderNickname + text + createdTime)

    // nb par défaut de joueurs désiré
    document.getElementById('nbJoueurs').textContent = res.targetUsersNb;

    // l'hote est le premier user de la liste res.users
    hostID = res.users[0].id;

    for (const usr of res.users) {
        users.push(usr);
        addGroupUser(usr.id, usr.pawn);
    }

    for (const mess of res.messages)
        addMsg(mess.senderUserID, mess.content, mess.createdTime);
});

/** Système de gestion d'amis
 * Vocabulaire :
 *  Pending: demande reçue besoin de valider/refuser
 *  Requested : demande envoyée en attente de validation/refus
 */
// demande de la liste d'amis
socket.emit('lobbyFriendListReq');
socket.on('lobbyFriendListRes', (res) => {
    console.log("========== lobbyFriendListRes==============")
    console.log(res);
    if (res.friends.length != 0)
        for (let i = 0; i < res.friends.length; i++) {
            addFriend(res.friends[i].id, res.friends[i].nickname, "img/ui/avatar1.jpg");
        }
})

socket.emit('lobbyPendingFriendListReq');
socket.on('lobbyPendingFriendListRes', (res) => {
    console.log("========== lobbyPendingFriendListRes ==============")
    console.log(res);
    if (res.friends.length != 0)
        for (let i = 0; i < res.friends.length; i++) {
            friendRequest(res.friends[i].id, res.friends[i].nickname);
        }
})

socket.emit('lobbyRequestedFriendListReq');
socket.on('lobbyRequestedFriendListRes', (res) => {
    console.log("========== lobbyRequestedFriendListRes ==============")
    console.log(res);
})


/** Système d'interactions avec les amis
 */

// récéption d'une demande d'ami
socket.on('lobbyFriendInvitationReceivedRes', (res) => {
    console.log("lobbyFriendInvitationReceivedRes =>");
    console.log(res);
    friendRequest(res.id, res.nickname);
});

//Invitation d'un amis pour rejoindre son lobby
socket.on('lobbyInvitationReceivedRes', (res) => {
    console.log("lobbyInvitationReceivedRes reçu -> besoin du nickname du friend")
    lobbyInvitation(res.invitationID, "senderFriendNickname");
});


/**Gestion du lobby
 */
socket.on('lobbyUserJoinedRes', (res) => {
    console.log('[Lobby] ' + res.nickname + 'a rejoin !');
    users.push({ nickname: res.nickname, id: res.id });
    addGroupUser(res.id, res.pawn);

    const nb = parseInt(document.getElementById('nbJoueurs').textContent);
    const nbUsers = parseInt(document.getElementsByClassName('group-entry').length);
    if (nb < nbUsers)
        document.getElementById('nbJoueurs').textContent = nb + 1

    if (hostID === ID)
        updateNbUsersArrows();
});

socket.on('lobbyUserLeftRes', (res) => {
    console.log('[Lobby] ' + idToNick(res.userID) + ' est parti !');
    if (res.userID === ID) {
        // j'ai été KICK
        window.location = '/lobby';
        return;
    }

    if (hostID !== res.hostID) {
        // ...=> changement d'hote
    }

    hostID = res.hostID;
    console.log('newhost = ' + idToNick(res.hostID))

    // supprimer de la liste dans grouplist
    delGroupUser(res.userID);

    if (hostID === ID)
        imHost();
});

socket.on('lobbyChatReceiveRes', (mess) => {
    console.log('lobbyChatReceiveRes');
    addMsg(mess.senderUserID, mess.content, mess.createdTime);
});

socket.on('lobbyTargetUsersNbChangedRes', (res) => {
    document.getElementById('nbJoueurs').textContent = res.nb;

    if (hostID === ID)
        updateNbUsersArrows();
});

socket.on('lobbyPlayRes', (res) => {
    if (res.error === 0)
        window.location = '/game';
    else // hôte uniquement
        alert(res.status);
});

/**Vérifications des Res asynchrones 
*/
socket.on('lobbyFriendInvitationSendRes', (res) => {
    if (res.error === 0)
        console.log("lobbyFriendInvitationSendRes")
    else // hôte uniquement
        alert(res.status);
});

socket.on("lobbyInvitationRes", (res) => {
    if (res.error === 0)
        console.log("lobbyInvitationRes")
    else // hôte uniquement
        alert(res.status);
});

socket.on("lobbyFriendInvitationActionRes", (res) => {
    if (res.error === 0)
        console.log("lobbyFriendInvitationActionRes")
    else // hôte uniquement
        alert(res.status);
});

socket.on("lobbyInvitationAcceptRes", (res) => {
    if (res.error === 0)
        console.log("lobbyInvitationAcceptRes")
    else // hôte uniquement
        alert(res.status);
});

socket.on("lobbyFriendInvitationAcceptedRes", (res) => {

    console.log("lobbyFriendInvitationAcceptedRes");
    addFriend(res.id, res.nickname, "img/ui/avatar1.jpg");

});

socket.emit('lobbyReadyReq'); // AUCUN EVENT SOCKET (ON) APRES CECI

////////////////////////////
// INTERFACE JS FUNCTIONS //
////////////////////////////

$(document).ready(() => {

    // $('.progress-button').progressInitialize();
    $('#friendBar').keyup((e) => {
        let input, filter, element, a, i, txtValue;
        input = document.getElementById('friendBar');
        filter = input.value;
        if (e.keyCode == '13') {
            /**
            * recherche d'un nouvel ami
            * nom de l'ami stocker dans filter
            */
            socket.emit('lobbyFriendInvitationSendReq', { nickname: filter });
            console.log("lobbyFriendInvitationSendReq");
        }
        else {
            element = document.getElementsByClassName('friend-entry');
            for (i = 0; i < element.length; i++) {
                txtValue = element[i].getElementsByClassName('friends-name')[0].innerHTML;
                if (txtValue.toUpperCase().indexOf(filter.toUpperCase()) > -1)
                    element[i].style.display = '';
                else
                    element[i].style.display = 'none';
            }
        }
    });

    $('#play').click(() => {
        if (hostID === ID)
            socket.emit('lobbyPlayReq');
    });

    $('#submitButton').click(function (e) {
        e.preventDefault();

        // This function will show a progress meter for
        // the specified amount of time

        $(this).progressTimed(2);
    });
});

/**
 * Maj des flèches de changement du nombre désiré de users (que pour l'hote)
 */
function updateNbUsersArrows() {
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
function imHost() {
    console.log('je suis hote')
    updateNbUsersArrows();
    $('#play').removeClass('disabled');

    $('#leftNbJ').click(() => {
        const nb = parseFloat(document.getElementById('nbJoueurs').textContent);
        if (nb > 2 && nb > document.getElementsByClassName('group-entry').length)
            socket.emit('lobbyChangeTargetUsersNbReq', { nb: nb - 1 });
    });

    $('#rightNbJ').click(() => {
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

    $('.notification-container .btn-primary').unbind();
    $('.notification-container .btn-secondary').unbind();


    //lobbyInvitationAcceptReq
    $('.notification-container .btn-primary').click(function () {
        const invitationID = $(this).parent().parent().attr('id');
        let error = 0;
        let status = 100;


        socket.emit("lobbyInvitationAcceptReq", invitationID);
        console.log("lobbyInvitationAcceptReq");



        if (!error) {
            $(this).parent().parent().remove();
        }
        else {
            alert("erreur : " + status)
        }
    });

    //lobbyInvitationDeny
    $('.notification-container .btn-secondary').click(function () {
        $(this).parent().parent().remove();
    });
}


/**
 * Cree et affiche une demande d'ami
 * @param id Identifiant de l'invitation
 * @param name Nom de la personne qui a inviter le joueur
 */
function friendRequest(id, name) {
    $(".friends-entries-container").prepend("<div class=\"friend-request\"> <div class=\"friend-request-text\"><span data-id=\"" + id + "\">" + name + "</span> souhaite vous ajouter à sa liste d'amis</div><div class=\"accept-button\">accepter</div><div class=\"deny-button\">refuser</div></div>");
    const mid = id
    console.log("mid : " + mid + " id : " + $(this).parent());
    console.log($(this).parent());
    if ($(this).parent().attr('id') == mid) {
        console.log("ok");
    }

    $('.friend-request .accept-button').unbind();
    $('.friend-request .deny-button').unbind();

    //lobbyInvitationAcceptReq
    //lobbyFriendInvitationRes Acceptation
    $('.friend-request .accept-button').click(function () {
        const senderNickname = $(this).parent().find(".friend-request-text span").text();
        const action = 'accept';
        let error = 0;
        let status = 100;

        socket.emit("lobbyFriendInvitationActionReq", { action: 1, nickname: senderNickname });
        console.log("lobbyFriendInvitationActionReq");

        if (!error) {
            $(this).parent().remove();
            socket.emit('lobbyFriendListReq');
        }
        else {
            alert("erreur : " + status)
        }

    });

    // lobbyFriendInvitationRes Deny
    $('.friend-request .deny-button').click(function () {
        const senderNickname = $(this).parent().find(".friend-request-text span").text()
        const action = 'reject';
        let error = 0;
        let status = 100;

        socket.emit("lobbyFriendInvitationActionReq", { action: 0, nickname: senderNickname });
        console.log("lobbyFriendInvitationActionReq");

        if (!error) {
            $(this).parent().remove();
        }
        else {
            alert("erreur : " + status)
        }
    });
}

/**
 * Cree et affiche un ami dans la liste des amis
 * @param id Identifiant de l'ami
 * @param name Nom de l'ami
 * @param avatar Avatar de l'ami
 */
// Fonction ajout d'un ami dans la liste d'amis
function addFriend(id, name, avatar) {
    $(".friends-entries-container").append('<div class="friend-entry"><img class="friends-avatar" src=' + avatar + ' data-toggle="modal" data-target="#' + name + 'Modal"><div class="friends-name" data-id="' + id + '">' + name + '</div><div class="friend-action">inviter</div></div>');

    $(".modal-container").append('<div class="modal fade" id="' + name + 'Modal" tabindex="-1" role="dialog" aria-labelledby="' + name + 'ModalLabel" aria-hidden="true" data-id="' + id + '"><div class="modal-dialog" role="document"><div class="modal-content"><div class="modal-header"><h5 class="modal-title" id="' + name + 'ModalLabel">' + name + '</h5><button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button></div><div class="modal-body"><button class="btn btn-danger delete-friend-button" data-id="' + id + '">supprimer</button></div><div class="modal-footer"><button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button><button type="button" class="btn btn-primary">Save changes</button></div></div></div></div>')

    $('.friend-entry .friend-action').unbind();
    $('.delete-friend-button').unbind();

    //lobbyInvitationReq
    $('.friend-entry .friend-action').click(function () {
        let friendName = $(this).prev('.friends-name').text();
        let friendID = $(this).parent().find('.friends-name').attr('data-id');
        console.log("oui" + friendID);
        socket.emit("lobbyInvitationReq", { friendID: friendID });
        console.log("lobbyInvitationReq");

    });

    $('.delete-friend-button').click(function () {
        const friendID = $(this).parent().find('.friends-name').attr('data-id');
        let error = 0;
        let status = 100;
        alert("lobbyFriendDeleteReq a implementer")
        console.log("lobbyFriendDeleteReq");

        if (!error) {
            $('#' + name + 'Modal').hide();
            //$(this).parent().remove();
            //$('#' + name + 'Modal').remove();
        }
    });
}

function addGroupUser(id, pawn) {
    const shouldDisplayKickButton = ID === hostID && id !== ID;
    const isHost = id === hostID;
    const html = `
        <div class="group-entry` + (isHost ? ' leader' : '') + `">
            <img class="friends-avatar" src="img/ui/avatar1.jpg">
            <div class="friends-name">` + idToNick(id) + `</div>
            <div class="friend-action" style="display: ` + (shouldDisplayKickButton ? 'block' : 'none') + `;">exclure</div>
        </div>`;

    $('.grouplist .group-entries-container > div').append(html);

    $('.grouplist .friend-action').unbind();

    // actualisation de l'event click (car html modifié)
    $('.grouplist .friend-action').click(function () {
        // = bouton EXCLURE (uniquement si hôte)
        socket.emit('lobbyKickReq', { userToKickID: id });
    });
}

function delGroupUser(id) {
    const nick = idToNick(id);
    const els = document.querySelectorAll('.grouplist .friends-name');
    for (const el of els) {
        if (el.textContent === nick) {
            el.parentNode.parentNode.removeChild(el.parentNode);
            break;
        }
    }
}

// exemple
lobbyInvitation(0, "biloute");
