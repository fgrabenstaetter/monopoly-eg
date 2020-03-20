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

function nickToId (nick) {
    for (const row of DATA.players) {
        if (row.nickname === nick)
            return row.id;
    }
}
function idToNick (id) {
    for (const row of DATA.players) {
        if (row.id === id)
            return row.nickname;
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

    console.log('Le jeu a démarré ! joueurs: ');
    for (const pl of DATA.players)
        console.log(pl.nickname);
});

socket.on('gameTurnRes', (data) => {
    // PAS FORCÉMENT MON TOUR !  tester si data.playerID === ID
    console.log('C\'est au tour de ' + idToNick(data.playerID) + ' de jouer !');
    const turnTimeout = data.turnEndTime;
    // afficher décompte de temps du tour

    if (data.playerID === ID) {
        // C'est mon tour !
    }
});

socket.on('gameChatReceiveRes', (data) => {
    addMsg(data.playerID, data.text, data.createdTime);
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
