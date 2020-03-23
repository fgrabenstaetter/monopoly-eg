const Card = require('./card');

class Deck {
    constructor (cardsInfo) {
        let cards = [];

        for (let cardInfo of cardsInfo) {
            let card = new Card(
                cardInfo.token,
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

    shuffle() {
        for (let i = this.activeCards.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.activeCards[i], this.activeCards[j]] = [this.activeCards[j], this.activeCards[i]];
        }
    }

    drawCard (game, player) {
        if (this.activeCards.length == 0) {
            this.activeCards = this.drawnCards;
            //this.drawnCards = [];
            this.shuffle();
        }
        else {
            const card = this.activeCards.pop();
            card.execute(game, player);
            this.drawnCards.push(card);
        }
    }
}

module.exports = Deck;
