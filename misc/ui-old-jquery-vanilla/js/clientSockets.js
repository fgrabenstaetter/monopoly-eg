let socket;
const pathname = window.location.pathname;

function connectToSocketServer (jwt) {
    socket = io.connect(socketUrl, {
        query: 'token=' + jwt,
        path: '/socket.io',
        secure: true
    });

    socket.io.on('connect_error', (err) => {
        toast('Impossible de se connecter au serveur de sockets...', 'danger', 5);
        window.location = '/login';
    });

    socket.on('error', (error) => {
        if (error.type == 'UnauthorizedError' || error.code == 'invalid_token') {
            // redirect user to login page perhaps?
            toast('Le token a expiré', 'danger', 5);
            window.location = '/login';
        }
    });

    socket.on('unauthorized', (error) => {
        if (error.data.type == 'UnauthorizedError' || error.data.code == 'invalid_token') {
            toast('Le token a expiré (token invalide)', 'danger', 5);
            window.location = '/login';
        }
    });

    socket.on('notLoggedRes', () => {
        window.location = '/login';
    });

    if (pathname === '/lobby') {
        socket.on('canReconnectToGame', () => {
            window.location = '/game';
        });
    }
}


if (jwt && pathname != '/login' && pathname != '/register' && pathname != '/')
    connectToSocketServer(jwt);
