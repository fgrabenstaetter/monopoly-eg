const Constants = require('./../lib/constants');


class NewCell {
    constructor (id, token, name, description, type, property=null) {
        this.id = id;
        this.token = token;
        this.name = name;
        this.description = description;
        this.type = type;
        this.property = property;

        if (!(this.type in Constants.cellTypes))
            throw 'Type de cellule inconnu - ' + this.type;

        this.effectCallback = {
            start: this.startEffect,
            property: this.propertyEffect,
            communityChest: this.communnityChestEffect,
            chance: this.chanceEffect,
            other: this.otherEffect
        }[this.type];
    }

    /**
     @param game l'instance actuelle du jeu
     @param player le joueur actuel
     */
    execute (game, player) {
        this.effectCallback(game, player);
    };

    /**
     @param game l'instance actuelle du jeu
     @param player le joueur actuel
        Si le joueur passe par start, il recoit $200
     */
    startEffect (game, player) {
        player.addMoney(200);
    };

    /**
     @param game l'instance actuelle du jeu
     @param player le joueur actuel
        Si le joueur arrive sur une propriete, on execute l'effet de la propriete
     */
    propertyEffect (game, player) {
        this.property.execute(game, player);
    };

    /**
     @param game l'instance actuelle du jeu
     @param player le joueur actuel
        On retire une carte depuis communityChestDeck du jeu
     */
    communnityChestEffect (game, player) {
        game.communityChestDeck.drawCard(game, player);
    };

    /**
     @param game l'instance actuelle du jeu
     @param player le joueur actuel
        On retire une carte depuis chanceDeck du jeu
     */
    chanceEffect (game, player) {
        game.chanceDeck.drawCard(game, player);
    };

    /**
     @param game l'instance actuelle du jeu
     @param player le joueur actuel
        Temporaire, ne fait rien, utilise pour des cellules nouvelles
     */
    otherEffect (game, player) {

    };
}

module.exports = NewCell;
