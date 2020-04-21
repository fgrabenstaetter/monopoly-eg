const Constants = require('./../lib/constants');

class Offer {

    static idCounter = 0;

    static offerByID (game, id) {
        for (const offer of game.offers)
            if (offer.id === id)
                return offer;
        return false;
    }

    static delOffer (offer) {
        const ind = offer.game.offers.indexOf(offer);
        if (ind === -1)
            return false;
        offer.game.offers.splice(ind, 1);
        return true;
    }

    /**
     * @param property La propriété à acheter ou null pour carte sortie de prison
     */
    constructor (game, player, receiver, property, amount) {
        this.game     = game;
        this.id       = Offer.idCounter ++;
        this.maker    = player;
        this.receiver = receiver;
        this.property = property;
        this.amount   = amount;
        this.game.offers.push(this);
        setTimeout(this.expired.bind(this), Constants.GAME_PARAM.OFFER_EXPIRE_AFTER);
    }

    expired () {
        if (!Offer.offerByID(this.game, this.id))
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
        if (!Offer.delOffer(this) || this.maker.money < this.amount)
            return false;

        if (this.property) {
            if (this.property.owner !== this.receiver) // peux avoir changé entre temps
                return false;

            this.receiver.delProperty(this.property);
            this.maker.addProperty(this.property);
        } else { // carte sortie de prison
            if (this.receiver.nbJailEscapeCards === 0)
                return false;

            this.receiver.nbJailEscapeCards --;
            this.maker.nbJailEscapeCards ++;
        }

        this.maker.loseMoney(this.amount);
        this.receiver.addMoney(this.amount);

        return true;
    }
}

module.exports = Offer;
