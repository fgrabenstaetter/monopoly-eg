/////////////////////////////
// SOCKET EVENTS LISTENERS //
/////////////////////////////

let playersData, cellsData, propertiesData, cardsData; // données statiques de jeu (format: voir /socket_events.md)
let gameEndTime; // timestamp de fin forcée du jeu

socket.on('gameStartedRes', (data) => {
    playersData = data.players;
    cellsData = data.cells;
    propertiesData = data.properties;
    cardsData = data.cards;

    console.log('Le jeu a démarré ! joueurs: ');
    for (const pl of playersData)
        console.log(pl.nickname);
});

socket.emit('gameReadyReq'); // AUCUN EVENT SOCKET (ON) APRES CECI

////////////////////////////
// INTERFACE JS FUNCTIONS //
////////////////////////////