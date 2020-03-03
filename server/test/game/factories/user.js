const User = require('../../../game/user');


let defaultSchema = {
    nickname: 'Test',
    email: 'test@gmail.com',
    friends: [],
    inscriptionDatetime: null,
    level: 1,
    exp: 0
};

function createUser (userSchema = null) {
    if(!userSchema)
        userSchema = {};

    for (let key in defaultSchema)
        if (!(key in userSchema)) {
            userSchema[key] = defaultSchema[key];
        }
    if (!userSchema['inscriptionDatetime'])
        userSchema['inscriptionDatetime'] = Date.now();

    let user = new User(userSchema);
    return user;
}

module.exports.createUser = createUser;
