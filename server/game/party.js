const Possession = require('./possession.js');
let roomCounter = 0; // obtenir un nom de room (socket.io) unique pour chaque nouvelle partie

// Party = objet pour stocker et gérer une partie de jeu, avec ses joueurs, le plateau, etc...
class Party {

    // @param players tableau d'objets Player
    // @param l'object socket.io
    constructor (players, io) {
        this.players = players;
        this.io = io;
        this.room = roomCounter ++; // room socket.io, permet des broadcats facilités sur tous les joueurs de la partie

        // placer tous les joueurs dans la room socket.io
        for (const p of players)
            p.socket.join(this.room);
    }

    // exemple
    tellPlayersPartyStarted () {
        // fabriquer la liste des pseudos
        let pseudos = [];
        for (const p of this.players)
            pseudos.push(p.pseudo);

        // signaler à chaque joueur (broadcast) que la partie vient de démarrer, et leur envoyer la liste des joueurs (leurs pseudo)
        this.io.to(this.room).emit('partyStarted', pseudos);
        // (socket.io emit converti automatiquement les tableaux, objets, ... au format JSON)
    }

    // lancer les dés
    // @return tableau d'entiers random [1-6, 1-6]
    rollTheDice () {
        return [Math.ceil(Math.random() * 6), Math.ceil(Math.random() * 6)];
    }
}

module.exports = Party;
