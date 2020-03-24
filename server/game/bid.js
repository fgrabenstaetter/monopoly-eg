const Constants = require('../lib/constants');


class Bid {

    static idCounter = 0;

    constructor (property, amountAsked, game) {
        this.id = Bid.idCounter ++;
        this.player = null;
        this.property = property;
        this.amountAsked = amountAsked;
        this.game = game;
        this.text = 'Enchère en cours pour la propriété ' + this.property.name;
        setTimeout(this.expired.bind(this), Constants.GAME_PARAM.BID_EXPIRE_AFTER);
    }

    //Test réalisé dans network
    updateBid (player, amount) {
        this.amountAsked = amount;
        this.player = player;
    }

    expired () {
        const curBid = this.game.bidByID(this.id);
        if (curBid === null)
            return;
        const index = this.game.bids.indexOf(curBid);
        if (this.player === null)
            return;
        this.player.addProperty(this.property);
        this.player.loseMoney(this.amountAsked);
        this.game.bank.addMoney(this.amountAsked);
        this.game.bank.delProperty(this.property);
        this.game.bids.splice(index, 1);
        this.game.GLOBAL.network.io.to(this.game.name).emit('gameBidEndedRes', {
            bidID     : this.id,
            playerID  : this.player.id,
            price     : this.amountAsked,
            bankMoney : this.game.bank.money
        });
    }
}

module.exports = Bid;
