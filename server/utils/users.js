class Users {

    constructor () {
        this.users = [];
        // tableau de tableaux [pseudo, lastActivityTime, socket]
        // contient uniquement les utilisateurs identifiés
        // lastActivityTime sert à auto-déconnecter un utilisateur après un certain temps d'inactivité (il faut mettre à jour ce temps lorsqu'il est actif)
        // socket = le socket de socket.io (peut être null)
        setInterval(this.checkClear.bind(this), 1e4); // 10s
    }

    checkClear () {
        const deleteAfterTime = 3e4; // 30s
        const now = Date.now();
        for (let i = 0, l = this.users.length; i < l; i ++) {
            if (now > this.users[i][1] + deleteAfterTime) {
                // supprimer cet utilisateur
                this.users.splice(i, 1);
                l --; // \!/
            }
        }
    }

    touch (pseudo) {
        for (let i = 0, l = this.users.length; i < l; i ++) {
            if (this.users[i][0] === pseudo) {
                this.users[i][1] = Date.now();
                return;
            }
        }
    }

    isConnected (pseudo) {
        for (let i = 0, l = this.users.length; i < l; i ++) {
            if (this.users[i][0] === pseudo)
                return true;
        }

        return false;
    }

    add (pseudo) {
        if (this.isConnected(pseudo))
            return;
        this.users.push([pseudo, Date.now()]);
    }

    del (pseudo) {
        for (let i = 0, l = this.users.length; i < l; i ++) {
            if (this.users[i][0] === pseudo) {
                this.users.splice(i, 1);
                return;
            }
        }
    }

    setSocket (pseudo, socket) {
        for (let i = 0, l = this.users.length; i < l; i ++) {
            if (this.users[i][0] === pseudo) {
                this.users[i][2] = socket;
                return;
            }
        }
    }
}

module.exports = Users;
