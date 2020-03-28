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
            anniversary    : this.anniversary,
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

    //Chaque joueur doit la somme "effectArg1" au joueur courant => Case Communautaire
    anniversary (game, player) {
        for (const p of game.players) {
            if (p !== player) {
                p.loseMoney(this.effectArg1);
                player.addMoney(this.effectArg1);
            }
        }
    }

    moveAbsolute (game, player) {
        const oldPos = player.cellPos;
        player.moveAbsolute(this.effectArg1);

        if (player.cellPos === 30 && oldPos > 30) // = go prison
            player.loseMoney(Constants.GAME_PARAM.GET_MONEY_FROM_START); // car regagné ensuite => annuler le gain
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
