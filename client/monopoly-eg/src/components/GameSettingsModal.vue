<template>
    <div>
        <div class="modal" id="optionsModal" tabindex="-1" role="dialog" aria-labelledby="optionsModalLabel"
            aria-hidden="true" data-id="1">
            <div class="modal-dialog animated bounceIn" role="document">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title" id="optionsModalLabel">Options</h5>
                        <button type="button" class="close" data-dismiss="modal" aria-label="Close" style="cursor: pointer;">
                            <span aria-hidden="true" style="cursor: pointer;">&times;</span>
                        </button>
                    </div>
                    <div class="modal-body">
                        <div v-if="env =='game'" class="mb-4">
                            <span>Temps restant : {{$parent.gameRemainingTime}}</span>
                            <span v-if="gameRemainingTime">{{gameRemainingTime}}</span>
                            <span v-else>Illimité</span>
                        </div>
                        <ul>
                            <li>
                                <span>Qualité graphique</span>
                                <select @change="updateUserSettings" v-model="userSettings.graphicsQuality" class="custom-select">
                                    <option value="0">Bas</option>
                                    <option value="1">Standard</option>
                                    <option value="2">Élevé</option>
                                </select>
                            </li>
                            <li>
                                <span>Zoom automatique</span>
                                <label class="switch">
                                    <input @change="updateUserSettings" v-model="userSettings.autoZoom" type="checkbox">
                                    <span class="slider"></span>
                                </label>
                            </li>
                            <li style="flex-wrap:wrap;">
                                <span>Musique</span>
                                <input @change="updateUserSettings" v-model="userSettings.musicLevel" type="range" min="0" max="100" class="range-slider">
                            </li>
                            <li style="flex-wrap:wrap;">
                                <span>Effets sonores</span>
                                <input @change="updateUserSettings" v-model="userSettings.sfxLevel" type="range" min="0" max="100" class="range-slider">
                            </li>
                        </ul>

                        <button class="btn btn-primary show-rules" href="#" role="button" aria-hidden="true" data-toggle="modal" data-target="#rulesModal">RÈGLES</button>
                        <button v-if="env == 'game'" v-on:click="quitGame" class="btn btn-primary" href="#" role="button"
                            style="background-color: red;">QUITTER LA PARTIE</button>
                    </div>
                </div>
            </div>
        </div>

        <div class="modal" id="rulesModal" tabindex="-1" role="dialog" aria-labelledby="rulesModalTitle" aria-hidden="true">
            <div class="modal-dialog modal-lg animated bounceIn" role="document">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title" id="ruleModalTitle">Règles</h5>
                        <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                            <span aria-hidden="true">&times;</span>
                        </button>
                    </div>
                    <div class="modal-body">
                        <h2>But du jeu</h2>
                        <p>Être le seul joueur qui n'ait pas fait faillite</p>
                        <h2>Sommaire</h2>
                        <a href="#partie">Une partie de monopoly</a>
                        <a href="#double">Double</a>
                        <a href="#départ">Case départ</a>
                        <a href="#achat">Achat de propriété</a>
                        <a href="#enchères">Enchères</a>
                        <a href="#propriétaire">Être propriétaire</a>
                        <a href="#arretPropri">Arrêt sur une propriété déjà achetée</a>
                        <a href="#arretCompagnie">Arrêt sur les services publiques</a>
                        <a href="#arretGare">Arrêt sur une gare</a>
                        <a href="#arretChanceCommu">Arrêt sur une case chance ou caisse de communauté</a>
                        <a href="#arretTaxe">Arrêt sur les cases impôts et taxe de luxe</a>
                        <a href="#arretParc">Arrêt au parc de l'Orangerie</a>
                        <a href="#arretParlement">Parlement</a>
                        <a href="#maisons">Maisons</a>
                        <a href="#hôtels">Hôtels</a>
                        <a href="#vente">Vente de propriétés</a>
                        <a href="#hypothèques">Hypothèques</a>
                        <a href="#faillite">Faillite</a>
                        <a href="#vainqueur">Vainqueur</a>


                        <h2 id="partie">Une partie de monopoly</h2>
                        <p>
                            Quand c'est votre tour cliquez sur le bouton "lancer les dés" pour avancer votre pion.
                            La case où vous vous arrêterez déterminera ce que vous avez à faire:
                            Acheter une propriété,
                            Payer un loyer au propriétaire,
                            Payer des taxes,
                            Tirer une carte chance ou caisse de communauté,
                            Aller en session parlementaire,
                            Vous reposer au parc de l'Orangerie,
                            Toucher votre salaire de 200€.
                        </p>
                        <h2 id="double">Double</h2>
                        <p>
                            Si vous faites un double, effectuez les opérations habituelles sur la case où vous vous arrêtez, puis relancez
                            les dés.
                            Si vous faites ainsi 3 doubles à la suite, vous irez immédiatement en session parlementaire.
                        </p>
                        <h2 id="départ">Case départ</h2>
                        <p>
                            Chaque fois que vous passez par / que vous vous arrêtez sur la case départ, vous recevez 200€.
                            Il est possible de percevoir deux fois votre salaire dans un même tour de jeu.
                        </p>
                        <h2 id="achat">Achat de propriétés</h2>
                        <p>
                            Si vous vous arrêtez sur une propriété qui n'appartient pas déjà à un autre joueur vous pouvez l'acheter. Les
                            propriétés achetées par chacun des joueurs sont visibles en cliquant sur leur nom dans la liste à gauche de
                            l'écran.
                            Les emplacements vides indiquent le nombre total de propriétés non possédées pour une couleur donnée.
                            Si vous décidez de ne pas acheter, la propriété sera mise en enchère à la fin de votre tour.
                            Vous pourrez participer aux enchères même si vous avez refusé d'acheter la propriété initialement.
                        </p>
                        <h2 id="enchères">Enchères</h2>
                        <p>
                            Lorsqu'une propriété est mise aux enchères, chaque joueur peut proposer un prix d'achat ou bien passer. Le
                            joueur ayant proposé le prix le plus haut deviendra propriétaire. Il sera le seul joueur à payer. Passer une
                            enchère revient à proposer un prix de 0. Si tous les joueurs passent, le terrain ne sera pas vendu. Si l'enchère
                            a été déclenchée par un joueur, il restera propriétaire de son terrain.
                        </p>
                        <h2 id="propriétaire">Être propriétaire</h2>
                        <p>
                            Le fait d'être propriétaire vous permet de percevoir un loyer de la part de tous les joueurs qui s'arrêtent sur
                            vos terrains. Vous pourrez ajouter des maisons sur n'importe quelle propriété à partir du moment où vous
                            possédez tous les terrains de la même couleur que celle-ci.
                        </p>
                        <h2 id="arretPropri">Arrêt sur une propriété déjà achetée</h2>
                        <p>
                            Si vous vous arrêtez sur une propriété qui a déjà été achetée par un autre joueur vous devrez lui payer un
                            loyer. Le montant des loyers est consultable en cliquant sur les propriétés dans la liste des joueurs à gauche
                            de l'écran et varie selon le nombre de maisons ou hôtels présents. Si toutes les propriétés d'une même couleur
                            appartiennent au même joueur le loyer du terrain nu est doublé. Toutefois aucun loyer ne sera dû pour une
                            propriété hypothéquée.
                        </p>
                        <h2 id="arretCompagnie">Arrêt sur les services publiques</h2>
                        <p>
                            Les compagnies du service publiques suivent les mêmes règles d'achat et d'hypothèque que les terrains normaux
                            mais ont un calcul
                            de loyer différent.
                            Si le propriétaire a seulement l'un des deux services publiques le loyer sera égal au total de vos dés multiplié
                            par 4. mais si le propriétaire a les deuxen sa possession vous devrez payer 10 fois le total des dés.
                        </p>
                        <h2 id="arretGare">Arrêt sur une gare</h2>
                        <p>
                            Les gares suivent les mêmes règles d'achat et d'hypothèques que les terrains normaux mais ont un loyer qui
                            augmente selon le nombre de gares possédées par le propriétaire. Les montants sont indiqués sur les cartes de
                            propriétés.
                        </p>
                        <h2 id="arretChanceCommu">Arrêt sur une case chance ou caisse de communauté</h2>
                        <p>
                            Les cartes chances et caisse de communauté peuvent avoir un effet parmi les suivants:
                            déplacer votre pion,
                            payer une certaine somme d'argent,
                            recevoir une certaine somme,
                            aller en session parlementaire,
                            fin de session parlementaire.
                            les cartes de fin de session parlementaire seront conservées jusqu'à ce que vous décidiez de l'utiliser ou de
                            la vendre à un autre joueur.
                        </p>
                        <h2 id="arretTaxe">Arrêt sur les cases impôts et taxe de luxe</h2>
                        <p>
                            Si vous vous arrêtez sur l'une de ces cases vous devrez payer le montant indiqué.
                        </p>
                        <h2 id="arretParc">Arrêt au parc de l'Orangerie</h2>
                        <p>
                            Si vous vous arrêtez sur cette case vous ne devrez payer aucun loyer.
                        </p>
                        <h2 id="arretParlement">Parlement</h2>
                        <p>
                            Vous serez envoyés en session parlementaire si :
                            Vous vous arrêtez sur la case Université,
                            Vous tirez une carte chance ou caisse de communauté qui vous indique d'aller en session parlementaire,
                            Vous faites 3 doubles à la suite.
                        </p>
                        <p>
                            Pour sortir de session parlementaire, il faut effectuer l'une des actions suivantes:
                            Utiliser une carte "fin de session parlementaire" si vous en possédez une, (vous pouvez acheter une carte "Fin
                            de session parlementaire" à un autre joueur),
                            Attendre 3 tours en session parlementaire en lançant les dés à chaque tour pour essayer de faire un double. En
                            cas de réussite vous pourrez sortir du Parlement immédiatement et avancer.
                            Si à la fin des 3 tours vous n'avez pas fait de double, la session sera terminée et vous pourrez jouer
                            normalement.
                        </p>
                        <p>
                            Si vous n'êtes pas envoyés en session mais que vous vous arrêtez sur la case du Parlement, vous êtes simple
                            visiteur pour ce tour.

                        </p>
                        <h2 id="maisons">Maisons</h2>
                        <p>
                            Une fois que vous possédez les titres de tous les terrains d'une même couleur, vous pouvez acheter
                            des maisons pour construire sur ces propriétés. Cela augmente le montant que vous faites payer aux
                            locataires. Le prix d'une maison est indiqué sur la carte de propriété.
                        </p>
                        <p>
                            Vous pouvez acheter une maison quand c'est votre tour. Vous devez construire uniformément :
                            vous ne pouvez pas construire de deuxième maison sur un terrain tant que vous n'avez pas construit
                            une maison sur chaque terrain de ce groupe, et ainsi de suite, jusqu'à ce que chaque terrain de ce
                            groupe possède quatre maisons. La vente des maisons doit elle aussi se faire uniformément.
                        </p>
                        <p>
                            Vous pouvez acheter ou vendre à n'importe quel moment durant votre tour, autant de bâtiments que
                            vous le désirez, tant que vos finances vous le permettent.
                            Aucune maison ne peut être construite sur une propriété si une des propriétés de ce groupe est
                            hypothéquée. Si vous avez toutes les propriétés d'un groupe (terrains de même couleur) et que
                            seulement une ou deux sont construites, vous pouvez demander un double loyer de terrain nu
                            pour la ou les propriétés du groupe sans bâtiment.
                        </p>
                        <h2 id="hôtels">Hôtels</h2>
                        <p>
                            Vous devez avoir quatre maisons sur chaque site d'un groupe avant de pouvoir acheter un hôtel.
                            On achete les hôtels de la même façon que les maisons. Ils coûtent le prix indiqué sur la carte de propriété. On
                            ne peut construire
                            qu'un hôtel par propriété.
                        </p>
                        <h2 id="#vente">Vente de propriétés</h2>
                        <p>
                            Vous pouvez vendre des propriétés à tout moment en lançant une vente aux enchères pour celle-ci. Vous décidez du
                            prix de départ de l'enchère. Le déroulement de l'enchère est le même que décrit dans la section
                            <a href="#enchères">Enchères</a>. Toutefois aucun terrain ne peut être vendu à un autre joueur s'il a des
                            bâtiments construits sur un des terrains du
                            même groupe. Si vous voulez vendre un terrain appartenent à un groupe, vous devez d'abord vendre tous
                            les batiments de ce groupe. Les maisons doivent être vendu uniformément de la même
                            façon qu'elles ont été achetées (Voir <a href="#maisons">Maisons</a>).
                        </p>
                        <h2 id="hypothèques">Hypothèques</h2>
                        <p>
                            S'il ne vous reste plus suffisamment d'argent et que vous devez vous acquitter d'une dette, vous pouvez
                            hypothéquer une propriété.
                            Pour cela, vendez d'abord tous les bâtiments de cete propriété. Lorsque vous hypothéquez une
                            propriété vous recevez le montant indiqué sur la carte de propriété, ce qui revient à la moitié du
                            prix d'achat. Lorsque vous voulez lever l'hypothèque, vous devez payer cette valeur additionnée de 10%
                            d'intérêts. Si vous hypothéquez une propriété vous êtes toujours en sa possession. Une propriété hypothéquée
                            peut toujours être mise aux enchères.
                        </p>
                        <p>
                            Vous ne pouvez percevoir aucun loyer pour une propriété hypothéquée, mais vous continuez de percevoir le loyer
                            des propriétés du même groupe. Si un joueur achète aux enchères une propriété hypothéquée,il devra lever
                            l'hypothèque en payant sa valeur plus les 10% d'intérêts. Quand il n'y a plus d'hypothèque sur aucun des
                            terrains du groupe le propriétaire peut recommencer à construire sur ces terrains.
                        </p>
                        <h2 id="faillite">Faillite</h2>
                        <p>
                            Si vous devez payer plus d'argent que vous ne puissiez en rassembler, vous êtes déclaré
                            en faillite et vous êtes éliminé. Toutes vos propriétés redeviennet des terrains nus disponibles à la vente.
                        </p>
                        <h2 id="vainqueur">Vainqueur</h2>
                        <p>
                            Le dernier joueur restant en jeu est le vainqueur.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import $ from 'jquery';

export default {
    name: 'GameSettingsModal',
    props: {
        env: {
            type: String,
            default: 'lobby'
        },
        socket: {
            type: Object,
            required: true
        },
        loggedUser: {
            type: Object,
            required: true
        }
    },
    data() {
        return {
            userSettings: {
                graphicsQuality: 1,
                autoZoom: true,
                musicLevel: 100,
                sfxLevel: 100
            }
        }
    },
    mounted() {
        this.userSettings = this.loggedUser.settings;
    },
    computed: {
        gameRemainingTime() {
            if (this.env != 'game') return false;
            if (this.$parent.gameRemainingTime == null) return false;
            let timeMs = this.$parent.gameRemainingTime;

            let seconds = Math.floor((timeMs / 1000) % 60),
                minutes = Math.floor((timeMs / (1000 * 60)) % 60),
                hours = Math.floor((timeMs / (1000 * 60 * 60)) % 24);

            let gameTime = '';
            if (hours > 0)
                gameTime += `${hours}h `;

            gameTime += `${minutes}min ${seconds}sec`;

            return gameTime;
        }
    },
    methods: {
        updateUserSettings() {
            this.userSettings.graphicsQuality = parseInt(this.userSettings.graphicsQuality);
            this.userSettings.autoZoom = !!this.userSettings.autoZoom;
            // local save
            this.$store.dispatch('updateSettings', this.userSettings);
            // parent save
            this.$parent.loggedUser.settings = this.userSettings;
            // socket save
            this.socket.emit('playerSettingsReq', this.userSettings);

            if (this.env == 'game') {
                // Refresh du plateau en direct
                this.$parent.$refs.gameboard.refreshPlayerGraphicsQuality();
                this.$parent.$refs.gameboard.refreshPlayerAutoZoom();
            }

            // Refresh volume en direct
            this.$parent.setMusicLevel(this.userSettings.musicLevel);
        },
        closeModal() {
            $('#optionsModal').modal('hide');
        },
        quitGame() {
            if (typeof this.$parent.quitGame === 'function')
                this.$parent.quitGame();
        }
    }
}
</script>

<style>
.range-slider {
  -webkit-appearance: none;
  width: 100%;
  height: 10px;
  border-radius: 5px;
  margin: 8px 0;
  background: #d7d7d7;
  outline: none;
  opacity: 0.7;
  -webkit-transition: .2s;
  transition: opacity .2s;
}

.range-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 22px;
  height: 22px;
  border-radius: 50%; 
  background: #027AFE;
  cursor: pointer;
}

.range-slider::-moz-range-thumb {
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: #027AFE;
  cursor: pointer;
}
</style>