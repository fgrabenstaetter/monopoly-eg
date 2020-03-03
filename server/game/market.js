const Bid = require('./bid.js');


/*
	Manager of all offers in the game
 */
class Market {
	constructor () {
        this.bids = [];
	}

    addBid (player, property, amountAsked) {
        let currentBid = this.getBid(player, property);
        // premierement, il faut verifier si il n'y a pas deja une telle enchere
        if (currentBid){
            currentBid.updateAmountAsked(amountAsked);
        }
        else {
            let bid = new Bid(player, property, amountAsked);
            this.bids.push(bid);
        }
    }

    getBid (player, property) {
        for (let bid of this.bids)
            if (player == bid.player && property == bid.property)
                return bid;
    }

    placeOffer (player, property, offeringPlayer, amountOffered) {
        // premierement, il faut s'assurer qu'il y a deja une telle enchere
        let bid = this.getBid(player, property);
        if (!bid)
            return false;
        else
            bid.placeOffer(offeringPlayer, amountOffered);
    }
}


module.exports = Market;
