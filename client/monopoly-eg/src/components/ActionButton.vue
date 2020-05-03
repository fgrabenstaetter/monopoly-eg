<template>
    <a class="btn btn-primary stylized action-button disabled" id="timer">EN ATTENTE</a>
</template>

<script>
import $ from 'jquery'

/**
 * @vuese
 * @group Components
 * Bouton d'action du jeu : sert à déclencher les actions comme "lancer les dés", "terminer mon tour", etc. (avec timer inclus)
 */
export default {
    name: 'ActionButton',
    data() {
        return {}
    },
    methods: {
        /**
         * @vuese
         * Appel de la fonction d'initialisation du bouton
         */
        progressInitialize() {
            $('#timer').progressInitialize();
        },
        /**
         * @vuese
         * Remet le bouton a un etat cliquable
         * @arg hard determine s'il faut remettre le bouton à l'état initial ou pas
         */
        progressReset(hard) {
            $('#timer').progressReset(hard);
        },
        /**
         * @vuese
         * Commence le minuteur du duree de sec secondes
         * @arg sec la duree du minuteur
         */
        progressStart(sec) {
            $('#timer').progressStart(sec);
        },
        /**
         * @vuese
         * Termine le minuteur
         */
        progressFinish() {
            $('#timer').progressFinish();
        },
        /**
         * @vuese
         * Incremente le minuteur d'une valeur val donne
         * @arg val la valeur a incrementer
         */
        progressIncrement(val) {
            $('#timer').progressIncrement(val);
        },
        /**
         * @vuese
         * Changement du label de chargement à 'TERMINER'
         */
        progressSetStateTerminer() {
            $('#timer').progressSetStateTerminer();
        },
        /**
         * @vuese
         * Changement du label de chargement à 'RELANCER LES DES'
         */
        progressSetStateRelancer() {
            $('#timer').progressSetStateRelancer();
        },
        /**
         * @vuese
         * Change la position de la barre du minuteur à une valeur val donne
         * @arg val la valeur en pourcentage
         */
        progressSet(val) {
            $('#timer').progressSet(val);
        },
        /**
         * @vuese
         * Met en pause le minuteur 
         */
        progressPause() {
            $('#timer').progressPause();
        },
        /**
         * @vuese
         * Reprise du minuteur
         */
        progressResume() {
            $('#timer').progressResume();
        },
        /**
         * @vuese
         * Désactive le bouton
         */
        setDisabled() {
            if (!$('#timer').hasClass('disabled'))
                $('#timer').addClass('disabled');
        }
    },
    beforeDestroy() {
        $('#timer').remove();
    },
    mounted() {
        let jQuery = $;
        const _this = this;
        
        $('#timer').click(function (e) {
            e.preventDefault();
            // Si le label est sur 'RE/LANCER LES DES' desactive le click sur le bouton et appelle la fonction de lancer de des
            if ($(this).attr('data-loading') == 'LANCER LES DES' || $(this).attr('data-loading') == 'RELANCER LES DES') {
                $(this).addClass('disabled');
                _this.$parent.gameRollDiceReq();
            }
            // Sinon il termine le minuteur
            else {
                _this.$parent.gameTurnEndReq();
                $(this).progressFinish();
            }
        });

        (function ($) {
            var isRunning = true;
            
            // fonction qui initalise le bouton action
            $.fn.progressInitialize = function () {

                var button = $(this),
                    progress = 0;

                //Ajout des attribut pour changer les labels lors des différentes phases du bouton
                button.attr({ 'data-loading': 'LANCER LES DES', 'data-finished': 'EN ATTENTE' });
                button.addClass('disabled');

                // Ajoute une bar de progression sur le bouton
                var bar = $('<span class="tz-bar">').appendTo(button);

                // Evenement demandant la mise a jour de la barre de progression
                button.on('progress', function (e, val, absolute, finish) {

                    if (!button.hasClass('in-progress')) {

                        // Si le button n'a pas la class 'in-progress' on l'ajoute et on initialise la barre de progression
                        bar.show();
                        progress = 0;
                        button.removeClass('finished').addClass('in-progress')
                    }

                    // Si absolute alors la progress est egale a la valeur
                    if (absolute) {
                        progress = val;
                    }
                    // Sinon on ajoute la valeur a la progression actuel
                    else {
                        progress += val;
                    }
                    // Si progress depasse 100 on le remet a 100 
                    if (progress >= 100) {
                        progress = 100;
                    }
                    // Si finish alors on remet la barre a 0 et on le cache
                    if (finish) {
                        button.removeClass('in-progress').addClass('finished');
                        bar.hide();
                        setProgress(0);
                    }
                    // Met la barre de progression a la bonne valeur
                    setProgress(progress);
                });
                // Met la position de la barre du minuteur à une valeur val donne
                function setProgress(percentage) {
                    bar.filter('.tz-bar').width(percentage + '%');
                }
            };
            // Reinitialise le bouton
            $.fn.progressReset = function (hard = true) {
                var button = $(this);
                if (button.hasClass('disabled')) {
                    button.removeClass('disabled');
                }
                if (hard) {
                    button.attr({ 'data-loading': 'LANCER LES DES', 'data-finished': 'EN ATTENTE' });
                }
            }

            // Lance le minuteur
            $.fn.progressStart = function(time){
            var button = this.first();

                // Evite d'avoir plusieurs interval en meme temps et redemare le minuteur
                if(button.hasClass('in-progress')){
                    window.clearInterval(interval);
                    button.progressSet(0);
                }

                // Toute les 0,2 secondes remet a jour le minuteur
                var interval = window.setInterval(function(){
                    // Si le minuteur n'est pas en pause, incremente la barre de progression
                    if (isRunning) {
                        // Si la barre de progression atteint la fin, on termine le minuteur
                        if($('.tz-bar').width() >= $('#controlButton').innerWidth())
                        {
                            button.trigger('progress-finish');
                            button.trigger('progress',[0, false, true]);
                        }
                        else{
                            button.progressIncrement(100/(time/0.2));
                        }
                    }
                }, 200);
                // Supprime l'interval quand le minuteur se termine
                button.on('progress-finish',function(){
                    window.clearInterval(interval);
                });
            };

            // Termine le minuteur
            $.fn.progressFinish = function(){
                $(this).addClass('disabled');
                $(this).attr({'data-loading': 'LANCER LES DES'});
                console.log('finish');
                $(this).trigger('progress-finish');
                $(this).trigger('progress',[0, false, true]);
            };

            // Incremente la barre de progression
            $.fn.progressIncrement = function(val){
                var button = this.first();
                return button.trigger('progress',[val, false]);
            };

            // Met le label de chargement à 'TERMINER'
            $.fn.progressSetStateTerminer = function(){
                $(this).attr({'data-loading': 'TERMINER'});
                return this;
            };
            
            // Met le label de chargement à 'RELANCER LES DES'
            $.fn.progressSetStateRelancer = function(){
                $(this).attr({'data-loading': 'RELANCER LES DES'});
                return this;
            };

            // Met la barre de progression a une valeur donne
            $.fn.progressSet = function (val) {
                // val = val;
                console.log('set : ' + val);
                var finish = false;
                if (val >= 100) {
                    finish = true;
                }

                return this.first().trigger('progress', [val, true, finish]);
            };

            // Met le minuteur en pause
            $.fn.progressPause =  function(){
                isRunning = false;
            };

            // Reprise du minuteur
            $.fn.progressResume =  function(){
                isRunning = true;
            };

        })(jQuery);

    }
}
</script>