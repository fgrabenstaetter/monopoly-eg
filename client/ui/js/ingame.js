// RAPPEL VAR GLOBALES:
//     NICKNAME => mon pseudo
//     ID       => mon user/player ID

// données statiques de jeu (format: voir /socket_events.md)
let DATA = {
    players: [],
    cells: [],
    properties: [],
    gameEndTime: null, // timestamp de fin forcée du jeu
    // turnTimeSeconds: null,
    // turnDoubleDiceAddedTime: null // temps ajouté au tour en cas de double avec les dés
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

    console.log('Le jeu a démarré !');
    console.log(data);

    // Level par défaut des propriétés = 0 (car non upgrade)
    for (const i in DATA.properties)
        DATA.properties[i].level = 0;

    // Génération de la liste de joueurs
    DATA.players.forEach((player) => {
        loaderPawn(PAWNS[player.pawn], '0');

        generatePlayerEntry(player.id, player.nickname, data.playersMoney);
    });

    initProperty();
    hideLoaderOverlay();
});

socket.on('gameTurnRes', (data) => {
    console.log(data);
    let currentTimestamp = Date.now();
    let turnTimeSeconds = Math.floor((data.turnEndTime - currentTimestamp) / 1000);
    console.log('Le tour se terminera dans ' + turnTimeSeconds + ' secondes (' + currentTimestamp + ' - ' + data.turnEndTime + ')');

    // On vide toutes les notifications (au cas-où)
    $('.notification-container > .col-md-12').empty();

    setCurrentPlayer(data.playerID);

    // afficher décompte de temps du tour
    if (data.playerID === ID) {
        console.log('C\'est à mon tour de jouer !');

        console.log("[BOUTON D'ACTION] Initialisation");
        $('#timer').progressInitialize();
        console.log("[BOUTON D'ACTION] Passage en timer");
        $('#timer').progressTimed(turnTimeSeconds);
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


    let currentTimestamp = Date.now();
    let turnTimeSeconds = Math.floor((data.turnEndTime - currentTimestamp) / 1000);

    // console.log("[BOUTON D'ACTION] Initialisation (dans gameActionRes)");
    // $('#timer').progressInitialize();
    // console.log("[BOUTON D'ACTION] Resynchronisation du timer");
    // console.log('Le tour se terminera dans ' + turnTimeSeconds + ' secondes ('+currentTimestamp+' - '+data.turnEndTime+')');
    // $('#timer').progressTimed(turnTimeSeconds);

    // if (data.playerID != ID) {
    //     console.log("[BOUTON D'ACTION] Passage en attente");
    //     $('#timer').progressFinish(turnTimeSeconds);
    // }

    let currPlayer = getPlayerById(data.playerID);
    if (!currPlayer) {
        console.log('JOUEUR INTROUVABLE');
        return;
    }

    if (currPlayer.id == ID) {
        console.log("[BOUTON D'ACTION] Initialisation (dans gameActionRes)");
        $('#timer').progressInitialize();
        console.log("[BOUTON D'ACTION] Resynchronisation du timer");
        console.log('Le tour se terminera dans ' + turnTimeSeconds + ' secondes (' + currentTimestamp + ' - ' + data.turnEndTime + ')');
        $('#timer').progressTimed(turnTimeSeconds);
        $('#timer').progressSetStateTerminer();
    }

    let totalDices = data.dicesRes[0] + data.dicesRes[1];
    console.log(currPlayer.nickname + " a fait un " + totalDices.toString() + " avec les dés et se rend à la case " + data.cellPos);

    let cellPos1 = data.cellPosTmp ? data.cellPosTmp : data.cellPos;
    let cellPos2 = data.cellPosTmp ? data.cellPos : null;

    // Lancement de l'animation des dés
    triggerDices(data.dicesRes[0], data.dicesRes[1], () => {// Déplacement du pion du joueur

        // movement(PAWNS[currPlayer.pawn], data.cellPos);
        console.log("movement(" + PAWNS[currPlayer.pawn] + ", " + data.cellPos.toString() + ");");
        movement(PAWNS[currPlayer.pawn], cellPos1.toString(), function () {
            // Mise à jour des soldes (le cas échéant)
            if (data.updateMoney) {
                data.updateMoney.forEach((row) => {
                    setPlayerMoney(row.playerID, row.money);
                });
            }

            // Récupération de la propriété sur laquelle le joueur est tombé (le cas échéant)
            let property = getPropertyByCellId(data.cellPos);

            let afficherMessageAction = false;
            // asyncRequestType à gérer ici
            if (data.asyncRequestType && property) {
                if (data.asyncRequestType == "canBuy") {
                    let price = data.asyncRequestArgs[0];
                    createSaleCard(property.id, property.color, property.name, price, (currPlayer.id != ID));

                } else if (data.asyncRequestType == "canUpgrade") {
                    // le prix d'amélioration CUMULÉ selon le niveau désiré, si niveau déjà aquis ou pas les moyens => vaut null
                    let level1Price = data.asyncRequestArgs[0];
                    let level2Price = data.asyncRequestArgs[1];
                    let level3Price = data.asyncRequestArgs[2];
                    let level4Price = data.asyncRequestArgs[3];
                    let level5price = data.asyncRequestArgs[4];

                    createUpgradeCard(property.id, property.color, property.name, price, (currPlayer.id != ID));
                    
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
                createTextCard(data.actionMessage, (currPlayer.id != ID), null, null);
            
            // Traitement des extras
            if (typeof data.extra !== "undefined") {
                // Si on est tombé sur une carte (chance / communauté)
                if (typeof data.extra.newCard !== "undefined") {
                    if (data.extra.newCard.type == "chance") {
                        createTextCard(data.extra.newCard.description, (currPlayer.id != ID), "blue", "Carte chance");
                    } else { // community
                        createTextCard(data.extra.newCard.description, (currPlayer.id != ID), "blue", "Carte communauté");
                    }
                }
                
                // Nb de cartes sortie de prison si il a changé
                if (typeof data.extra.nbJailEscapeCards !== "undefined") {
                    currPlayer.nbJailEscapeCards = data.extra.nbJailEscapeCards;
                }
            }
            

            if (cellPos2) {
                movement(PAWNS[currPlayer.pawn], cellPos1.toString(), function () {
                    checkDoubleDiceAndEndGameActionRes(data);
                });
            } else {
                checkDoubleDiceAndEndGameActionRes(data);
            }
        });
    });
});

/**
 * Termine le gameActionRes (et vérifie si un double a été fait avec les dés)
 */
function checkDoubleDiceAndEndGameActionRes(data) {
    // Si double avec les dés, on peut les relancer
    if (data.dicesRes[0] == data.dicesRes[1]) {
        if (data.playerID === ID) {
            // LABEL -> "RE-LANCER LES DÉS"     
            console.log("[BOUTON D'ACTION] Initialisation");
            $('#timer').progressInitialize();
            // $('#timer').progressInitialize();
            // console.log("[BOUTON D'ACTION] Passage en timer");
            // $('#timer').progressTimed(DATA.turnTimeSeconds);
        }
    }

    console.log("=== fin gameActionRes ===");
}


// Accepter d'améliorer sa propriété
$('.notification-container').on('click', '.upgrade .accept', function () {
    let level = $(this).find('.property-upgrade-level').val()
    console.log("socket.emit(gamePropertyUpgradeReq) - level " + level);
    socket.emit('gamePropertyUpgradeReq', { level: parseInt(level) });
    $(this).parent().parent().fadeOut('fast', function () {
        $(this).remove();
    });
});


// Accepter l'achat d'un terrain vierge
$('.notification-container').on('click', '.sale .accept', function () {
    console.log("socket.emit(gamePropertyBuyReq)");
    socket.emit('gamePropertyBuyReq');
    $(this).parent().parent().fadeOut('fast', function () {
        $(this).remove();
    });
});

// Refuser l'achat d'un terrain vierge ou l'amélioration d'une propriété
$('.notification-container').on('click', '.reject', function () {
    console.log("refus d'achat / amélioration");
    $(this).parent().parent().fadeOut('fast', function () {
        $(this).remove();
    });
});

// Terrain vierge acheté
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
            .find('.notification.sale[data-property-id="' + property.id + '"] .btn-primary')
            .animate({ zoom: '130%' }, 250, function () {
                $(this).animate({ zoom: '100%' }, 250, function () {
                    setTimeout(function () {
                        $('.notification-container').find('.notification.sale[data-property-id="' + property.id + '"]').fadeOut('fast', () => {
                            $(this).remove();
                        });
                    }, 300);
                });
            });

    }
});


// Terrain vierge acheté
socket.on("gamePropertyUpgradeRes", (data) => {
    console.log("gamePropertyUpgradeRes");
    console.log(data);
    if (typeof data.error !== "undefined") {
        createTextCard(data.status, true, 'brown', 'Impossible d\'améliorer');
        return;
    }

    let property = getPropertyById(data.propertyID);
    let cell = getCellByProperty(property);
    if (property && cell) {
        setPlayerMoney(data.playerID, data.playerMoney);

        // Construire les maisons / hotels
        property.level = data.level
        if (property.level == 1) {
            console.log("Construire 1 maisons case " + cell.id);
        } else if (property.level == 2) {
            console.log("Construire 2 maisons case " + cell.id);
        } else if (property.level == 3) {
            console.log("Construire 3 maisons case " + cell.id);
        } else if (property.level == 4) {
            console.log("Construire 4 maisons case " + cell.id);
        } else if (property.level == 5) {
            console.log("Construire un hôtel case " + cell.id);
        } else {
            console.log("Niveau non pris en compte");
        }

        // Retirer la notificationCard chez tous les autres joueurs (après animation du bouton ACHETER)
        $('.notification-container')
            .find('.notification.upgrade[data-property-id="' + property.id + '"] .btn-primary')
            .animate({ zoom: '130%' }, 250, function () {
                $(this).animate({ zoom: '100%' }, 250, function () {
                    setTimeout(function () {
                        $('.notification-container').find('.notification.upgrade[data-property-id="' + property.id + '"]').fadeOut('fast', () => {
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
    // hideLoaderOverlay();
});

socket.on('gamePlayerDisconnectedRes', (data) => {
    console.log(' --- PLAYER DISCONNECTED: ' + data.playerID);
});

socket.on('gamePlayerReconnectedRes', (data) => {
    console.log(' --- PLAYER RECONNECTED: ' + data.playerID);
});

// AUCUN EVENT SOCKET (ON) APRES CECI
setTimeout(function () {
    socket.emit('gameReadyReq');
}, 2000); // Délai le temps que le plateau se charge (arbitraire pour l'instant)

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

// Loader overlay
function displayLoaderOverlay() {
    $(".loader-overlay-container").fadeIn(0);
}

function hideLoaderOverlay() {
    $(".loader-overlay-container").fadeOut('fast');
}

// Overview card
// rent doit être une liste de 6 éléments
function populateStreetOverviewCard(color, roadName, rent, housePrice, hotelPrice) {
    $('.overview-card .header').html(roadName);
    $('.overview-card .header').removeClass('station');
    $('.overview-card .header').removeClass('company');
    $('.overview-card .header').removeClass('eau');
    $('.overview-card .header').removeClass('electricite');
    $('.overview-card .header').css("background-color", color);
    $('.overview-card .header').css("color", "white");
    let htmlContent = `<div class="rent">`+ rent[0] +`</div>
                        <div class="with-house">
                            <div>Avec 1 Maison</div>
                            <div>`+ rent[1] +`</div>
                        </div>
                        <div class="with-house">
                            <div>Avec 2 Maisons</div>
                            <div>`+ rent[2] +`</div>
                        </div>
                        <div class="with-house">
                            <div>Avec 3 Maisons</div>
                            <div>`+ rent[3] +`</div>
                        </div>
                        <div class="with-house">
                            <div>Avec 4 Maisons</div>
                            <div>`+ rent[4] +`</div>
                        </div>
                        <div class="with-hotel">
                            <div>Avec 1 Hotel</div>
                            <div>`+ rent[5] +`</div>
                        </div>
                        <div class="house-price">Prix des Maisons `+ housePrice +`€ chacune</div>
                        <div class="hotel-price">Prix d'un Hôtel `+ hotelPrice +`€ plus 4 maisons</div>`
    $('.overview-card .content').html(htmlContent);
}

// rent doit être une liste de 4 éléments
function populateStationOverviewCard(roadName, rent) {
    $('.overview-card .header').html(roadName);
    $('.overview-card .header').removeClass('station');
    $('.overview-card .header').removeClass('company');
    $('.overview-card .header').removeClass('eau');
    $('.overview-card .header').removeClass('electricite');
    $('.overview-card .header').addClass('station');
    $('.overview-card .header').css("background-color", "white");
    $('.overview-card .header').css("color", "black");
    let htmlContent = `<div class="rent">`+ rent[0] +`</div>
                        <div class="with-house">
                            <div>Si vous avez 2 Gares</div>
                            <div>`+ rent[1] +`</div>
                        </div>
                        <div class="with-house">
                            <div>Si vous avez 3 Gares</div>
                            <div>`+ rent[2] +`</div>
                        </div>
                        <div class="with-house">
                            <div>Si vous avez 4 Gares</div>
                            <div>`+ rent[3] +`</div>
                        </div>`
    $('.overview-card .content').html(htmlContent);
}

// rent doit être un entier
function populateCompanyOverviewCard(roadName, rent) {
    $('.overview-card .header').html(roadName);
    $('.overview-card .header').removeClass('station');
    $('.overview-card .header').removeClass('company');
    $('.overview-card .header').removeClass('eau');
    $('.overview-card .header').removeClass('electricite');
    $('.overview-card .header').addClass('company');
    if (roadName == 'Eau') {
        $('.overview-card .header').addClass('eau')
    }
    else if (roadName == 'Électricité') {
        $('.overview-card .header').addClass('electricite')
    }
    $('.overview-card .header').css("background-color", "rgb(58, 58, 58)");
    $('.overview-card .header').css("color", "white");
    let htmlContent = `<div class="company-description">Si l'on possède UNE carte de compagnie de Service Public, 
                            le loyer est 4 fois le montant indiqué par les dés.<br><br>Si l'on possède les DEUX cartes de compagnie de Service Public, 
                            le loyer est 10 fois le montant indiqué par les dés.</div>
                        <div class="rent">`+ rent +`</div>`
    $('.overview-card .content').html(htmlContent);
}

function emptyOverviewCard() {
    $('.overview-card .header').html('');
    $('.overview-card .header').removeClass('station');
    $('.overview-card .header').removeClass('company');
    $('.overview-card .header').removeClass('eau');
    $('.overview-card .header').removeClass('electricite');
    $('.overview-card .header').css("background-color", "white");
    $('.overview-card .header').css("color", "white");
    $('.overview-card .content').html('');
}

// addPurchaseOffer(1, 'ABC', 'Avenue des Vosges', 30000);
// addSaleOffer(1, 'ABC', 'Avenue des Vosges', 30000);
