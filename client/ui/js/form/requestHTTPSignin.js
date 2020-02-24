// Requête HTTP AJAX - Inscription
$(document).ready( () => {

    // Évènement quand on appuie sur le bouton connexion
    $('#formSignin-id').submit( (event) => {
        event.preventDefault();
        $.ajax({
            type: 'POST',

            // Ressource ciblée
            url: urlApi + '/register',

            // Les données à envoyer au serveur
            data: {
                email : $('#email-input').val(),
                password : $('#password-input').val(),
                nickname : $('#nickname-input').val()
            },
            dataType: 'json',


            success: (res) => {
                // Forcément status 200 (donc pas d'erreur)
                location.replace('/login');
            },

            // Fonction qui teste les erreurs qui sont retournées par le serveur
            error: (err) => {
                if (err.status === 400)
                    alert(JSON.parse(err.responseText).status);
            }
        });
    });
});
