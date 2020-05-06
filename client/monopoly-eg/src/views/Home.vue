<template>
  <div class="home">
    <div id="content">

      <div class="welcome-screen">
        <div class="outer">
          <div class="inner">
            <div class="gradient-wrap">
              <div class="gradient"></div>
            </div>
            <div class="gradient-wrap">
              <div class="gradient"></div>
            </div>
          </div>
        </div>
        <img id="logo" src="/assets/img/ui/logo.png">
        <img id="montgolfiere" src="/assets/img/ui/montgolfiere.png">
        <img id="bus" src="/assets/img/ui/bus.png">
        <img id="bateau" src="/assets/img/ui/bateau.png">
        <router-link class="btn" to="/login">JOUER !</router-link>
        <div id="download-box" v-if="!isElectron">
          <p>Télécharger le client desktop</p>
          <div id="platform-icons-container">
            <a href="/assets/download/mac/monopoly-eg.dmg" :download="`Monopoly EG ${version}.dmg`"><i class="fab fa-apple"></i></a>
            <a href="/assets/download/linux/monopoly-eg.zip" :download="`Monopoly EG ${version}.zip`"><i class="fab fa-linux"></i></a>
            <a href="/assets/download/windows/monopoly-eg.zip" :download="`Monopoly EG ${version}.zip`"><i class="fab fa-windows"></i></a>
          </div>
        </div>
        <div class="version">Version {{version}}</div>
        <div class="credits" aria-hidden="true" data-toggle="modal" data-target="#creditsModal">Crédits</div>
      </div>
    </div>

    <div class="modal" id="creditsModal" tabindex="-1" role="dialog" aria-labelledby="creditsModalLabel"
        aria-hidden="true" data-id="1">
        <div class="modal-dialog modal-lg animated bounceIn" role="document">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="creditsModalLabel">Crédits</h5>
                    <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                        <span aria-hidden="true">&times;</span>
                    </button>
                </div>
                <div class="modal-body">

                      <h2>Licence</h2>
                      <p>
                          Ce jeu est une adaptation du jeu Monopoly publié par Hasbro et a été créé dans le cadre pédagogique
                          d'un projet intégrateur de troisième année de licence d'informatique à l'UFR maths info de Strasbourg. 
                      </p>

                      <h2>L'équipe Monopoly EG</h2>
                          <h3>Le serveur</h3>
                              <p>
                                  François GRABENSTAETTER<br>
                                  Danyl EL-KABIR<br>
                                  Dorin GUTU<br>
                                  Boris FLESCH<br>
                              </p>
                          <h3>La modélisation</h3>
                              <p>
                                  Florian FALKNER<br>
                                  Xavier FARGEAS<br>
                                  Côme FRAPPE---VIALATOUX<br>
                                  Benjamin FREELING<br>
                                  Edouard GU<br>
                              </p>
                          <h3>Le Plateau</h3>
                              <p>
                                  Florian FALKNER<br>
                                  Xavier FARGEAS<br>
                                  Boris FLESCH<br>
                              </p>
                          <h3>Le coté client</h3>
                              <p>
                                  Matthias FOYER<br>
                                  Edouard GU<br>
                                  Côme FRAPPE---VIALATOUX<br>
                                  Benjamin FREELING<br>
                                  Boris FLESCH<br>
                              </p>
                          <h3>La musique</h3>
                              <p>
                                  Edouard GU<br>
                                  Florian FALKNER<br>
                                  Boris FLESCH<br>
                              </p>
                      <h2>Remerciements</h2>
                          <p>
                              Merci à Alicia pour nous avoir prêté une version matérielle du jeu à maintes reprises !<br>
                              Merci à toute l'équipe pour avoir été solidaire, active et surtout sympathique car c'est toujours
                              un plaisir que de travailler dans la bonne humeur !<br>
                              Merci à Bobo qui a été un chef d'équipe formidable.<br>
                              Et Merci à vous d'avoir joué à notre jeu!
                          </p>
                      <h2>Contacts</h2>
                          <p>
                              projet.monopolyeg@gmail.com
                          </p>

                </div>
            </div>
        </div>
    </div>
  </div>
</template>

<script>
import { version } from "../../package.json";

/**
 * @vuese
 * @group Views
 * Page d'accueil du jeu (logo et bouton "Jouer")
 */
export default {
  name: "Home",
  data() {
    return {
      // @vuese
      // Version actuelle du client (récupéré via la config package.json)
      version: version,
      // @vuese
      // Indique si le jeu tourne sous Electron ou non (permet la distinction client lourd / web)
      isElectron: false
    }
  },
  mounted() {
    this.isElectron = !!process.env.IS_ELECTRON;
  }
};
</script>