const Constants = require('../lib/constants');

class Bid {

    static idCounter = 0;

    static bidByID (game, id) {
        for (const bid of game.bids) {
            if (bid.id === id)
                return bid;
        }
        return false;
    }

    static delBid (bid) {
        const ind = bid.game.bids.indexOf(bid);
        if (ind === -1)
            return false;
        if (bid.manual)
            bid.game.alreadyOneManualBid = false;

        bid.game.bids.splice(ind, 1);
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
        this.nBidsOnProperty      = [];
        this.lastOverbids         = []
        this.game.bids.push(this);
        setTimeout(this.expired.bind(this), Constants.GAME_PARAM.BID_EXPIRE_AFTER);

        if (manual)
            this.game.alreadyOneManualBid = true;

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
        if (this.nBidsOnProperty.indexOf(player.id) === -1)
            this.nBidsOnProperty.push(player.id);

        let targetMaxLen = 0;
        for (const player of this.game.players) {
            if (player.connected && !player.failure && player !== this.initialPropertyOwner)
                targetMaxLen ++;
        }

        if (this.property.owner !== this.initialPropertyOwner) {
            this.expired();
            return false;
        }

        if (amount <= this.amountAsked) {
            if (this.nBidsOnProperty.length === targetMaxLen)
                this.expired();

            return true;
        }

        if (this.player)
            this.lastOverbids.push({ player: this.player, amountAsked: this.amountAsked });

        this.amountAsked = amount;
        this.player = player;


        if (this.nBidsOnProperty.length === targetMaxLen)
            this.expired();

        return true;
    }

    expired () {
        const curBid = Bid.bidByID(this.game, this.id);
        if (!curBid)
            return;

        while (true) {
            if ((this.player && ((this.player.money < this.amountAsked) || this.player.failure)) || this.initialPropertyOwner !== this.property.owner) {
                this.player = null;
                if (this.lastOverbids.length > 0) {
                    const last = this.lastOverbids.pop();
                    this.player = last.player;
                    this.amountAsked = last.amountAsked;
                } else
                    break;
            } else
                break;
        }

        const oldOwner = this.property.owner ? this.property.owner : this.game.bank;

        if (this.player) {
            this.player.loseMoney(this.amountAsked);
            oldOwner.addMoney(this.amountAsked);
            oldOwner.delProperty(this.property);
            this.player.addProperty(this.property);
        }

        Bid.delBid(this);

        this.game.GLOBAL.network.io.to(this.game.name).emit('gameBidEndedRes', {
            bidID                 : this.id,
            propertyID            : this.property.id,
            propertyOldOwnerID    : oldOwner === this.game.bank ? null : oldOwner.id,
            playerID              : this.player ? this.player.id : null,
            playerMoney           : this.player ? this.player.money : null,
            price                 : this.amountAsked,
            bankMoney             : this.game.bank.money,
            propertyOldOwnerMoney : oldOwner ? oldOwner.money : null
        });
    }
}

module.exports = Bid;
