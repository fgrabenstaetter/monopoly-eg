// RAPPEL VAR GLOBALES:
//     NICKNAME => mon pseudo
//     ID       => mon user/player ID

///////////////////////////////////////////
// Adaptation aux paramètres utilisateur //
///////////////////////////////////////////

// Qualité graphique
function setPlayerGraphicsQuality() {
    if (loggedUser.settings.graphicsQuality == 0)
        renderer.setPixelRatio(0.5);
    else if (loggedUser.settings.graphicsQuality == 2)
        renderer.setPixelRatio(window.devicePixelRatio);
    else
        renderer.setPixelRatio(1);
}

// Auto zoom (aux déplacements) - A traiter
function setPlayerAutoZoom() {
    if (loggedUser.settings.autoZoom)
        console.log('Activer auto zoom');
    else
        console.log('Désactiver auto zoom');
}


// données statiques de jeu (format: voir /socket_events.md)
let DATA = {
    players: [],
    cells: [],
    properties: [],
    gameEndTime: null, // timestamp de fin forcée du jeu
};

const PAWNS = ['tracteur', 'boat', 'moto', 'camion', 'montgolfiere', 'citroen C4', 'overboard', 'schoolbus'];
const PLAYERS_COLORS = ['yellow', '#d43333', '#006aff', '#22d406', 'white', 'violet', 'cyan', 'orange'];
const CELL_PRISON = 10;

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
    // afficher pseudo & avatar
    $('.profile-row > .username').text(NICKNAME);
    $('.profile-row > .user-avatar').attr('data-id', ID).attr('src', socketUrl + AVATAR);

    DATA.players = data.players;
    DATA.cells = data.cells;
    DATA.properties = data.properties;
    DATA.gameEndTime = data.gameEndTime;

    console.log('Le jeu a démarré !');
    console.log(data);

    // Level par défaut des propriétés = 0 (car non upgrade)
    for (const i in DATA.properties) {
        DATA.properties[i].level = 0;
        DATA.properties[i].ownerID = null;
        DATA.properties[i].isMortgage = 0;
    };
    // Génération de la liste de joueurs
    DATA.players.forEach((player, index) => {
        // Champs par défaut du joueur
        player.properties = [];
        player.money = data.playersMoney;
        player.cellPos = 0;
        player.color = PLAYERS_COLORS[index];
        player.isInJail = false;
        loaderPawn(PAWNS[player.pawn], player.cellPos.toString());
        createPlayerEntry(player);
    });

    initProperty();
    hideLoaderOverlay();
    $('#timer').progressInitialize();
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
        triggerSplashAnimation('<br>C\'est à vous de jouer !', 'white');

        console.log("[BOUTON D'ACTION] Initialisation");
        $('#timer').progressReset();
        console.log("[BOUTON D'ACTION] Passage en timer");
        $('#timer').progressStart(turnTimeSeconds);
    } else {
        triggerSplashAnimation(`<br>C'est au tour de ${idToNick(data.playerID)} !`, 'white');
        console.log("[BOUTON D'ACTION] Passage en attente");
        $('#timer').progressFinish();
    }
});



/*************************/
/** DEBUT GAMEACTIONRES **/
/*************************/

socket.on('gameActionRes', (data) => {
    console.log("=== gameActionRes ===");
    console.log(data);

    console.log("Action déclenchée par " + idToNick(data.playerID) + " => " + data.actionMessage);


    let currentTimestamp = Date.now();
    let turnTimeSeconds = Math.floor((data.turnEndTime - currentTimestamp) / 1000);

    let currPlayer = getPlayerById(data.playerID);
    if (!currPlayer) {
        console.log('JOUEUR INTROUVABLE');
        return;
    }

    if (currPlayer.id == ID) {
        console.log("[BOUTON D'ACTION] Initialisation (dans gameActionRes)");
        if (data.dicesRes[0] != data.dicesRes[1]) {
            $('#timer').progressSetStateTerminer();
        }
        else {
            $('#timer').progressSetStateRelancer();
        }
    }

    if (currPlayer.isInJail && currPlayer.isInJail > 3)
        currPlayer.isInJail = false;

    let totalDices = data.dicesRes[0] + data.dicesRes[1];
    console.log(currPlayer.nickname + " a fait un " + totalDices.toString() + " avec les dés et se rend à la case " + data.cellPos);

    let cellPos1 = data.cellPosTmp ? data.cellPosTmp : data.cellPos;
    let cellPos2 = data.cellPosTmp ? data.cellPos : null;

    // Lancement de l'animation des dés
    triggerDices(data.dicesRes[0], data.dicesRes[1], () => {// Déplacement du pion du joueur

        // On ne déplace le joueur que s'il doit aller sur une nouvelle case (et s'il n'est pas en prison)
        if (!currPlayer.isInJail && cellPos1 != currPlayer.cellPos) {
            console.log("movement(" + PAWNS[currPlayer.pawn] + ", " + cellPos1.toString() + ");");
            currPlayer.cellPos = cellPos1;
            $('#timer').progressPause();
            movement(PAWNS[currPlayer.pawn], cellPos1.toString(), function () {
                $('#timer').progressResume();
                gameActionResAfterFirstMovement(data, currPlayer, cellPos2);
            });
        } else {
            gameActionResAfterFirstMovement(data, currPlayer, cellPos2);
        }
    });
});

/**
 * Continue le tour de jeu (gameActionRes) après le premier déplacement
 * @param data Données de gameActionRes
 * @param currPlayer Joueur courant
 * @param cellPos2 Position #2 (le cas échéant)
 */
function gameActionResAfterFirstMovement(data, currPlayer, cellPos2) {
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
            if (property.type == "publicCompany") {
                if (property.name == 'Eléctricité de Strasbourg')
                    createSaleCard(property.id, "company electricite", property.name, price, (currPlayer.id != ID));
                else
                    createSaleCard(property.id, "company eau", property.name, price, (currPlayer.id != ID));
            }
            else if (property.type == "trainStation")
                createSaleCard(property.id, "station", property.name, price, (currPlayer.id != ID));
            else
                createSaleCard(property.id, property.color, property.name, price, (currPlayer.id != ID));
        }
        else if (data.asyncRequestType == "canUpgrade") {
            // le prix d'amélioration CUMULÉ selon le niveau désiré, si niveau déjà aquis ou pas les moyens => vaut null
            let level1Price = data.asyncRequestArgs[0];
            let level2Price = data.asyncRequestArgs[1];
            let level3Price = data.asyncRequestArgs[2];
            let level4Price = data.asyncRequestArgs[3];
            let level5price = data.asyncRequestArgs[4];

            createUpgradeCard(property.id, property.color, property.name, (currPlayer.id != ID));

        } else if (data.asyncRequestType == "shouldMortgage") {
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

        if (typeof data.extra.goJail !== "undefined" && data.extra.goJail) {
            cellPos2 = null;
            currPlayer.isInJail = 1;
            setTimeout(() => {
                deletePawn(PAWNS[currPlayer.pawn]);
                setTimeout(() => {
                    loaderPawn(PAWNS[currPlayer.pawn], CELL_PRISON);
                    return gameActionResAfterSecondMovement(data);
                }, 1000);
            }, 1000);
        }
    }

    if (cellPos2 !== null && cellPos2 != currPlayer.cellPos) {
        movement(PAWNS[currPlayer.pawn], cellPos2.toString(), function () {
            currPlayer.cellPos = cellPos2;
            gameActionResAfterSecondMovement(data, currPlayer);
        });
    } else {
        gameActionResAfterSecondMovement(data, currPlayer);
    }
}

/**
 * Termine le gameActionRes (et vérifie si un double a été fait avec les dés)
 * @param data Données de gameActionRes
 * @param currPlayer Joueur actuel
 */
function gameActionResAfterSecondMovement(data, currPlayer) {
    if (data.playerID === ID) {
        $('#timer').progressReset(false);
    }
    // Si double avec les dés, on peut les relancer
    if (data.dicesRes[0] == data.dicesRes[1]) {
        if (data.playerID === ID) {
            // LABEL -> "RE-LANCER LES DÉS"
            console.log("[BOUTON D'ACTION] Initialisation");
            // Ajouter le progressStart
        }
        else {
            $(this).attr({ 'data-loading': 'TERMINER' });
        }
    }

    if (currPlayer.isInJail)
        currPlayer.isInJail++; // On augmente le nb de tours du joueur en prison

    console.log("=== fin gameActionRes ===");
}

/***********************/
/** FIN GAMEACTIONRES **/
/***********************/


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
        let player = getPlayerById(data.playerID);
        // player.properties.push(property);
        property.ownerID = player.id;
        // MANQUE ACCÈS A LA COULEUR DU JOUEUR
        loaderFlag("d" + cell.id, player.color);
        if (property.type == "publicCompany") {
            createProperty(player.id, 'company', property.name, property.id);
        }
        else if (property.type == "trainStation") {
            createProperty(player.id, 'station', property.name, property.id);
        }
        else {
            createProperty(player.id, property.color, property.name, property.id);

        }
        setPlayerMoney(player.id, data.playerMoney);

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
        let prevLevel = property.level;
        property.level = data.level
        if (property.level == 1) {
            console.log("Construire 1 maisons case " + cell.id);
            loaderhouseProperty(cell.id, 1);
        } else if (property.level == 2) {
            console.log("Construire 2 maisons case " + cell.id);
            if (prevLevel < 1)
                loaderhouseProperty(cell.id, 1);

            loaderhouseProperty(cell.id, 2);
        } else if (property.level == 3) {
            console.log("Construire 3 maisons case " + cell.id);
            if (prevLevel < 1)
                loaderhouseProperty(cell.id, 1);

            if (prevLevel < 2)
                loaderhouseProperty(cell.id, 2);

            loaderhouseProperty(cell.id, 3);
        } else if (property.level == 4) {
            console.log("Construire 4 maisons case " + cell.id);
            if (prevLevel < 1)
                loaderhouseProperty(cell.id, 1);

            if (prevLevel < 2)
                loaderhouseProperty(cell.id, 2);

            if (prevLevel < 3)
                loaderhouseProperty(cell.id, 3);

            loaderhouseProperty(cell.id, 4);
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

socket.on("gameOfferSendRes", (res) => {
    if (res.error === 0)
        console.log("gameOfferSendRes")
    else // hôte uniquement
        toast(`gameOfferSendRes ${res.status}`, 'danger', 5);
});

socket.on("gameOfferReceiveRes", (res) => {
    console.log("gameOfferReceiveRes");
    addPurchaseOffer(res.offerID, idToNick(res.makerID), idToNick(res.receiverID), getPropertyById(res.propertyID).name, res.price);
});

socket.on("gameOfferAcceptRes", (res) => {
    if (res.error === 0)
        console.log("gameOfferAcceptRes")
    else // hôte uniquement
        toast(`gameOfferAcceptRes ${res.status}`, 'danger', 5);
});

socket.on("gamePropertyUnmortgageRes", (res) => {
    if (res.error === 0)
        console.log("gamePropertyUnmortgageRes")
    else // hôte uniquement
        toast(`gamePropertyUnmortgageRes ${res.status}`, 'danger', 5);
});

socket.on("gameOfferFinishedRes", (res) => {
    console.log("gameOfferFinishedRes")
    let buyer = getPlayerById(res.makerID);
    let owner = getPlayerById(res.receiverID);
    if (res.receiverID == null) {
        if (res.propertyID == -1)
            toast("La proposition de " + buyer.nickname + " d'achat d'une carte fin de session du parlement à " + owner.nickname + " a été refusée", "neutral", 10);
        else {
            let propertyNick = getPropertyById(res.propertyID)
            toast("La propositoin d'achat de " + propertyNick + "a été refusée", "neutral", 10);
        }
    }
    else {
        let property = getPropertyById(res.propertyID);
        toast("Le joueur " + buyer.nickname + " a acheté " + property.name + " à " + owner.nickname + " pour " + res.price + "€", "success", 10);
        property.ownerID = res.makerID;
        let cell = getCellByProperty(res.propertyID);
        delProperty(res.propertyID);
        loaderFlag("d" + cell.id, buyer.color);
        if (property.type == "publicCompany") {
            createProperty(res.makerID, 'company', property.name, property.id);
        }
        else if (property.type == "trainStation") {
            createProperty(res.makerID, 'station', property.name, property.id);
        }
        else {
            createProperty(res.makerID, property.color, property.name, property.id);

        }
        setPlayerMoney(res.receiverID, owner.money + res.price);
        setPlayerMoney(res.makerID, buyer.money - res.price);

    }

});

//Hypothèque
socket.on("gamePropertyMortgageRes", (res) => {
    console.log("gamePropertyMortgageRes");
    setPlayerMoney(res.playerID, res.playerMoney);
    console.log(res);
    for (const p in res.properties) {
        DATA.properties[res.properties[p]].isMortgage = 1;
        mortgageProperty(res.properties[p]);
    }
    $('.overview-card').fadeOut();
});

//Faire lever l'hypotheque
socket.on("gamePropertyUnmortgagedRes", (res) => {
    console.log("gamePropertyUnmortgagedRes");
    console.log(res);
    setPlayerMoney(res.playerID, res.playerMoney);
    DATA.properties[res.propertyID].isMortgage = 0;
    unMortgageProperty(res.propertyID);
    $('.overview-card').fadeOut();
});

//Enchères
socket.on("gameBidRes", (res) => {
    console.log("gameBidRes");
    console.log(res);
    let first_message = idToNick(res.playerID);
    if (first_message == null) {
        let ownerNick = idToNick(res.propertyOwnerId)
        if (ownerNick == null)
            openBidPopup(res.bidID, 'undefined', res.text, 0);
        else
            openBidPopup(res.bidID, playerNick, res.text, res.price);
    }
});

socket.on("gameOverbidRes", (res) => {
    if (res.error === 0)
        console.log("gameOfferAcceptRes")
    else // hôte uniquement
        toast(`gameOverbidRes ${res.status}`, 'danger', 5);
});

socket.on("gameBidEndedRes", (res) => {
    console.log("gameBidEndedRes");
    //console.log(res);
    let playerNick = idToNick(res.playerID);
    if (res.playerID == null)
        toast("Le terrain n'a pas été acheté", "info", 10);
    else {
        toast("Le joueur " + playerNick + " a remporté l'enchère pour " + res.price + "€", "success", 10);
        let property = getPropertyById(res.propertyID);
        property.ownerID = res.playerID;
        let owner = getPlayerById(res.playerID);
        let cell = getCellByProperty(property)
        loaderFlag("d" + cell.id, owner.color);
        if (property.type == "publicCompany") {
            createProperty(res.playerID, 'company', property.name, property.id);
        }
        else if (property.type == "trainStation") {
            createProperty(res.playerID, 'station', property.name, property.id);
        }
        else {
            createProperty(res.playerID, property.color, property.name, property.id);

        }
        setPlayerMoney(res.playerID, res.playerMoney);
    }

    closeBidPopup(res.bidID);
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

// Un joueur s'est déconnecté
socket.on('gamePlayerDisconnectedRes', (data) => {
    disconnectPlayerEntry(data.playerID);
});

// Un joueur s'est reconnecté
socket.on('gamePlayerReconnectedRes', (data) => {
    console.log(' --- PLAYER RECONNECTED: ' + data.playerID);
    console.log(data);
    reconnectPlayerEntry(data.playerID);
});

// Données de reconnexion
socket.on('gameReconnectionRes', (data) => {
    // afficher pseudo & avatar
    $('.profile-row > .username').text(NICKNAME);
    $('.profile-row > .user-avatar').attr('data-id', ID).attr('src', socketUrl + AVATAR);

    console.log(' --- RECONNEXION DATA');
    console.log(data);

    DATA.players = data.players;
    DATA.cells = data.cells;
    DATA.properties = data.properties;
    DATA.gameEndTime = data.gameEndTime;

    for (const i in DATA.properties) {
        DATA.properties[i].level = 0;
        DATA.properties[i].ownerID = null;
    };

    // Génération de la liste de joueurs
    DATA.players.forEach((player, index) => {
        loaderPawn(PAWNS[player.pawn], player.cellPos);
        createPlayerEntry(player);
        player.color = PLAYERS_COLORS[index];
        player.isInJail = false;
    });

    initProperty();

    DATA.players.forEach((player) => {
        player.properties.forEach((playerProperty) => {
            let property = getPropertyById(playerProperty);
            if (property) {
                property.ownerID = player.id;
                // MANQUE ACCÈS A LA COULEUR DU JOUEUR
                let cell = getCellByProperty(property)
                loaderFlag("d" + cell.id, player.color);
                if (property.type == "publicCompany") {
                    createProperty(player.id, 'company', property.name, property.id);
                }
                else if (property.type == "trainStation") {
                    createProperty(player.id, 'station', property.name, property.id);
                }
                else {
                    createProperty(player.id, property.color, property.name, property.id);
                }
            }
        });
    });

    data.chatMessages.forEach((msg) => {
        addMsg(msg.playerID, msg.text, msg.createdTime);
    });

    /**
     * Reste à gérer à la reconnexion :
     * - bids
     * - offers
     * - couleur des cases pour celles déjà achetées
     */

    hideLoaderOverlay();

    $('#timer').progressInitialize();
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

function addPurchaseOffer(id, buyerName, ownerName, roadName, price) {
    $("#msgChat").append(`
        <div class="purchase-offer" data-id="` + id + `">
            <span>` + buyerName + `</span> propose à <span>` + ownerName + `</span> d'acheter ` + roadName + ` pour ` + price + `€
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
    updateScroll();
    $('.accept-button').click(function () {
        let error = 0;
        let status;
        const id = $(this).parent().parent().attr('data-id');
        console.log(id);

        socket.emit('gameOfferAcceptReq', { offerID: parseInt(id) });
        console.log('gameOfferAcceptReq');


        //!!! changer la couleur du drapeau !!!
        if (!error)
            $(this).parent().parent().remove();
        else
            toast(`erreur : ${status}`, 'danger', 5);
    });


    $('.deny-button').click(function () {
        $(this).parent().parent().remove();
    });
}

/**
 * Crée une entrée dans la listedes joueurs
 * @param player Joueur à ajouter dans la liste du HUD
 */
function createPlayerEntry(player) {
    let html = `<div class="player-entry" data-id="${player.id}">
                        <div class="name" title="${player.nickname}">${player.nickname}</div>
                        <div class="money"></div>
                        <div class="popup top" style="display: none;">
                        </div>
                </div>`;


    $('.player-list').append(html);

    const nodes = document.querySelectorAll('.player-list .player-entry');
    const last = nodes[nodes.length - 1];
    const el = last.querySelector('.money');
    new Odometer({
        el: el,
        value: player.money,

        // Any option (other than auto and selector) can be passed in here
        format: '',
        theme: 'digital',
        format: '( ddd),dd', // Change how digit groups are formatted, and how many digits are shown after the decimal point
        duration: 3000, // Change how long the javascript expects the CSS animation to take
        theme: 'default', // Specify the theme (if you have more than one theme css file on the page)
    });
}

/**
 * Retire un joueur de la liste de joueurs
 * @param {Object} player Joueur à retirer de la liste
 */
function removePlayerEntry(player) {
    $(`.player-list .player-entry[data-id="${player.id}"]`).fadeOut(function () {
        $(this).remove();
    });
}

/**
 * Passe une entrée de joueur en mode "déconnecté"
 * @param id Identifiant du joueur
 */
function disconnectPlayerEntry(id) {
    let playerEntry = $('.player-list').find('.player-entry[data-id="' + id + '"]');
    playerEntry.find('.name').append('<div class="disconnected">(Déconnecté)</div>');
    playerEntry.css('opacity', '0.3');
}

/**
 * Repasse une entrée de joueur en mode "connecté" (i.e. mode normal)
 * @param id Identifiant du joueur
 */
function reconnectPlayerEntry(id) {
    let playerEntry = $('.player-list').find('.player-entry[data-id="' + id + '"]');
    playerEntry.find('.disconnected').remove();
    playerEntry.css('opacity', '1');
}

/**
 * Affiche l'overlay de chargement
 */
function displayLoaderOverlay() {
    $(".loader-overlay-container").fadeIn(0);
}

/**
 * Masque l'overlay de chargement
 */
function hideLoaderOverlay() {
    $(".loader-overlay-container").fadeOut('fast');
}

// Overview card
function populateStreetOverviewCard(property, isMine, isMortgaged) {
    $('.overview-card .header').html(property.name);
    $('.overview-card .header').removeClass('station');
    $('.overview-card .header').removeClass('company');
    $('.overview-card .header').removeClass('eau');
    $('.overview-card .header').removeClass('electricite');
    $('.overview-card .header').css("background-color", property.color);
    $('.overview-card .header').css("color", "white");
    let htmlContent;
    if (!property.isMortgaged) {
        htmlContent = `<div class="rent">` + property.rentalPrices.empty + `</div>
                        <div class="with-house">
                            <div>Avec 1 Maison</div>
                            <div>`+ property.rentalPrices.house[0] + `</div>
                        </div>
                        <div class="with-house">
                            <div>Avec 2 Maisons</div>
                            <div>`+ property.rentalPrices.house[1] + `</div>
                        </div>
                        <div class="with-house">
                            <div>Avec 3 Maisons</div>
                            <div>`+ property.rentalPrices.house[2] + `</div>
                        </div>
                        <div class="with-house">
                            <div>Avec 4 Maisons</div>
                            <div>`+ property.rentalPrices.house[3] + `</div>
                        </div>
                        <div class="with-hotel">
                            <div>Avec 1 Hotel</div>
                            <div>`+ property.rentalPrices.hostel + `</div>
                        </div>
                        <div class="house-price">Prix des Maisons `+ property.prices.house + `€ chacune</div>
                        <div class="hotel-price">Prix d'un Hôtel `+ property.prices.house + `€ plus 4 maisons</div>
                        <div class="mortgage">Valeur de l'hypothèque : `+ property.prices.empty / 2 + `€</div>`
    }
    else {
        htmlContent = `<div class="mortgage">Prix de rachat l'hypothèque : ` + Math.round((property.prices.empty / 2) * 1.1) + `€</div>`
    }

    $('.overview-card .content').html(htmlContent);
}

function populateStationOverviewCard(station, isMine, isMortgaged) {
    $('.overview-card .header').html(station.name);
    $('.overview-card .header').removeClass('station');
    $('.overview-card .header').removeClass('company');
    $('.overview-card .header').removeClass('eau');
    $('.overview-card .header').removeClass('electricite');
    $('.overview-card .header').addClass('station');
    $('.overview-card .header').css("background-color", "white");
    $('.overview-card .header').css("color", "black");
    let htmlContent;
    if (!station.isMortgaged) {
        htmlContent = `<div class="rent">` + station.rentalPrices[0] + `</div>
                        <div class="with-house">
                            <div>Si vous avez 2 Gares</div>
                            <div>`+ station.rentalPrices[1] + `</div>
                        </div>
                        <div class="with-house">
                            <div>Si vous avez 3 Gares</div>
                            <div>`+ station.rentalPrices[2] + `</div>
                        </div>
                        <div class="with-house">
                            <div>Si vous avez 4 Gares</div>
                            <div>`+ station.rentalPrices[3] + `</div>
                        </div>
                        <div class="mortgage">Valeur de l'hypothèque : `+ station.price / 2 + `€</div>`
    }
    else {
        htmlContent = `<div class="mortgage">Prix de rachat l'hypothèque : ` + Math.round((station.price / 2) * 1.1) + `€</div>`
    }

    $('.overview-card .content').html(htmlContent);
}

function populateCompanyOverviewCard(publicCompany, isMine, isMortgaged) {
    $('.overview-card .header').html(publicCompany.name);
    $('.overview-card .header').removeClass('station');
    $('.overview-card .header').removeClass('company');
    $('.overview-card .header').removeClass('eau');
    $('.overview-card .header').removeClass('electricite');
    $('.overview-card .header').addClass('company');
    if (publicCompany.name == 'Syndicat Des Eaux et de l\'Assainissement') {
        $('.overview-card .header').addClass('eau')
    } else if (publicCompany.name == 'Eléctricité de Strasbourg') {
        $('.overview-card .header').addClass('electricite')
    }
    $('.overview-card .header').css("background-color", "rgb(58, 58, 58)");
    $('.overview-card .header').css("color", "white");
    let htmlContent;
    if (!publicCompany.isMortgaged) {
        htmlContent = `<div class="company-description">Si l'on possède UNE carte de compagnie de Service Public,
                            le loyer est 4 fois le montant indiqué par les dés.<br><br>Si l'on possède les DEUX cartes de compagnie de Service Public,
                            le loyer est 10 fois le montant indiqué par les dés.</div>
                        <div class="rent">`+ publicCompany.price + `</div>
                        <div class="mortgage">Valeur de l'hypothèque : `+ publicCompany.price / 2 + `€</div>`
    }
    else {
        htmlContent = `<div class="mortgage">Prix de rachat l'hypothèque : ` + Math.round((publicCompany.price / 2) * 1.1) + `€</div>`
    }
    $('.overview-card .content').html(htmlContent);
}

function emptyOverviewCard() {
    $('.overview-card .header')
        .html('')
        .attr('data-id', '')
        .attr('data-owner-id', '')
        .removeClass('station')
        .removeClass('company')
        .removeClass('eau')
        .removeClass('electricite')
        .css("background-color", "white")
        .css("color", "white");
    $('.overview-card .content').html('');

    $('.overview-card .buy-button').css("display", "none");
    $('.overview-card .sell-button').css("display", "none");
    $('.overview-card .mortgage-button').css("display", "none");
    $('.overview-card .buyback-button').css("display", "none");
}

/**
 * Affiche les infos d'une propriété dans le HUD
 * @param property Propriété dont il faut afficher les informations
 */
function displayPropertyInfos(property) {
    emptyOverviewCard();
    $('.overview-card').attr('data-id', property.id);
    let isMine = (property.ownerID == ID);
    let isMortgage = property.isMortgage;
    if (property.type == "street") {
        populateStreetOverviewCard(property, isMine, isMortgage);
    } else if (property.type == "trainStation") {
        populateStationOverviewCard(property, isMine, isMortgage);
    } else {
        populateCompanyOverviewCard(property, isMine, isMortgage);
    }
    $('.overview-card').fadeIn();
}

// addPurchaseOffer(1, 'ABC', 'Avenue des Vosges', 30000);
// addSaleOffer(1, 'ABC', 'Avenue des Vosges', 30000);

function buyProp(e) {
    const propertyID = $(e).parent().parent().attr('data-id');
    console.log("propertyID=" + propertyID);
    $('#buyModal #overviewCardBuyForm #overviewCardBuyFormPropertyId').val(propertyID);
    $('#buyModal #overviewCardBuyForm #overviewCardBuyFormPrice').val(10);
    $('#buyModal').modal('show');

    return false;
};

function sellProp(e) {
    const propertyID = $(e).parent().parent().attr('data-id');
    console.log("propertyID=" + propertyID);
    $('#sellModal #overviewCardBuyForm #overviewCardBuyFormPropertyId').val(propertyID);
    $('#sellModal #overviewCardBuyForm #overviewCardBuyFormPrice').val(10);
    $('#sellModal').modal('show');

    return false;
};

function mortgageProp(e) {
    const propertyID = parseInt($(e).parent().parent().attr('data-id'));
    //console.log("propertyID=" + propertyID);
    socket.emit('gamePropertyMortgageReq', { properties: [propertyID] });
    console.log("gamepropertyMortgageReq");

    return false;
};

function rebuyProp(e) {
    const propertyID = parseInt($(e).parent().parent().attr('data-id'));
    //console.log("propertyID=" + propertyID);
    socket.emit("gamePropertyUnmortgageReq", { propertyID: propertyID });
    console.log("gamePropertyUnmortgageReq");

    return false;
};

// $('.overview-card .mortgage-button').click(function (e) {
//     e.preventDefault();
//     const propertyID = parseInt($(this).parent('.overview-card').attr('data-id'));
//     console.log(propertyID);
//     socket.emit('gamePropertyMortgageReq', { properties: [propertyID] });
//     console.log("gamepropertyMortgageReq");

//     return false;
// });

// $('.overview-card .buyback-button').click(function (e) {
//     e.preventDefault();
//     const propertyID = parseInt($(this).parent('.overview-card').attr('data-id'));
//     console.log(propertyID);
//     socket.emit("gamePropertyUnmortgageReq", { propertyID: propertyID });
//     console.log("gamePropertyUnmortgageReq");
//     return false;
// });


$('#overviewCardBuyForm .send').click(function (e) {
    e.preventDefault();
    let propertyID = parseInt($('#overviewCardBuyForm #overviewCardBuyFormPropertyId').val());
    let price = parseInt($('#overviewCardBuyForm #overviewCardBuyFormPrice').val());

    let property = getPropertyById(propertyID);
    if (!property)
        return;

    console.log(property);

    socket.emit('gameOfferSendReq', { receiverID: property.ownerID, propertyID: property.id, price: price });
    console.log('gameOfferSendReq :');
    console.log(price);
    console.log(propertyID);

    $('#overviewCardModal').modal('hide');

    return false;
});

function mortgageProperty(id) {
    $('.property[data-id="' + id + '"]').addClass('disabled');
}

function unMortgageProperty(id) {
    $('.property[data-id="' + id + '"]').removeClass('disabled');
}

$('body').on('click', '.bid-popup .bid-validation', function (e) {
    e.preventDefault();
    const bidID = parseInt($(this).closest('.bid-popup').attr('data-bidid'));
    console.log($(this).parent().find(".input").val());
    const price = parseInt($(this).parent().children(':first-child').val());
    socket.emit('gameOverbidReq', { bidID: bidID, price: price });
    console.log("gameOverbidReq");
    validateBid(bidID);

    return false;
});

$('body').on('click', '.bid-popup .bid-cancel', function (e) {
    e.preventDefault();
    const bidID = parseInt($(this).closest('.bid-popup').attr('data-bidid'));
    $(this).parent().children(':first-child').val('0');
    const price = parseInt($(this).parent().children(':first-child').val());
    socket.emit('gameOverbidReq', { bidID: bidID, price: price });
    console.log("gameOverbidReq");
    validateBid(bidID);

    return false;
});

// Player failure
socket.on('gamePlayerFailureRes', (res) => {
    console.log('gamePlayerFailureRes');
    console.log(res);

    const player = getPlayerById(res.playerID);

    if (player) {
        triggerSplashAnimation(`<i class="fas fa-skull-crossbones"></i><br>${player.nickname} a fait faillite !`, '#DB1311');

        // Toutes les propriétés sont à nouveau à vendre
        DATA.properties.forEach((property) => {
            if (property.ownerID == player.id)
                property.ownerID = null;
        });

        // Enlever les propriétés du HUD pour ce joueur
        $(`.player-entry[data-id="${res.playerID}"] .properties-container`).empty();

        // Simple texte d'annonce
        $(`.player-entry[data-id="${res.playerID}"]`).addClass('failure');
    }
});


// Fin de partie
socket.on('gameEndRes', (res) => {
    const winner = getPlayerById(res.winnerID);
    const type = res.type; // 'failure' (dernier en vie) ou 'timeout'
    const duration = res.duration * 1.66667e-5; // durée totale du jeu en minutes

    alert('Fin de la partie (' + type + ') après ' + duration + ' minutes de jeu');
    alert(winner.nickname + ' a gagné, félicitations !');
    window.location = '/lobby';
});


// Quitter la partie
$('#content').on('click', '#quit-game', () => {
    socket.emit('gamePlayerLeavingReq');
});
socket.on('gamePlayerLeavingRes', (res) => {
    if (res.error === 0)
        window.location = '/lobby';
    else
        notify(res.status, 'danger', 5);
});
socket.on('gamePlayerHasLeftRes', (res) => {
    console.log("=== PLAYER LEFT ===");
    console.log(res);
    const player = getPlayerById(res.playerID);
    if (player) {
        console.log('PLAYER LEFT IS')
        console.log(player);
        addMsg(-1, `${player.nickname} a quitté la partie :/`, new Date());
        removePlayerEntry(player);
    }
});



const splashSettings = {};
splashSettings.opacityIn = [0, 1];
splashSettings.scaleIn = [0.2, 1];
splashSettings.scaleOut = 3;
splashSettings.durationIn = 800;
splashSettings.durationOut = 600;
splashSettings.delay = 500;

const splashAnim = anime.timeline({ loop: false, autoplay: false })
    .add({
        targets: '.splash-text .letters-1',
        opacity: splashSettings.opacityIn,
        scale: splashSettings.scaleIn,
        duration: splashSettings.durationIn
    }).add({
        targets: '.splash-text .letters-1',
        opacity: 0,
        scale: splashSettings.scaleOut,
        duration: splashSettings.durationOut,
        easing: "easeInExpo",
        delay: splashSettings.delay
    }).add({
        targets: '.splash-text',
        opacity: 0,
        duration: 500,
        delay: 500
    });

/**
 * Génère une animation "splash screen" (en grand à l'écran)
 * @param {string} text Le texte à afficher
 */
function triggerSplashAnimation(text, color) {
    $('.splash-text .letters-1').html(text).css('color', color);
    splashAnim.restart();
}

function switchZoom(t) {
    if ($(t).is(':checked')) {
        zoomOnOff(1);
        console.log('Zoom activé');
    } else {
        zoomOnOff(0);
        console.log('Zoom désactivé');
    }
}

function openBuyModal(e) {
    $('#buyModal button.buySend').attr("data-id", e);
    $('#buyModal').modal('show');
}

function openSellModal(e) {
    $('#sellModal button.sellSend').attr("data-id", e);
    $('#sellModal').modal('show');
}
