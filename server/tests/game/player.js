const Possession = require('./possession.js');

// Player = objet joueur, pour stocker toutes les données sur le joueur (argent, propriétés, ... et aussi son socket
class Player {

    // @param pseudo le pseudo associé au joueur
    // @param socket le socket associé au joueur
    constructor (pseudo, socket) {
        this.pseudo = pseudo;
        this.socket = socket;
        this.money = 1500;
        this.possessions = []; // tableau d'objets Possession
        this.case = 0; // case 0 = case Début du plateau ?
    }

    addPossession (name) {
        this.possessions.push(new Possession(name));
    }
}

module.exports = Player;
