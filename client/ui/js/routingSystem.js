function loadContent () {
        $(".background-container").load("html/background.html");
        $(".board-container").load("html/board.html");
        $(".ingame-ui-container").load("html/ingame_ui.html");
        $(".lobby-ui-container").load("html/lobby_ui.html");
        $(".profile-overlay-container").load("html/profile_overlay.html");
        $(".loader-overlay-container").load("html/loader_overlay.html");
        $(".resolution-overlay-container").load("html/res_overlay.html");
        $(".login-ui-container").load("html/login_ui.html");
        $(".signin-ui-container").load("html/signin_ui.html");
        $(".profile-modals-container").load("html/profile_modals.html");
}    

// Routing des pages
const contentDiv = document.getElementById('content');

const homePage = `
        <div class="background-container"></div>

        <div class="welcome-screen">
                <button type="button" onclick="onNavItemClick('/login'); return false;" class="btn btn-primary stylized">JOUER!</button>
        </div>
        <div class="resolution-overlay-container"></div>
`;

const gamePage = `
        <div class="background-container"></div>
        <div class="board-container">
                <canvas id="c"></canvas>
        </div>
        <div class="ingame-ui-container"></div>
        <div class="profile-overlay-container"></div>
        <div class="loader-overlay-container"></div>
        <div class="resolution-overlay-container"></div>
        <div class="profile-modals-container"></div>
`;

const lobbyPage = `
        <div class="background-container"></div>
        <div class="lobby-ui-container"></div>
        <div class="profile-overlay-container"></div>
        <div class="resolution-overlay-container"></div>
        <div class="profile-modals-container"></div>
`;

const loginPage = `
        <div class="background-container"></div>
        <div class="login-ui-container"></div>
        <div class="resolution-overlay-container"></div>
`;

const signinPage = `
        <div class="background-container"></div>
        <div class="signin-ui-container"></div>
        <div class="resolution-overlay-container"></div>
`;

const routes = {
    '/': homePage,
    '/index.html': homePage,
    '/game': gamePage,
    '/lobby': lobbyPage,
    '/login': loginPage,
    '/signin': signinPage,
};

window.onpopstate = () => {
    contentDiv.innerHTML = routes[window.location.pathname];
    contentDiv.className = 'page-' + window.location.pathname.substring(1);
    loadContent();
}

const onNavItemClick = (pathName) => {
    window.history.pushState(
        {},
        pathName,
        window.location.origin + pathName
    );
    contentDiv.innerHTML = routes[pathName];
    contentDiv.className = 'page-' + pathName.substring(1);
    loadContent();
}

$(document).ready( () => {
    contentDiv.innerHTML = routes[window.location.pathname];
    contentDiv.className = 'page-' + window.location.pathname.substring(1);
    loadContent();
});
