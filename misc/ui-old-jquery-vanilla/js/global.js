/** ROUTER **/
const root = null;
const useHash = false; // Defaults to: false
const hash = '#'; // Defaults to: '#'
const router = new Navigo(root, useHash, hash);

function loadView(view) {
    $('#content').load(`/html/${view}.html`);
    $('#content').attr('class', `page-${view}`);
}

router
    .on(() => {
        loadView('home');
    })
    .on('/login', function () {
        loadView('login');
    })
    .on('/signin', function () {
        loadView('signin');
    })
    .on('/lobby', function () {
        loadView('lobby');
    })
    .on('/game', function () {
        loadView('game');
    })
    .resolve();

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

/**
 * Gestion des options joueur
 */
$('#content').on('shown.bs.modal', '#optionsModal', function() {
    $('#optionsModal #graphics-quality').val(loggedUser.settings.graphicsQuality);
    $('#optionsModal #auto-zoom').prop('checked', loggedUser.settings.autoZoom);
});

$('#content').on('change', '#optionsModal #graphics-quality', function() {
    // local save
    loggedUser.settings.graphicsQuality = $(this).val();
    localStorage.setItem('loggedUser', JSON.stringify(loggedUser));

    // socket save
    socket.emit('playerSettingsReq', {
        graphicsQuality: loggedUser.settings.graphicsQuality,
        autoZoom: loggedUser.settings.autoZoom
    });
    
    if (typeof setPlayerGraphicsQuality === 'function')
        setPlayerGraphicsQuality();
});

$('#content').on('change', '#optionsModal #auto-zoom', function() {
    // local save
    loggedUser.settings.autoZoom = $(this).prop('checked');
    localStorage.setItem('loggedUser', JSON.stringify(loggedUser));

    // socket save
    socket.emit('playerSettingsReq', {
        graphicsQuality: loggedUser.settings.graphicsQuality,
        autoZoom: loggedUser.settings.autoZoom
    });
    
    if (typeof setPlayerAutoZoom === 'function')
        setPlayerAutoZoom();
});