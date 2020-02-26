let socket;

function connectToSocketServer (jwt) {
    socket = io.connect(socketUrl, {
        query: 'token=' + jwt,
        path: '/socket.io',
        secure: true
    });

    socket.io.on('connect_error', (err) => {
        alert('Impossible de se connecter au serveur de sockets...');
        window.location = '/login';
    });

    socket.on('error', (error) => {
        if (error.type == 'UnauthorizedError' || error.code == 'invalid_token') {
            // redirect user to login page perhaps?
            alert('Le token a expiré');
            window.location = '/login';
        }
    });

    socket.on('unauthorized', (error) => {
        if (error.data.type == 'UnauthorizedError' || error.data.code == 'invalid_token') {
            alert('Le token a expiré (token invalide)');
            window.location = '/login';
        }
    });

    socket.on('notLoggedRes', () => {
        window.location = '/login';
    });
}

let pathname = window.location.pathname;

if (jwt && pathname != '/login' && pathname != '/register' && pathname != '/')
    connectToSocketServer(jwt);
