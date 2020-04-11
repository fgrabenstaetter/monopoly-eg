const Constants = require('../lib/constants');

class Bid {

    static idCounter = 0;
    static bids = [];

    static bidByID (bidID) {
        for (const bid of Bid.bids) {
            if (bidID === bid.id)
                return bid;
        }
        return false;
    }

    static delBid (bid) {
        const ind = Bid.bids.indexOf(curBid);
        if (ind === -1)
            return false;
        Bid.bids.splice(ind, 1);
        return true;
    }

    constructor (property, amountAsked, game) {
        this.id                   = Bid.idCounter ++;
        this.player               = null;
        this.property             = property;
        this.initialPropertyOwner = property.owner;
        this.amountAsked          = amountAsked;
        this.game                 = game;
        this.text                 = 'Enchère en cours pour la propriété ' + this.property.name;
        Bid.bids.push(this);
        setTimeout(this.expired.bind(this), Constants.GAME_PARAM.BID_EXPIRE_AFTER);

        const msg = 'Une enchère a démarrée pour' + this.property.name;
        this.game.GLOBAL.network.io.to(this.game.name).emit('gameBidRes', {
            bidID      : this.id,
            playerID   : null,
            text       : msg,
            propertyID : this.property.id,
            price      : this.amountAsked
        });
    }

    //Test réalisé dans network
    updateBid (player, amount) {
        this.amountAsked = amount;
        this.player = player;

        if (this.property.owner !== this.initialPropertyOwner) {
            this.expired();
            return false;
        }
    }

    expired () {
        const curBid = Bid.bidByID(this.id);
        if (!curBid)
            return;

        // si le joueur n'a plus l'argent qu'il a souhaité pour enchérir, ou que le propriétaire de la propriété a changé entre temps, mettre this.player null => enchère échouée
        if ((this.player && this.player.money < this.amountAsked) || this.initialPropertyOwner !== this.property.owner)
            this.player = null;

        if (this.player) {
            this.player.loseMoney(this.amountAsked);
            this.player.addProperty(this.property);
            this.game.bank.addMoney(this.amountAsked);
            this.game.bank.delProperty(this.property);
        }

        this.game.GLOBAL.network.io.to(this.game.name).emit('gameBidEndedRes', {
            bidID     : this.id,
            propertyID: this.property.id,
            playerID  : this.player ? this.player.id : null,
            price     : this.amountAsked,
            bankMoney : this.game.bank.money
        });
    }
}

module.exports = Bid;
