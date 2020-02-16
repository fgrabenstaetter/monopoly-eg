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

	<div class="card window">
		<div class="card-header">
			CONNECTEZ-VOUS
		</div>
		<div class="card-body">
			<div class="form-group">
				<form>
					<input type="text"
					class="form-control" name="" id="username-input" aria-describedby="helpId" placeholder="Nom d'utilisateur">
					<input type="password"
					class="form-control" name="" id="password-input" aria-describedby="helpId" placeholder="Mot de passe">
					<button type="button" class="btn btn-primary" id="connexion-btn" onclick="onNavItemClick('/lobby'); return false;">CONNEXION</button>
					<button type="button" class="btn btn-secondary" onclick="onNavItemClick('/signin'); return false;">INSCRIPTION</button>
				</form>
			</div>
			<a id="forgot-password" href="#">Mot de passe oublié ?</a>
		</div>
	</div>
`;

let signinPage = `
	<div class="background-container"></div>

	<div class="card window">
		<div class="card-header">
			INSCRIVEZ-VOUS
		</div>
		<div class="card-body">
			<div class="form-group">
				<form method='post'>
					<input type="text"
					class="form-control" name="" id="nickname-input" aria-describedby="helpId" placeholder="Nom d'utilisateur">
					<input type="email"
					class="form-control" name="" id="email-input" aria-describedby="helpId" placeholder="Mail">
					<input type="password"
					class="form-control" name="" id="password-input" aria-describedby="helpId" placeholder="Mot de passe">
					<button type="button" class="btn btn-primary" id="signin-btn">INSCRIPTION</button>
					<button type="button" onclick="onNavItemClick('/login'); return false;" class="btn btn-secondary">ANNULER</button>
				</form>
			</div>
			<a id="forgot-password" href="#">Mot de passe oublié ?</a>
		</div>
	</div>
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

//contentDiv.innerHTML = routes[window.location.pathname];