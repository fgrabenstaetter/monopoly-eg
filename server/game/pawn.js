class Pawn {

    /**
     * @param id Le id du pion dans la partie (ordre du Player dans le jeu?)
     * @param token Le nom standard du pion
     */
    constructor (id, token) {
        this.id =  id;
        this.token = token;
        // on aura des autres attributs ulterieurement
    }
}

module.exports = Pawn;
