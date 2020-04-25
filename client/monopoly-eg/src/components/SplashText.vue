<template>
  <div v-anime class="splash-text">
    <span class="letters letters-1">C'est au tour de Ben !</span>
    <!-- <span class="letters letters-2">Set</span>
    <span class="letters letters-3">Go!</span>-->
  </div>
</template>

<script>
export default {
    name: 'SplashText',
    data() {
        return {
            splashAnim: null
        }
    },
    mounted() {
        const splashSettings = {};
        splashSettings.opacityIn = [0, 1];
        splashSettings.scaleIn = [0.2, 1];
        splashSettings.scaleOut = 3;
        splashSettings.durationIn = 800;
        splashSettings.durationOut = 600;
        splashSettings.delay = 500;
        
        // const targets = this.$el;
        this.splashAnim = this.$anime
        .timeline({ loop: false, autoplay: false })
        .add({
            targets: '.splash-text .letters-1',
            opacity: splashSettings.opacityIn,
            scale: splashSettings.scaleIn,
            duration: splashSettings.durationIn
        }).add({
            targets: '.splash-text .letters-1',
            opacity: 0,
            scale: splashSettings.scaleOut,
            duration: splashSettings.durationOut,
            easing: "easeInExpo",
            delay: splashSettings.delay
        }).add({
            targets: '.splash-text',
            opacity: 0,
            duration: 500,
            delay: 500
        });
    },
    methods: {
        triggerSplashAnimation(text, color) {
            $('.splash-text .letters-1').html(text).css('color', color);
            this.splashAnim.restart();
        }
    }
}
</script>