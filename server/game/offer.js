const Constants = require('./../lib/constants');

class Offer {

    static idCounter = 0;
    static offers = [];

    static offerByID (id) {
        for (const offer of Offer.offers)
            if (offer.id === id)
                return offer;
        return false;
    }

    static delOffer (offer) {
        const ind = Offer.offers.indexOf(offer);
        if (ind === -1)
            return false;
        Offer.offers.splice(ind, 1);
        return true;
    }

    constructor (game, player, receiver, property, amount) {
        this.game = game;
        this.id = Offer.idCounter ++;
        this.maker = player;
        this.receiver = receiver;
        this.property = property;
        this.amount = amount;
        Offer.offers.push(this);
        setTimeout(this.expired.bind(this), Constants.GAME_PARAM.OFFER_EXPIRE_AFTER);
    }

    expired () {
        if (!Offer.offerByID(this.id))
            return false;

        this.game.GLOBAL.network.io.to(game.name).emit('gameOfferFinishedRes', {
            receiverID : null,
            offerID    : this.id,
            price      : offer.amount,
            propertyID : offer.property.id,
            makerID    : offer.maker.id
        });

        Offer.delOffer(this);
    }

    get accept () {
        if (!Offer.delOffer(this))
            return false;

        this.maker.delProperty(offer.property);
        this.maker.addMoney(this.amount);
        this.receiver.addProperty(offer.property);
        this.receiver.loseMoney(this.amount);
    }
}

module.exports = Offer;
