let urlApi = 'https://monopolyegdev.singlequote.net/api'

// Requête HTTP AJAX - connexion
$(document).ready(function() {

    // Evénement quand on appuie sur le bouton connexion
    $('#signin-btn').click(function() {
        
        $.ajax({
            type: "POST",

            // Ressource ciblée
            url: urlApi + '/register',

            // Les données à envoyer au serveur
            data: {
                email : $('#email-input').val(),
                password : $('#password-input').val(),
                nickname : $('#nickname-input').val()
            },
            dataType: 'json',

            
            success: function(res) {
                // Forcément status 200 (donc pas d'erreur)
                location.replace('lobby.html');
            },

            // Fonction qui teste les erreurs qui sont retournées par le serveur
            error: function(err) {
                if(err.status === 400) {
                    let errorCode = JSON.parse(err.responseText).error;
                    
                    switch(errorCode){
                        case 1: alert('Cette adresse e-mail est déjà utilisée.');
                                break;

                        case 2: alert('Le nom d\'utilisateur est déjà pris.');
                                break;

                        case 3: alert('Le format d\'e-mail n\'est pas correct');
                                break;

                        case 4: alert('Le nom d\'utilisateur est trop court');
                                break;

                        case 5: alert('Le mot de passe est trop court');
                                break;

                        case 1000: alert('Internal error');
                                break;

                        case 1001: alert('Veuillez remplir tous les champs');
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