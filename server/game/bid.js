const Constants = require('../lib/constants');

class Bid {

    static idCounter = 0;
    static bids = [];
    static alreadyOneManualBid = false; // max 1 bid mannuelle à la fois

    static bidByID (id) {
        for (const bid of Bid.bids) {
            if (bid.id === id)
                return bid;
        }
        return false;
    }

    static delBid (bid) {
        const ind = Bid.bids.indexOf(bid);
        if (ind === -1) {
            if (bid.manual)
                Bid.alreadyOneManualBid = false;
            return false;
        }
        Bid.bids.splice(ind, 1);
        return true;
    }

    constructor (property, amountAsked, game, manual = false) {
        this.id                   = Bid.idCounter ++;
        this.player               = null;
        this.property             = property;
        this.initialPropertyOwner = property.owner;
        this.amountAsked          = amountAsked;
        this.game                 = game;
        this.manual               = manual;
        this.text                 = this.property.name;
        Bid.bids.push(this);
        setTimeout(this.expired.bind(this), Constants.GAME_PARAM.BID_EXPIRE_AFTER);

        if (manual)
            Bid.alreadyOneManualBid = true;

        const msg = this.property.name;
        this.game.GLOBAL.network.io.to(this.game.name).emit('gameBidRes', {
            bidID           : this.id,
            playerID        : null,
            text            : msg,
            propertyID      : this.property.id,
            propertyOwnerID : this.property.owner ? this.property.owner.id : null,
            price           : this.amountAsked
        });
    }

    //Test réalisé dans network
    updateBid (player, amount) {
        if (amount <= this.amountAsked)
            // return false;
            return true; // TMP POUR LES ENCHERES ONESHOT UNIQUEMENT

        this.amountAsked = amount;
        this.player = player;

        if (this.property.owner !== this.initialPropertyOwner) {
            this.expired();
            return false;
        }

        return true;
    }

    expired () {
        const curBid = Bid.bidByID(this.id);
        if (!curBid)
            return;

        // si le joueur n'a plus l'argent qu'il a souhaité pour enchérir, ou que le propriétaire de la propriété a changé entre temps, mettre this.player null => enchère échouée
        if ((this.player && this.player.money < this.amountAsked) || this.initialPropertyOwner !== this.property.owner)
            this.player = null;

        const oldOwner = this.property.owner ? this.property.owner : this.game.bank;

        if (this.player) {
            this.player.loseMoney(this.amountAsked);
            this.player.addProperty(this.property);
            oldOwner.addMoney(this.amountAsked);
            oldOwner.delProperty(this.property);
        }

        Bid.delBid(this);

        this.game.GLOBAL.network.io.to(this.game.name).emit('gameBidEndedRes', {
            bidID              : this.id,
            propertyID         : this.property.id,
            propertyOldOwnerID : oldOwner === this.game.bank ? null : oldOwner.id,
            playerID           : this.player ? this.player.id : null,
            playerMoney        : this.player ? this.player.money : null,
            price              : this.amountAsked,
            bankMoney          : this.game.bank.money,
            propertyOwnerMoney : oldOwner ? oldOwner.money : null
        });
    }
}

module.exports = Bid;
