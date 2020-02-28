// Requête HTTP AJAX - mot de passe oublié
$(document).ready( () => {

    // Evénement quand on appuie sur le bouton mot de passe oublié
    $('#amis-btn').click( () => {

        $.ajax({
            type: "GET",

            // Ressource ciblée
            url: urlApi + '/MettreURLIci',

            // Les données à envoyer au serveur
            dataType: 'json',

            success: (res) => {
                // Forcément status 200 (donc pas d'erreur)
                location.replace('MettreURLIci');
            },

            // Fonction qui teste les erreurs qui sont retournées par le serveur
            error: (err) => {
                if (err.status === 400)
                    alert(JSON.parse(err.responseText).status);
            }
        });
    });
});

/*
    Comme la page n'est pas encore existante et le groupe n'en n'est pas encore là,
    je ne peux pas savoir comment elle sera structurée.
    Donc il y aura des changements à prendre en compte.
    */
