/**
 * Crée une notification "toast"
 * @param {string} content Contenu de la notification
 * @param {string} type Type de la notification (success, danger ou info)
 * @param {int} time Temps d'affichage de la notification (en secondes)
 */
function toast(content, type, time) {
    let html = `<div class="toast-notification ${type}">
                    ` + content + ` 
                </div>`;

    $(html).appendTo('#content').fadeIn('fast').delay(time * 1000).fadeOut('fast', function() { $(".toast-notification").remove(); });
}