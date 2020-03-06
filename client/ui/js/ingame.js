let playersData, cellsData, propertiesData, cardsData; // données statiques de jeu (format: voir /socket_events.md)
let gameEndTime; // timestamp de fin forcée du jeu

function nickToId (nick) {
    for (const row of playersData) {
        if (row.nickname === nick)
            return row.id;
    }
}
function idToNick (id) {
    for (const row of playersData) {
        if (row.id === id)
            return row.nickname;
    }
}

/////////////////////////////
// SOCKET EVENTS LISTENERS //
/////////////////////////////

socket.on('gameStartedRes', (data) => {
    playersData    = data.players;
    cellsData      = data.cells;
    propertiesData = data.properties;
    cardsData      = data.cards;

    console.log('Le jeu a démarré ! joueurs: ');
    for (const pl of playersData)
        console.log(pl.nickname);
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