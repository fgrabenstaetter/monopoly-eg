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
        <img id="logo" src="../../../ui/img/ui/logo.png">
        <img id="montgolfiere" src="../../../ui/img/ui/montgolfiere.png">
        <img id="bus" src="../../../ui/img/ui/bus.png">
        <img id="bateau" src="../../../ui/img/ui/bateau.png">
        <router-link class="btn" to="Login">JOUER !</router-link>
        <div class="credits" aria-hidden="true" data-toggle="modal" data-target="#creditsModal">Crédits</div>
      </div>
    </div>

    <div class="modal" id="creditsModal" tabindex="-1" role="dialog" aria-labelledby="creditsModalLabel"
        aria-hidden="true" data-id="1">
        <div class="modal-dialog animated bounceIn" role="document">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="creditsModalLabel">Crédits</h5>
                    <button type="button" class="close" data-dismiss="modal" aria-label="Close" style="cursor: pointer;">
                        <span aria-hidden="true" style="cursor: pointer;">&times;</span>
                    </button>
                </div>
                <div class="modal-body">
                    Blablabla...
                </div>
            </div>
        </div>
    </div>

    <div class="resolution-overlay-container">
      <div>
        Oups... c'est petit ici
        <br />Pense à étendre la fenêtre du jeu pour en profiter pleinement!
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "Home"
};
</script>