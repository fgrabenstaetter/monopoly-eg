const Offer = require('./offer.js');
const Constants = require('../lib/constants');


class Bid {

    static idCounter = 0;

    constructor (player, property, amountAsked) {
        this.id = Bid.idCounter ++;
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

    updateBid(player, amount) {
        let max = 0;
        for (let tmp of this.bids) {
            if (tmp.amountAsked > max) {
                max = tmp.amountAsked;
            }
        }
        if (amount > max) {
            this.updateAmountAsked(amout);
            this.player = player;
            this.timeCreated = Date.now();
        }
    }

    updateAmountAsked (amountAsked) {
        this.amountAsked = amountAsked;
    }
}

module.exports = Bid;
