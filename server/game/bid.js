const Constants = require('../lib/constants');


class Bid {

    static idCounter = 0;

    constructor (player, property, amountAsked, game) {
        this.id = Bid.idCounter ++;
        this.player = player;
        this.property = property;
        this.amountAsked = amountAsked;
        this.game = game;
        setTimeout(this.expired.bind(this), Constants.GAME_PARAM.BID_EXPIRE_AFTER);
    }


    updateBid (player, amount) {
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

    expired () {
        const curBid = this.game.bidByID(this.id);
        //this.game
    }
}

module.exports = Bid;
