const Success                     = require('./../lib/success');
const Constants                   = require('./../lib/constants');
const { UserSchema, UserManager } = require('../models/user');

class SuccessManager {

    constructor (game) {
        this.game = game;
        this.datas = {};

        for (const player of game.players) {
            const key = player.id;
            this.datas[key]             = {};
            this.datas[key].nbDoubles   = 0;
            this.datas[key].nbJailTimes = 0;
            this.datas[key].completed   = []; // liste des ID des succès déjà validés

            this.getPlayerAllSuccess(player, (success) => {
                this.data[key].completed = success;
            });
        }
    }

    getPlayerAllSuccess (player, cb) {
        UserSchema.findById(player.id, (err, usr) => {
            if (err || !usr)
                return;
            cb(usr.success);
        });
    }

    saveOne (player) {
        UserSchema.findById(player.id, (err, usr) => {
            if (err || !usr)
                return;

            usr.success = this.datas[player.id].completed;
            usr.save();
        });
    }

    checkCompleted (successID, player) {
        if (this.datas[player.id].completed.indexOf(successID) !== -1)
            return;

        this.datas[player.id].completed.push(successID);
        this.saveOne(player);

        // emit au joueur
        let succ;
        for (const succes of Success) {
            if (success.id  === successID) {
                succ = success;
                break;
            }
        }

        player.socket.emit('gameSuccessCompletedRes', {
            description : succ.description,
            difficulty  : succ.difficulty,
            exp         : succ.exp,
            playerLevel : player.level,
            playerExp   : player.exp
        });
    }

    check () {
        //use game.turnData pour les données du tour qui vient de s'achever
        const player = this.game.curPlayer;
        const key = player.id;
        for (const succ of Success) {
            if (this[succ.token](this.datas[key], player))
                checkCompleted(succ.id, player);
        }
    }

    make10Doubles (obj, player) {
        if (this.game.turnData.nbDoubleDices !== 0)
            obj.nbDoubles += this.game.turnData.nbDoubleDices;

        if (obj.nbDoubles >= 10)
            return true;
    }

    inJail3Times (obj, player) {
        if (player.remainingTurnsInJail === 3)
            obj.nbJailTimes ++;

        if (obj.nbJailTimes >= 3)
            return true;
    }

    build3Hostels (obj, player) {
        let cpt = 0;
        for (const prop of player.properties) {
            if (prop.type === Constants.PROPERTY_TYPE.STREET) {
                if (prop.hostel)
                    cpt ++;
            }
        }

        if (cpt >= 3)
            return true;
    }
}

module.exports = SuccessManager;
