<template>
    <div class="dice-container">
        <div id="view1">
            <div id="dice1">
            <div class="diceFace front">
                <div class="dot center"></div>
            </div>
            <div class="diceFace front inner"></div>
            <div class="diceFace right">
                <div class="dot dtop dleft"></div>
                <div class="dot center"></div>
                <div class="dot dbottom dright"></div>
            </div>
            <div class="diceFace right inner"></div>
            <div class="diceFace back">
                <div class="dot dtop dleft"></div>
                <div class="dot dtop dright"></div>
                <div class="dot dbottom dleft"></div>
                <div class="dot dbottom dright"></div>
                <div class="dot center dleft"></div>
                <div class="dot center dright"></div>
            </div>
            <div class="diceFace back inner"></div>
            <div class="diceFace left">
                <div class="dot dtop dleft"></div>
                <div class="dot dtop dright"></div>
                <div class="dot dbottom dleft"></div>
                <div class="dot dbottom dright"></div>
            </div>
            <div class="diceFace left inner"></div>
            <div class="diceFace top">
                <div class="dot dtop dleft"></div>
                <div class="dot dbottom dright"></div>
            </div>
            <div class="diceFace top inner"></div>
            <div class="diceFace bottom">
                <div class="dot center"></div>
                <div class="dot dtop dleft"></div>
                <div class="dot dtop dright"></div>
                <div class="dot dbottom dleft"></div>
                <div class="dot dbottom dright"></div>
            </div>
            <div class="diceFace bottom inner"></div>
            <div class="side cover x"></div>
            <div class="side cover y"></div>
            <div class="side cover z"></div>
            </div>
        </div>

        <div id="view2">
            <div id="dice2">
            <div class="diceFace front">
                <div class="dot center"></div>
            </div>
            <div class="diceFace front inner"></div>
            <div class="diceFace right">
                <div class="dot dtop dleft"></div>
                <div class="dot center"></div>
                <div class="dot dbottom dright"></div>
            </div>
            <div class="diceFace right inner"></div>
            <div class="diceFace back">
                <div class="dot dtop dleft"></div>
                <div class="dot dtop dright"></div>
                <div class="dot dbottom dleft"></div>
                <div class="dot dbottom dright"></div>
                <div class="dot center dleft"></div>
                <div class="dot center dright"></div>
            </div>
            <div class="diceFace back inner"></div>
            <div class="diceFace left">
                <div class="dot dtop dleft"></div>
                <div class="dot dtop dright"></div>
                <div class="dot dbottom dleft"></div>
                <div class="dot dbottom dright"></div>
            </div>
            <div class="diceFace left inner"></div>
            <div class="diceFace top">
                <div class="dot dtop dleft"></div>
                <div class="dot dbottom dright"></div>
            </div>
            <div class="diceFace top inner"></div>
            <div class="diceFace bottom">
                <div class="dot center"></div>
                <div class="dot dtop dleft"></div>
                <div class="dot dtop dright"></div>
                <div class="dot dbottom dleft"></div>
                <div class="dot dbottom dright"></div>
            </div>
            <div class="diceFace bottom inner"></div>
            <div class="side cover x"></div>
            <div class="side cover y"></div>
            <div class="side cover z"></div>
            </div>
        </div>
    </div>
</template>

<script>
import $ from 'jquery'

/**
 * @vuese
 * @group Components
 * Gestion des dés (animés)
 */
export default {
    name: 'Dices',
    methods: {

        /**
         * @vuese Attends le nombre de millisecondes passé en paramètre
         */
        sleep(ms) {
            return new Promise(resolve => setTimeout(resolve, ms));
        },

        /**
         * @vuese Renvoie un chiffre aléatoire entre min et max
         */
        random(min, max) {
            min = Math.ceil(min);
            max = Math.floor(max);
            return Math.floor(Math.random() * (max - min + 1)) + min;
        },

        /**
         * @vuese Affiche les dés
         */
        async showDices() {
            $(".dice-container").css("display", "block");
            await this.sleep(200);
            $(".dice-container").css("opacity", "1");
        },

        /**
         * @vuese Cache les dés
         */
        async hideDices() {
            $(".dice-container").css("opacity", "0");
            await this.sleep(200);
            $(".dice-container").css("display", "none");
        },

        /**
         * @vuese Fait tourner le dé de numéro dice pour afficher le chiffre number
         */
        rotateDice(dice, number) {
            if (dice == 1) {
                switch (number) {
                    case 1:
                        $(".dice-container #dice1").css("transform", "rotateY(360deg)");
                        break;
                    case 2:
                        $(".dice-container #dice1").css("transform", "rotateX(-90deg)");
                        break;
                    case 3:
                        $(".dice-container #dice1").css("transform", "rotateY(-90deg)");
                        break;
                    case 4:
                        $(".dice-container #dice1").css("transform", "rotateY(90deg)");
                        break;
                    case 5:
                        $(".dice-container #dice1").css("transform", "rotateX(90deg)");
                        break;
                    case 6:
                        $(".dice-container #dice1").css("transform", "rotateY(180deg)");
                        break;
                    default:
                        $(".dice-container #dice1").css("transform", "rotateY(360deg)");
                }
            }
            else if (dice == 2) {
                switch (number) {
                    case 1:
                        $(".dice-container #dice2").css("transform", "rotateY(360deg)");
                        break;
                    case 2:
                        $(".dice-container #dice2").css("transform", "rotateX(-90deg)");
                        break;
                    case 3:
                        $(".dice-container #dice2").css("transform", "rotateY(-90deg)");
                        break;
                    case 4:
                        $(".dice-container #dice2").css("transform", "rotateY(90deg)");
                        break;
                    case 5:
                        $(".dice-container #dice2").css("transform", "rotateX(90deg)");
                        break;
                    case 6:
                        $(".dice-container #dice2").css("transform", "rotateY(180deg)");
                        break;
                    default:
                        $(".dice-container #dice2").css("transform", "rotateY(360deg)");
                }
            }
        },

        /**
         * @vuese Agrandit le dé dice
         */
        scaleUpDice(dice) {
            if (dice == 1) {
                $(".dice-container #view1").css("transform", "scale(0.7)");
            }
            else if (dice == 2) {
                $(".dice-container #view2").css("transform", "scale(0.7)");
            }
        },

        /**
         * @vuese Rétrécit le dé dice
         */
        scaleDownDice(dice) {
            if (dice == 1) {
                $(".dice-container #view1").css("transform", "scale(0.5)");
            }
            else if (dice == 2) {
                $(".dice-container #view2").css("transform", "scale(0.5)");
            }
        },

        /**
         * @vuese Simule un lancé pour un dé.
         * Lance le dé dice (effectue des rotations aléatoires) puis l'arrête sur le chiffre number après rotations rotations
         */
        async rollDice(dice, number, rotations) {
            var i;
            var lastNum = 1;
            var tmp = 0;
            for (i = 0; i < rotations; i++) {
                while (tmp == lastNum) {
                    tmp = this.random(1, 6);
                }
                lastNum = tmp;
                this.rotateDice(dice, tmp);
                await this.sleep(400);
            }
            this.rotateDice(dice, number);
            await this.sleep(400);
            this.scaleUpDice(dice);
            await this.sleep(150);
            this.scaleDownDice(dice);
            await this.sleep(150);
        },

        /**
         * @vuese Simule un lancé réel avec les deux dés
         * Affiche les dés ou les appelle au centre de l'écran s'il sont déjà affichés,
         * les lance, les arrête sur les chiffres d1 et d2 et les déplace en haut à droite de l'écran
         */
        async triggerDices(d1, d2, _callback) {
            const rotations = 6;
            if ($('.dice-container').css('top') == '50px') {
                $('.dice-container').css('top', '50%');
                $('.dice-container').removeClass('mini');
                await this.sleep(1000);
            }
            this.showDices();
            await this.sleep(300);
            this.rollDice(1, d1, rotations);
            this.rollDice(2, d2, rotations);
            await this.sleep(rotations * 400 + 800);
            $('.dice-container').css('top', '50px');
            $('.dice-container').addClass('mini');
            if (typeof _callback !== "undefined")
                _callback();
        }

    }
}
</script>