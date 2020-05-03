const Constants = require('./../lib/constants');

class Offer {

    static idCounter = 0;

    /**
     * @param game Le jeu contenant l'offre
     * @param id Le joueur ayant piocher la carte
     * @return l'offre si elle a été trouvée, faux sinon
     */
    static offerByID(game, id) {
        for (const offer of game.offers)
            if (offer.id === id)
                return offer;
        return false;
    }

    /**
     * @param offer L'offre à supprimer
     * @returns true si l'offre a été supprimée, faux sinon
     */
    static delOffer(offer) {
        const ind = offer.game.offers.indexOf(offer);
        if (ind === -1)
            return false;
        offer.game.offers.splice(ind, 1);
        return true;
    }

    /**
     * @param sender Player qui veut envoyer une nouvelle offre
     * @param receiver Player auquel sender veut envoyer une nouvelle offre
     * @returns true Si sender peux envoyer l'offre à receiver, false si la limite de SPAM est atteinte
     */
    static canSend(sender, receiver, game) {
        const periodMaxNb = 2;
        const period = Constants.GAME_PARAM.OFFER_EXPIRE_AFTER;
        // max 2 offres sur 40s glissantes

        if (!game.lastOffers[sender.id])
            game.lastOffers[sender.id] = {};

        if (!game.lastOffers[sender.id][receiver.id])
            game.lastOffers[sender.id][receiver.id] = [];

        let can = true;
        let obj = game.lastOffers[sender.id][receiver.id];

        if (obj.length >= periodMaxNb) { // non vide et possibilité de SPAM
            if (Date.now() - obj[periodMaxNb - 1] < period) // SPAM LIMIT
                can = false;
        }

        if (can) {
            game.lastOffers[sender.id][receiver.id] = [Date.now()].concat(obj);
            return true;
        }

        return false;
    }

    /**
     * @param property La propriété à acheter ou null pour carte sortie de prison
     */
    constructor(game, player, receiver, property, amount) {
        this.game = game;
        this.id = Offer.idCounter++;
        this.maker = player;
        this.receiver = receiver;
        this.property = property;
        this.amount = amount;
        this.game.offers.push(this);
        setTimeout(this.expired.bind(this), Constants.GAME_PARAM.OFFER_EXPIRE_AFTER);

        // message à tous les joueurs
        const propertyName = this.property ? this.property.name : 'une carte Fin de session parlementaire';
        const text = this.maker.nickname + ' propose à ' + this.receiver.nickname + ' de lui acheter ' + propertyName + ' pour ' + this.amount + '€ !';
        const mess = this.game.chat.addMessage(null, text);
        this.game.GLOBAL.network.io.to(this.game.name).emit('gameChatReceiveRes', {
            playerID: -1,
            text: mess.text,
            createdTime: mess.createdTime
        });
    }

    /**
     * Expiré ou refusé
     */
    expired() {
        if (!Offer.offerByID(this.game, this.id))
            return false;

        this.game.GLOBAL.network.io.to(this.game.name).emit('gameOfferFinishedRes', {
            receiverID: this.receiver.id,
            offerID: this.id,
            price: this.amount,
            propertyID: this.property ? this.property.id : -1,
            makerID: this.maker.id,
            accepted: false
        });

        // message à tous les joueurs
        const propertyName = this.property ? 'la propriété ' + this.property.name : 'une carte Fin de session parlementaire';
        const text = this.receiver.nickname + ' a refusé l\'offre d\'achat pour ' + propertyName + ' de ' + this.maker.nickname + ' à ' + this.amount + '€ !';
        const mess = this.game.chat.addMessage(null, text);
        this.game.GLOBAL.network.io.to(this.game.name).emit('gameChatReceiveRes', {
            playerID: -1,
            text: mess.text,
            createdTime: mess.createdTime
        });

        Offer.delOffer(this);
    }

    accept() {
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

            this.receiver.nbJailEscapeCards--;
            this.maker.nbJailEscapeCards++;
        }

        this.maker.loseMoney(this.amount);
        this.receiver.addMoney(this.amount);

        this.game.GLOBAL.network.io.to(this.game.name).emit('gameOfferFinishedRes', {
            receiverID: this.receiver.id,
            offerID: this.id,
            price: this.amount,
            propertyID: this.property ? this.property.id : -1,
            makerID: this.maker.id,
            accepted: true
        });

        // message à tous les joueurs
        const propertyName = this.property ? 'la propriété ' + this.property.name : 'une carte Fin de session parlementaire';
        const text = this.receiver.nickname + ' a accepté d\'acheter ' + propertyName + ' de ' + this.maker.nickname + ' à ' + this.amount + '€ !';
        const mess = this.game.chat.addMessage(null, text);

        this.game.GLOBAL.network.io.to(this.game.name).emit('gameChatReceiveRes', {
            playerID: -1,
            text: mess.text,
            createdTime: mess.createdTime
        });

        return true;
    }
}

module.exports = Offer;
