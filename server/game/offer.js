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

    /**
     * @param property La propriété à vendre ou null pour carte sortie de prison
     */
    constructor (game, player, receiver, property, amount) {
        this.game     = game;
        this.id       = Offer.idCounter ++;
        this.maker    = player;
        this.receiver = receiver;
        this.property = property;
        this.amount   = amount;
        Offer.offers.push(this);
        setTimeout(this.expired.bind(this), Constants.GAME_PARAM.OFFER_EXPIRE_AFTER);
    }

    expired () {
        if (!Offer.offerByID(this.id))
            return false;

        this.game.GLOBAL.network.io.to(this.game.name).emit('gameOfferFinishedRes', {
            receiverID : null,
            offerID    : this.id,
            price      : this.amount,
            propertyID : this.property ? this.property.id : -1,
            makerID    : this.maker.id
        });

        Offer.delOffer(this);
    }

    accept () {
        if (!Offer.delOffer(this))
            return false;

        this.maker.addMoney(this.amount);
        this.receiver.loseMoney(this.amount);

        if (this.property) {
            if (this.property.owner !== this.maker)
                return false;

            this.maker.delProperty(this.property);
            this.receiver.addProperty(this.property);
        } else { // carte sortie de prison
            if (this.maker.nbJailEscapeCards === 0)
                return false;

            this.maker.nbJailEscapeCards --;
            this.receiver.nbJailEscapeCards ++;
        }

        return true;
    }
}

module.exports = Offer;
