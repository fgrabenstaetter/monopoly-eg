// Requête HTTP AJAX - Connexion
$(document).ready(function() {

    // Évènement quand on appuie sur le bouton connexion
    $('#login-btn').click(function() {   
        $.ajax({
            type: 'POST',

            // Ressource ciblée
            url: urlApi + '/login',

            // Les données à envoyer au serveur
            data: {
                nickname : $('#nickname-input').val(),
                password : $('#password-input').val()
            },
            dataType: 'json',

            
            success: function(res) {
                // Forcément status 200 (donc pas d'erreur)
                location.replace('/lobby');
            },

            // Fonction qui teste les erreurs qui sont retournées par le serveur
            error: function(err) {
                if(err.status === 400) {
                    let errorCode = JSON.parse(err.responseText).error;
                    
                    switch(errorCode){
                        case 1: alert('Identifiants incorrects');
                                break;

                        case 1000: alert('Internal error');
                                   break;

                        case 1001: alert('Veuillez remplir tous les champs');
                                   break;

                        case 1002: alert('Inconnu');
                                   break;

                        default: alert('Erreur inconnue');
                    }
                } else {
                    alert('Erreur inconnue serveur');
                }
            }
        });
    });
});