// Requête HTTP AJAX - Connexion
$(document).ready( () => {

    // Évènement quand on appuie sur le bouton connexion
    $('#formLogin-id').submit( (event) => {
        const nickname = $('#nickname-input').val();
        event.preventDefault();

        $.ajax({
            type: 'POST',

            // Ressource ciblée
            url: urlApi + '/login',

            // Les données à envoyer au serveur
            data: {
                nickname : nickname,
                password : $('#password-input').val()
            },
            dataType: 'json',


            success:  (res) => {
                // Forcément status 200 (donc pas d'erreur)
                localStorage.setItem('jwt', res.token);
                localStorage.setItem('nickname', nickname);
                localStorage.setItem('id', res.id);
                location.replace('/lobby');
            },

            // Fonction qui teste les erreurs qui sont retournées par le serveur
            error: (err) => {
                if (err.status === 400)
                    alert(JSON.parse(err.responseText).status);
            }
        });
    });
});
