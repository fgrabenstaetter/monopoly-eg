<template>
  <div v-anime class="splash-text">
    <span class="letters letters-1">C'est au tour de Ben !</span>
  </div>
</template>

<script>
import $ from 'jquery';

/**
 * @vuese
 * Composant permettant d'afficher un grand texte animé à l'écran (changement de joueur, )
 */
export default {
    name: 'SplashText',
    data() {
        return {
            // @vuese
            // Container de l'animation
            splashAnim: null,
            // @vuese
            // Paramètres de l'animation
            splashSettings: {
                opacityIn: [0, 1],
                scaleIn: [0.2, 1],
                scaleOut: 3,
                durationIn: 800,
                durationOut: 600,
                delay: 500
            }
        }
    },
    mounted() {
        this.splashAnim = this.$anime
        .timeline({ loop: false, autoplay: false })
        .add({
            targets: '.splash-text .letters-1',
            opacity: this.splashSettings.opacityIn,
            scale: this.splashSettings.scaleIn,
            duration: this.splashSettings.durationIn
        }).add({
            targets: '.splash-text .letters-1',
            opacity: 0,
            scale: this.splashSettings.scaleOut,
            duration: this.splashSettings.durationOut,
            easing: "easeInExpo",
            delay: this.splashSettings.delay
        }).add({
            targets: '.splash-text',
            opacity: 0,
            duration: 500,
            delay: 500
        });
    },
    methods: {
        /**
         * @vuese
         * Lance une animation à l'écran
         * @arg text : le texte (ou HTML) à afficher ; color : la couleur du texte (hex, ex: '#FFFFF')
         */
        trigger(text, color) {
            $('.splash-text .letters-1').html(text).css('color', color);
            this.splashAnim.complete = null;
            this.splashAnim.restart();
        },

        /**
         * @vuese
         * Lance une animation à l'écran
         * @arg text : le texte (ou HTML) à afficher ; color : la couleur du texte (hex, ex: '#FFFFF') ; cb : callback exécuté après l'animation
         */
        triggerCb(text, color, cb) {
            $('.splash-text .letters-1').html(text).css('color', color);
            this.splashAnim.complete = cb;
            this.splashAnim.restart();
        }
    }
}
</script>