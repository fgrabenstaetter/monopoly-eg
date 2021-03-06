const Constants = require('../lib/constants');
class Card {
    /**
     * @param description La description de la carte
     * @param effectType Le type de la carte
     * @param effectArg1 Effet d'une carte à 1 'effet'
     * @param effectArg2 2e effet d'une carte à 2 'effets'
     */
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

    /**
     * Execute la carte piocher par un joueur
     * @param game Le jeu devant executant la carte
     * @param player Le joueur ayant piocher la carte
     * @returns l'enchère
     */
    execute(game, player) {
        this.effectCallback(game, player);
    }

    /**
     * Appelée si une carte de type 'gain de monnaie' a été piochée
     * @param game Le jeu devant executant la carte
     * @param player Le joueur ayant piocher la carte
     */
    gainMoney(game, player) {
        player.addMoney(this.effectArg1);
    }

    /**
     * Appelée si une carte de type 'perte de monnaie' a été piochée
     * @param game Le jeu devant executant la carte
     * @param player Le joueur ayant piocher la carte
     */
    loseMoney(game, player) {
        if (player.money < this.effectArg1) {
            game.playerNotEnoughMoney(player, this.effectArg1,
                player.nickname + ' est en faillite (ne peux pas payer la carte de ' + this.effectArg1 + '€)',
                player.nickname + ' doit hypothéquer des propriétés pour pouvoir payer la carte');
        } else
            player.loseMoney(this.effectArg1);
    }

    /**
     * Appelée si une carte de type 'gagner une carte sortie de prison' a été piochée
     * @param game Le jeu devant executant la carte
     * @param player Le joueur ayant piocher la carte
     */
    jailEscapeCard(game, player) {
        player.nbJailEscapeCards++;
    }

    //Chaque joueur doit la somme "effectArg1" au joueur courant => Case Communautaire
    /**
     * Appelée si une carte de type 'anniversaire' a été piochée
     * @param game Le jeu devant executant la carte
     * @param player Le joueur ayant piocher la carte
     */
    anniversary(game, player) {
        let sum = 0;
        for (const p of game.players) {
            if (p !== player && !p.failure) {
                p.loseMoney(this.effectArg1);
                sum += this.effectArg1;
            }
        }
        player.addMoney(sum);
    }

    /**
     * Appelée si une carte de type 'mouvement absolu' a été piochée
     * @param game Le jeu devant executant la carte
     * @param player Le joueur ayant piocher la carte
     */
    moveAbsolute(game, player) {
        player.moveAbsolute(this.effectArg1);
    }

    /**
     * Appelée si une carte de type 'mouvement relatif' a été piochée
     * @param game Le jeu devant executant la carte
     * @param player Le joueur ayant piocher la carte
     */
    moveRelative(game, player) {
        player.moveRelative(this.effectArg1);
    }

    /**
     * Appelée si une carte de type 'réparation' a été piochée
     * @param game Le jeu devant executant la carte
     * @param player Le joueur ayant piocher la carte
     */
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
                player.nickname + ' est en faillite (ne peux pas payer les réparations de ' + price + '€)',
                player.nickname + ' doit hypothéquer des propriétés pour pouvoir les réparations');
        } else
            player.loseMoney(price);
    }

    /**
     * Appelée si une carte de type 'aller en prison' a été piochée
     * @param game Le jeu devant executant la carte
     * @param player Le joueur ayant piocher la carte
     */
    goJail(game, player) {
        player.goPrison();
        game.turnData.canRollDiceAgain = false;
        game.setTurnActionData(null, null,
            game.curPlayer.nickname + ' est envoyé en session au parlement européen ! (tour 1/3)');
    }
}

module.exports = Card;
