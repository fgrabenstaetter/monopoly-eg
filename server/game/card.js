const Constants = require('../lib/constants');
class Card {
    constructor(description, effectType, effectArg1 = null, effectArg2 = null) {
        this.description = description;
        this.effectType = effectType;
        this.effectArg1 = effectArg1;
        this.effectArg2 = effectArg2;

        this.effectCallback = {
            gainMoney: this.gainMoney,
            loseMoney: this.loseMoney,
            moveAbsolute: this.moveAbsolute,
            moveRelative: this.moveRelative,
            repair: this.repair,
            anniversary: this.anniversary,
            jailEscapeCard: this.jailEscapeCard,
            goJail: this.goJail
        }[this.effectType];
    }

    execute(game, player) {
        this.effectCallback(game, player);
    }

    gainMoney(game, player) {
        player.addMoney(this.effectArg1);
    }

    loseMoney(game, player) {
        if (player.money < this.effectArg1) {
            game.playerNotEnoughMoney(player, this.effectArg1,
                'Le joueur ' + player.nickname + ' est en faillite (ne peux pas payer la carte de ' + this.effectArg1 + '€)',
                'Le joueur ' + player.nickname + ' doit hypothéquer des propriétés pour pouvoir payer la carte');
        } else
            player.loseMoney(this.effectArg1);
    }

    jailEscapeCard(game, player) {
        player.nbJailEscapeCards++;
    }

    //Chaque joueur doit la somme "effectArg1" au joueur courant => Case Communautaire
    anniversary(game, player) {
        let sum = 0;
        for (const p of game.players) {
            if (p !== player) {
                p.loseMoney(this.effectArg1);
                sum += this.effectArg1;
            }
        }
        player.addMoney(sum);
    }

    moveAbsolute(game, player) {
        player.moveAbsolute(this.effectArg1);
    }

    moveRelative(game, player) {
        player.moveRelative(this.effectArg1);
    }

    repair(game, player) {
        let price = 0;
        for (const prop of player.properties) {
            if (prop.type === Constants.PROPERTY_TYPE.STREET) {
                if (prop.hostel)
                    price += this.effectArg2;
                else
                    price += this.effectArg1 * prop.housesNb;
            }
        }

        if (player.money < price) {
            game.playerNotEnoughMoney(player, price,
                'Le joueur ' + player.nickname + ' est en faillite (ne peux pas payer les réparations de ' + price + '€)',
                'Le joueur ' + player.nickname + ' doit hypothéquer des propriétés pour pouvoir les réparations');
        } else
            player.loseMoney(price);
    }

    goJail(game, player) {
        player.goPrison();
        game.turnData.canRollDiceAgain = false;
        game.setTurnActionData(null, null,
            game.curPlayer.nickname + ' est envoyé en session au parlement européen ! (tour 1/3)');
    }
}

module.exports = Card;
