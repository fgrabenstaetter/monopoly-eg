// DEV LOCAL
const urlApi = 'http://localhost:3000/api';
const socketUrl = 'http://localhost:3000';

// PROD
// const urlApi = 'https://monopolyegdev.singlequote.net/api';
// const socketUrl = 'https://monopolyegdev.singlequote.net';

const jwt = localStorage.getItem('jwt');
let loggedUser = localStorage.getItem('loggedUser');
if (loggedUser)
    loggedUser = JSON.parse(loggedUser);
else
    loggedUser = {_id: null, nickname: null, email: null, avatar: null};

const ID = loggedUser._id;
let NICKNAME = loggedUser.nickname;
let EMAIL = loggedUser.email;
let AVATAR = loggedUser.avatar;
