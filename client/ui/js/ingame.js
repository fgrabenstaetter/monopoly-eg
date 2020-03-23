// RAPPEL VAR GLOBALES:
//     NICKNAME => mon pseudo
//     ID       => mon user/player ID

// données statiques de jeu (format: voir /socket_events.md)
let DATA = {
    players: [],
    cells: [],
    properties: [],
    gameEndTime: null, // timestamp de fin forcée du jeu
    turnTimeSeconds: null
};

const PAWNS = ['tracteur', 'boat', 'moto', 'camion', 'montgolfiere', 'citroen C4', 'overboard', 'schoolbus'];


function nickToId(nick) {
    for (const i in DATA.players) {
        if (DATA.players[i].nickname == nick)
            return DATA.players[i].id;
    }
    return null;
}

function idToNick(id) {
    for (const i in DATA.players) {
        if (DATA.players[i].id == id)
            return DATA.players[i].nickname;
    }
    return null;
}

function getPlayerById(id) {
    for (const i in DATA.players) {
        if (DATA.players[i].id == id)
            return DATA.players[i];
    }
    return null;
}

function getCellById(id) {
    for (const i in DATA.cells) {
        if (DATA.cells[i].id == id)
            return DATA.cells[i];
    }
    return null;
}

function getPropertyById(id) {
    for (const i in DATA.properties) {
        if (DATA.properties[i].id == id)
            return DATA.properties[i];
    }
    return null;
}

function getPropertyByCellId(cellId) {
    let cell = getCellById(cellId);
    for (const i in DATA.properties) {
        if (DATA.properties[i].id == cell.propertyID)
            return DATA.properties[i];
    }
    return null;
}

function getCellByProperty(property) {
    for (const i in DATA.cells) {
        if (DATA.cells[i].propertyID == property.id)
            return DATA.cells[i];
    }
    return null;
}

/////////////////////////////
// SOCKET EVENTS LISTENERS //
/////////////////////////////

socket.on('gameStartedRes', (data) => {
    DATA.players = data.players;
    DATA.cells = data.cells;
    DATA.properties = data.properties;
    DATA.gameEndTime = data.gameEndTime;
    DATA.turnTimeSeconds = data.turnTimeSeconds - 2; // Marge de 2 secondes

    console.log('Le jeu a démarré !');
    console.log(data);

    // Génération de la liste de joueurs
    DATA.players.forEach((player) => {
        loaderPawn(PAWNS[player.pawn]);

        generatePlayerEntry(player.id, player.nickname, data.playersMoney);
    });

    initProperty();
});

socket.on('gameTurnRes', (data) => {
    console.log(data);

    // On vide toutes les notifications (au cas-où)
    $('.notification-container > .col-md-12').empty();

    const turnTimeout = data.turnEndTime;
    // afficher décompte de temps du tour
    setCurrentPlayer(data.playerID);

    if (data.playerID === ID) {
        console.log('C\'est à mon tour de jouer !');

        console.log("[BOUTON D'ACTION] Initialisation");
        $('#timer').progressInitialize();
        console.log("[BOUTON D'ACTION] Passage en timer");
        $('#timer').progressTimed(DATA.turnTimeSeconds);
    } else {
        console.log('C\'est au tour de ' + idToNick(data.playerID) + ' de jouer !');
        console.log("[BOUTON D'ACTION] Passage en attente");
        $('#timer').progressFinish();
    }
});


socket.on('gameActionRes', (data) => {
    console.log("=== gameActionRes ===");
    console.log(data);

    console.log("Action déclenchée par " + idToNick(data.playerID) + " => " + data.actionMessage);

    let totalDices = data.dicesRes[0] + data.dicesRes[1];
    console.log(idToNick(data.playerID) + " a fait un " + totalDices.toString() + " avec les dés et se rend à la case " + data.cellPos);

    // Lancement de l'animation des dés
    triggerDices(data.dicesRes[0], data.dicesRes[1], () => {// Déplacement du pion du joueur

        // movement(PAWNS[getPlayerById(data.playerID).pawn], data.cellPos);
        console.log("movement(" + PAWNS[getPlayerById(data.playerID).pawn] + ", " + data.cellPos.toString() + ");");
        movement(PAWNS[getPlayerById(data.playerID).pawn], data.cellPos.toString(), function () {
            // Mise à jour des soldes (le cas échéant)
            if (data.updateMoney) {
                data.updateMoney.forEach((row) => {
                    setPlayerMoney(row.playerID, row.money);
                });
            }

            // Affichage de la carte (le cas échéant)
            if (data.extra && data.extra.newCard) {
                alert("NOUVELLE CARTE => " + data.extra.newCard.type + " / " + data.extra.newCard.name + " / " + data.extra.newCard.name);
            }

            // Récupération de la propriété sur laquelle le joueur est tombé (le cas échéant)
            let property = getPropertyByCellId(data.cellPos);

            let afficherMessageAction = false;
            // asyncRequestType à gérer ici
            if (data.asyncRequestType && property) {
                if (data.asyncRequestType == "canBuy") {
                    let price = data.asyncRequestArgs[0];
                    if (data.playerID == ID)
                        createCard(property.id, property.color, property.name, price);
                    else
                        createDisabledCard(property.id, property.color, property.name, price);
                } else if (data.asyncRequestType == "canUpgrade") {
                    // le prix d'amélioration CUMULÉ selon le niveau désiré, si niveau déjà aquis ou pas les moyens => vaut null
                    let level1Price = data.asyncRequestArgs[0];
                    let level2Price = data.asyncRequestArgs[1];
                    let level3Price = data.asyncRequestArgs[2];
                    let level4Price = data.asyncRequestArgs[3];
                    let level5price = data.asyncRequestArgs[4];
                } else if (data.asyncRequestType == "shouldMortage") {
                    // le montant de loyer à payer (donc à obtenir avec argent actuel + hypothèque de propriétés)
                    let totalMoneyToHave = data.asyncRequestArgs[0];
                } else {
                    afficherMessageAction = true;
                }
            } else {
                afficherMessageAction = true;
            }

            // Affichage du message d'action donné par le serveur
            if (afficherMessageAction && data.actionMessage)
                createTextCard(data.actionMessage, (data.playerID != ID), null, null);

            console.log("=== fin gameActionRes ===");
        });
    });
});

$('.notification-container').on('click', '.accept', function () {
    console.log("socket.emit(gamePropertyBuyReq)");
    socket.emit('gamePropertyBuyReq');
    $(this).parent().parent().fadeOut('fast', function () {
        $(this).remove();
    });
});

$('.notification-container').on('click', '.reject', function () {
    console.log("refus d'achat");
    $(this).parent().parent().fadeOut('fast', function () {
        $(this).remove();
    });
});

socket.on("gamePropertyBuyRes", (data) => {
    console.log("gamePropertyBuyRes");
    console.log(data);
    if (typeof data.error !== "undefined") {
        createTextCard(data.status, true, 'brown', 'Impossible d\'acheter');
        return;
    }

    let property = getPropertyById(data.propertyID);
    let cell = getCellByProperty(property);
    if (property && cell) {
        createProperty(data.playerID, property.color, property.name, property.id)
        setPlayerMoney(data.playerID, data.playerMoney);
        changeColorCase('case' + cell.id.toString(), property.color);

        // Retirer la notificationCard chez tous les autres joueurs (après animation du bouton ACHETER)
        $('.notification-container')
            .find('.notification[data-property-id="' + property.id + '"] .btn-primary')
            .animate({ zoom: '130%' }, 250, function () {
                $(this).animate({ zoom: '100%' }, 250, function () {
                    setTimeout(function () {
                        $('.notification-container').find('.notification[data-property-id="' + property.id + '"]').fadeOut('fast', () => {
                            $(this).remove();
                        });
                    }, 300);
                });
            });

    }
});

socket.on("gameRollDicesRes", (res) => {
    if (res.error === 0)
        console.log("gameRollDicesRes")
    else // hôte uniquement
        alert(res.status);
});

socket.on("gameTurnEndRes", (res) => {
    if (res.error === 0)
        console.log("gameTurnEndRes")
    else // hôte uniquement
        alert(res.status);
});

socket.on('gameChatReceiveRes', (data) => {
    addMsg(data.playerID, data.text, data.createdTime);
});

socket.on('gameReconnectionRes', (data) => {
    console.log(' --- RECONNEXION DATA');
    console.log(data);
});

socket.on('gamePlayerDisconnectedRes', (data) => {
    console.log(' --- PLAYER DISCONNECTED: ' + data.playerID);
});

socket.on('gamePlayerReconnectedRes', (data) => {
    console.log(' --- PLAYER RECONNECTED: ' + data.playerID);
});

socket.emit('gameReadyReq'); // AUCUN EVENT SOCKET (ON) APRES CECI

////////////////////////////
// INTERFACE JS FUNCTIONS //
////////////////////////////

$(function () {
    $('.player-entry .name').attr('title', function () {
        return $(this).html();
    });
});

/**
 * Met à jour le solde d'un joueur sur l'UI
 * @param playerId id du joueur à mettre à jour
 * @param amount valeur du nouveau solde
 */
function setPlayerMoney(playerId, amount) {
    $('.player-list .player-entry[data-id="' + playerId + '"] .money').html(amount);
}

/**
 * Met à jour le joueur courant sur l'interface (point affiché à côté du pseudo)
 * @param playerId ID du joueur courant
 */
function setCurrentPlayer(playerId) {
    $('.player-list .player-entry').removeClass('current');
    $('.player-list .player-entry[data-id="' + playerId + '"]').addClass('current');
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

function bindOfferListener() {
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

function generatePlayerEntry(id, nickname, money) {
    let html = `<div class="player-entry" data-id="` + id + `">
                        <div class="name" title="`+ nickname + `">` + nickname + `</div>
                        <div class="money">`+ money + `</div>
                        <div class="popup top" style="display: none;">
                        </div>
                </div>`;

    $('.player-list').append(html);
}

function displayLoaderOverlay() {
    $(".loader-overlay-container").css("display", "flex");
}

function hideLoaderOverlay() {
    $(".loader-overlay-container").css("display", "none");
}

// addPurchaseOffer(1, 'ABC', 'Avenue des Vosges', 30000);
// addSaleOffer(1, 'ABC', 'Avenue des Vosges', 30000);
