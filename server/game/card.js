const Constants  = require('../lib/constants');
class Card {
    constructor (token, description, effectType, effectArg1=null, effectArg2=null) {
        this.token = token;
        this.description = description;
        this.effectType = effectType;
        this.effectArg1 = effectArg1;
        this.effectArg2 = effectArg2;

        this.effectCallback = {
            gainMoney: this.gainMoney,
            loseMoney: this.loseMoney,
            advanceAbsolute: this.advanceAbsolute,
            advanceRelative: this.advanceRelative,
            repair: this.repair,
            jailBreak: this.jailBreak,
            jailTime: this.jailTime,
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

    jailBreak (game, player) {
        player.quitPrison();
    }

    jailTime (game, player) {
        player.goPrison();
    }

    advanceAbsolute (game, player) {
        player.moveAbsolute(this.effectArg1);
    }

    advanceRelative (game, player) {
        player.moveRelative(this.effectArg1);
    }

    repair (game, player) {
        let nbHouses = 0, nbHostels = 0;
        for (const prop of player.properties) {
            if (prop.type === Constants.PROPERTY_TYPE.STREET) {
                if (prop.housesNb !== 0) {
                    nbHouses += prop.housesNb;
                }
                if (prop.hostel) {
                    nbHostels++;
                }
            }
        }
        for (let i = 0; i < nbHouses; i++) {
            player.loseMoney(this.effectArg1);
        }
        for (let i = 0; i < nbHostels; i++) {
            player.loseMoney(this.effectArg2);
        }
    }
}

module.exports = Card;
