let urlApi = 'https://monopolyegdev.singlequote.net/api'

// Requête HTTP AJAX - jouer
$(document).ready(function() {

    // Evénement quand on appuie sur le bouton jouer
    $('#jouer-btn').click(function() {
        
        $.ajax({
            type: "GET",

            // Ressource ciblée
            url: urlApi + '/MettreURLIci',

            // Les données à envoyer au serveur
            dataType: 'json',

            
            success: function(res) {
                // Forcément status 200 (donc pas d'erreur)
                location.replace('MettreURLIci');
            },

            // Fonction qui teste les erreurs qui sont retournées par le serveur
            error: function(err) {
                if(err.status === 400) {
                    let errorCode = JSON.parse(err.responseText).error;
                    
                    /*
                        faudra voir pour les erreurs
                    */
                } else {
                    alert('Erreur inconnue serveur');
                }
            }
        });
    });
});

/*
    Comme la page n'est pas encore existante et le groupe n'en n'est pas encore là, 
    je ne peux pas savoir comment elle sera structurée.
    Donc il y aura des changements à prendre en compte.
*/