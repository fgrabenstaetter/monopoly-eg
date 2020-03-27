const Constants  = require('../lib/constants');
class Card {
    constructor (description, effectType, effectArg1=null, effectArg2=null) {
        this.description = description;
        this.effectType = effectType;
        this.effectArg1 = effectArg1;
        this.effectArg2 = effectArg2;

        this.effectCallback = {
            gainMoney      : this.gainMoney,
            loseMoney      : this.loseMoney,
            moveAbsolute   : this.moveAbsolute,
            moveRelative   : this.moveRelative,
            repair         : this.repair,
            jailEscapeCard : this.jailEscapeCard,
        }[this.effectType];
    }

    execute (game, player) {
        this.effectCallback(game, player);
    }

    gainMoney (game, player) {
        player.addMoney(this.effectArg1);
    }

    loseMoney (game, player) {
        player.loseMoney(this.effectArg1);
    }

    jailEscapeCard (game, player) {
        player.nbJailEscapeCards ++;
    }

    moveAbsolute (game, player) {
        player.moveAbsolute(this.effectArg1);
    }

    moveRelative (game, player) {
        player.moveRelative(this.effectArg1);
    }

    repair (game, player) {
        let price = 0;
        for (const prop of player.properties) {
            if (prop.type === Constants.PROPERTY_TYPE.STREET) {
                if (prop.hostel)
                    price += this.effectArg2;
                else
                    price += this.effectArg1 * prop.housesNb;
            }
        }

        player.loseMoney(price);
    }
}

module.exports = Card;
