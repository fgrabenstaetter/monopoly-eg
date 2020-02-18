let socket;

function connectToSocketServer(jwt) {
    socket = io.connect(socketUrl, {
        'query': 'token=' + jwt
    });

    socket.io.on('connect_error', function(err) {
        alert("Impossible de se connecter au serveur de sockets...");
        window.location = "/login";
    });

    socket.on("error", function(error) {
        if (error.type == "UnauthorizedError" || error.code == "invalid_token") {
            // redirect user to login page perhaps?
            alert("User's token has expired");
        }
    });

    socket.on("unauthorized", function(error) {
        if (error.data.type == "UnauthorizedError" || error.data.code == "invalid_token") {
            alert("User's token has expired (invalid token)");
        }
    });
}

let pathname = window.location.pathname; 

if (jwt && pathname != '/login' && pathname != '/register' && pathname != '/')
    connectToSocketServer(jwt);

