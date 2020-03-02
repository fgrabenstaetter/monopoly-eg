const Offer = require('./offer.js');


class Bid {
    constructor (player, property, amountAsked) {
        this.player = player;
        this.property = property;
        this.amountAsked = amountAsked;
        this.timeCreated = Date.now();
        this.offers = [];
    }

    /*
        Ajoute ou reactualise l'offre d'un joueur
     */
    placeOffer (offeringPlayer, amountOffered) {
        let offer = this.getOffer(offeringPlayer)
        if (!offer) {
            let offer = new Offer(offeringPlayer, amountOffered);
            this.offers.push(offer);
        }
        else
            offer.setAmount(amountOffered);
    }

    getOffer (offeringPlayer) {
        for (let offer of this.offers)
            if (offeringPlayer == offer.player)
                return offer;
    }

    updateAmountAsked (amountAsked) {
        this.amountAsked = amountAsked;
    }
}

module.exports = Bid;
