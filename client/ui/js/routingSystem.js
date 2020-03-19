function loadContent () {
        $(".background-container").load("html/background.html");
        $(".board-container").load("html/board.html");
        $(".ingame-ui-container").load("html/ingame_ui.html");
        $(".lobby-ui-container").load("html/lobby_ui.html");
        $(".options-overlay-container").load("html/options_overlay.html");
        $(".profile-overlay-container").load("html/profile_overlay.html");
        $(".resolution-overlay-container").load("html/res_overlay.html");
        $(".login-ui-container").load("html/login_ui.html");
        $(".signin-ui-container").load("html/signin_ui.html");
}    

// Routing des pages
let contentDiv = document.getElementById('content');

let homePage = `
        <div class="background-container"></div>

        <div class="welcome-screen">
                <button type="button" onclick="onNavItemClick('/login'); return false;" class="btn btn-primary stylized">JOUER!</button>
        </div>
        <div class="resolution-overlay-container"></div>
`;

let gamePage = `
        <div class="background-container"></div>
        <div class="board-container"></div>
        <div class="ingame-ui-container"></div>
        <div class="options-overlay-container"></div>
        <div class="profile-overlay-container"></div>
        <div class="resolution-overlay-container"></div>
`;

let lobbyPage = `
        <div class="background-container"></div>
        <div class="lobby-ui-container"></div>
        <div class="options-overlay-container"></div>
        <div class="profile-overlay-container"></div>
        <div class="resolution-overlay-container"></div>
`;

let loginPage = `
        <div class="background-container"></div>
        <div class="login-ui-container"></div>
        <div class="resolution-overlay-container"></div>
`;

let signinPage = `
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
    loadContent();
}

let onNavItemClick = (pathName) => {
    window.history.pushState(
        {},
        pathName,
        window.location.origin + pathName
    );
    contentDiv.innerHTML = routes[pathName];
    loadContent();
}

$(document).ready( () => {
    contentDiv.innerHTML = routes[window.location.pathname];
    loadContent();
});
