const Constants = require('../lib/constants');


class Bid {

    static idCounter = 0;

    constructor (player, property, amountAsked, game) {
        this.id = Bid.idCounter ++;
        this.player = player;
        this.property = property;
        this.amountAsked = amountAsked;
        this.game = game;
        // setTimeout(this.expired.bind(this), Constants.GAME_PARAM.BID_EXPIRE_AFTER); // Si décommenté -> génère une erreur fatale...
    }


    updateBid (player, amount) {
        this.amountAsked = amount;
        this.player = player;
    }

    expired () {
        const curBid = this.game.bidByID(this.id);
        if (curBid === null)
            return false;
        const index = this.game.bids.indexOf(curBid);
        if (index === -1)
            return;
        this.player.loseMoney(this.amountAsked);
        this.game.bank.addMoney(this.amountAsked);
        this.game.bank.delProperty(this.property);
        this.game.bids.splice(index, 1);
        this.game.GLOBAL.network.io.to(this.name).emit('gameBidEndedRes', {bidID: this.id, playerID: this.player, price: this.amountAsked, bankMoney: this.game.bank.money});
    }
}

module.exports = Bid;
