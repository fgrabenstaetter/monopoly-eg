const Card = require('./card');

class Deck {
    /**
     * @param cardsInfo Les données statiques des cartes du jeu (Chances OU Communautaires)
     */
    constructor (cardsInfo) {
        let cards = [];

        for (const cardInfo of cardsInfo) {
            let card = new Card(
                cardInfo.description,
                cardInfo.effectType,
                cardInfo.effectArg1,
                cardInfo.effectArg2
            );
            cards.push(card);
        }
        this.activeCards = cards;
        this.drawnCards = [];

        this.shuffle();
    }

    /**
     * Mélange le deck des cartes (Chances ou Communautaires)
     */
    shuffle() {
        for (let i = this.activeCards.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.activeCards[i], this.activeCards[j]] = [this.activeCards[j], this.activeCards[i]];
        }
    }

    /**
     * Piocher une carte (Chance ou Communautaire)
     * @param game Le jeu devant executant la carte
     * @param player Le joueur devant piocher la carte
     */
    drawCard (game, player) {
        if (this.activeCards.length === 0) {
            this.activeCards = this.drawnCards;
            this.shuffle();
            const card = this.activeCards.pop();
            card.execute(game, player);
            this.drawnCards.push(card);
        }
        else {
            const card = this.activeCards.pop();
            card.execute(game, player);
            this.drawnCards.push(card);
        }
    }
}

module.exports = Deck;
