let contentDiv = document.getElementById('content');

let homePage = `
	<div class="background-container"></div>

	<div class="welcome-screen">
		<button type="button" onclick="onNavItemClick('/login'); return false;" class="btn btn-primary stylized">JOUER!</button>
	</div>
`;

let gamePage = `
	<div class="background-container"></div>
	<div class="board-container"></div>
	<div class="ingame-ui-container"></div>
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
`;

let signinPage = `
	<div class="background-container"></div>
	<div class="signin-ui-container"></div>
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

$(document).ready(function() {
	contentDiv.innerHTML = routes[window.location.pathname];
	loadContent();
});