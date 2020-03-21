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
            advance: this.advance,
            jailBreak: this.jailBreak,
            jailTime: this.jailTime,
        }[this.effectType];

        if (!this.effectCallback)
            throw 'Effet de carte inconnu - ' + effectType;
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

    advance (game, player) {
        player.moveAbsolute(this.effectArg1);
    }
}

module.exports = Card;
