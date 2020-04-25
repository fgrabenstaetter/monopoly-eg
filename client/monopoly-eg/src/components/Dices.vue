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

export default {
    name: 'Dices',
    methods: {
        test() {
            alert('ok')
        },

        sleep(ms) {
            return new Promise(resolve => setTimeout(resolve, ms));
        },

        random(min, max) {
            min = Math.ceil(min);
            max = Math.floor(max);
            return Math.floor(Math.random() * (max - min + 1)) + min;
        },

        async showDices() {
            $(".dice-container").css("display", "block");
            await this.sleep(200);
            $(".dice-container").css("opacity", "1");
        },

        async hideDices() {
            $(".dice-container").css("opacity", "0");
            await this.sleep(200);
            $(".dice-container").css("display", "none");
        },

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

        scaleUpDice(dice) {
            if (dice == 1) {
                $(".dice-container #view1").css("transform", "scale(0.7)");
            }
            else if (dice == 2) {
                $(".dice-container #view2").css("transform", "scale(0.7)");
            }
        },

        scaleDownDice(dice) {
            if (dice == 1) {
                $(".dice-container #view1").css("transform", "scale(0.5)");
            }
            else if (dice == 2) {
                $(".dice-container #view2").css("transform", "scale(0.5)");
            }
        },

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

        async triggerDices(d1, d2, _callback) {
            const rotations = 6;
            if ($('.dice-container').css('top') == '50px') {
                $('.dice-container').css('top', '50%');
                $('.dice-container').css('transform', 'translate(-50%, -50%) scale(1)');
                await this.sleep(1000);
            }
            this.showDices();
            await this.sleep(300);
            this.rollDice(1, d1, rotations);
            this.rollDice(2, d2, rotations);
            await this.sleep(rotations * 400 + 800);
            $('.dice-container').css('top', '50px');
            $('.dice-container').css('transform', 'translate(calc(-50% + 50vw - 118px), 0) scale(0.5)');
            if (typeof _callback !== "undefined")
                _callback();
        }

    }
}
</script>