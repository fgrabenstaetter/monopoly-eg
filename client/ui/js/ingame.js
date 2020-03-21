// RAPPEL VAR GLOBALES:
//     NICKNAME => mon pseudo
//     ID       => mon user/player ID

// données statiques de jeu (format: voir /socket_events.md)
let DATA = {
    players     : [],
    cells       : [],
    properties  : [],
    gameEndTime : null // timestamp de fin forcée du jeu
}

const PAWNS = ['tracteur', 'boat', 'moto', 'camion', 'montgolfiere', 'citroen C4', 'overboard', 'schoolbus'];


function nickToId (nick) {
    for (const i in DATA.players) {
        if (DATA.players[i].nickname == nick)
            return DATA.players[i].id;
    }
}

function idToNick (id) {
    for (const i in DATA.players) {
        if (DATA.players[i].id == id)
            return DATA.players[i].nickname;
    }
}

/////////////////////////////
// SOCKET EVENTS LISTENERS //
/////////////////////////////

socket.on('gameStartedRes', (data) => {
    DATA.players     = data.players;
    DATA.cells       = data.cells;
    DATA.properties  = data.properties;
    DATA.gameEndTime = data.gameEndTime;

    console.log('Le jeu a démarré !');
    console.log(data);

    // Génération de la liste de joueurs
    DATA.players.forEach((player) => {
        loaderPawn(PAWNS[player.pawn]);

        let html = `<div class="player-entry" data-id="`+player.id+`">
                        <div class="name" title="`+player.nickname+`">`+player.nickname+`</div>
                        <div class="money">0</div>
                        <div class="popup top" style="display: none;">
                        </div>
                </div>`;
        
        $('.player-list').append(html);
    });

    initProperty();
    setCurrentPlayer(DATA.players[0].id);
});

socket.on('gameTurnRes', (data) => {
    console.log(data);
    // PAS FORCÉMENT MON TOUR !  tester si data.playerID === ID
    console.log('C\'est au tour de ' + idToNick(data.playerID) + ' de jouer !');
    const turnTimeout = data.turnEndTime;
    // afficher décompte de temps du tour

    if (data.playerID === ID) {
        // C'est mon tour !
        alert("C'est mon tour !");
    }
});

socket.on('gameChatReceiveRes', (data) => {
    addMsg(data.playerID, data.text, data.createdTime);
});

socket.on('gameActionRes', (data) => {
    console.log("=== gameActionRes ===");
    console.log(data);

    alert("Action déclenchée par " + idToNick(data.playerID) + " => " + data.actionMessage);

    if (data.updateMoney) {
        data.updateMoney.forEach((row) => {
            setPlayerMoney(row.playerID, row.money);
        });
    }

    if (data.extra && data.extra.newCard) {
        alert("NOUVELLE CARTE => " + data.extra.newCard.type + " / " + data.extra.newCard.name + " / " + data.extra.newCard.name);
    }

    console.log("=== fin gameActionRes ===");
});


socket.emit('gameReadyReq'); // AUCUN EVENT SOCKET (ON) APRES CECI

////////////////////////////
// INTERFACE JS FUNCTIONS //
////////////////////////////

$(function(){
    $('.player-entry .name').attr('title', function(){
        return $(this).html();
    });
});

/**
 * Met à jour le solde d'un joueur sur l'UI
 * @param playerId id du joueur à mettre à jour
 * @param amount valeur du nouveau solde  
 */
function setPlayerMoney(playerId, amount) {
    $('.player-list .player-entry[data-id="'+playerId+'"] .money').html(amount);
}

/**
 * Met à jour le joueur courant sur l'interface (point affiché à côté du pseudo)
 * @param playerId ID du joueur courant 
 */
function setCurrentPlayer(playerId) {
    $('.player-list .player-entry').removeClass('current');
    $('.player-list .player-entry[data-id="'+playerId+'"]').addClass('current');
}

function addPurchaseOffer(id, name, roadName, price) {
    $("#msgChat").append(`
        <div class="purchase-offer" data-id="` + id + `">
            <span>` + name + `</span> propose de vous acheter ` + roadName + ` pour ` + price + `€
            <div class="buttons-container">
                <div class="accept-button">accepter</div>
                <div class="deny-button">refuser</div>
            </div>
        </div>`);

    bindOfferListener();
}

function addSaleOffer(id, name, roadName, price) {
    $("#msgChat").append(`
        <div class="sale-offer" data-id="` + id + `">
            <span>` + name + `</span> propose de vous vendre  ` + roadName + ` pour ` + price + `€
            <div class="buttons-container">
                <div class="accept-button">accepter</div>
                <div class="deny-button">refuser</div>
            </div>
        </div>`);

    bindOfferListener();
}

function bindOfferListener(){
    $('.accept-button').unbind();
    $('.deny-button').unbind();

    $('.accept-button').click(function () {
        let error = 0;
        let status;
        const id = $(this).parent().parent().attr('data-id');
        //if ($(this).parent().parent().hasClass('purchase-offer')) {
            alert('gameOfferAcceptReq a implementer');
            console.log('gameOfferAcceptReq');
        //}
        /*else {
            alert('gameOfferAcceptReq a implementer');
            console.log('gameOfferAcceptReq');
        }*/
        if (!error) {
            $(this).parent().parent().remove();
        }
        else {
            alert('erreur :' + status);
        }
    });


    $('.deny-button').click(function () {
        $(this).parent().parent().remove();
    });
}
