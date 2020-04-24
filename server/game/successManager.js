const Success                     = require('./../lib/success');
const Constants                   = require('./../lib/constants');
const Properties                  = require('./../lib/properties');
const Street                      = require('./street');
const { UserSchema, UserManager } = require('../models/user');

class SuccessManager {

    constructor (game) {
        this.game = game;
        this.datas = {};

        for (const player of game.players) {
            const key = player.id;
            this.datas[key] = {
                nbDoubles   : 0,
                nbJailTimes : 0,
                turnNumber  : 0,
                nbTaxesPaid : 0,
                completed   : []
            };

            this.getPlayerAllSuccess(player, (success) => {
                this.datas[key].completed = success;
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

    save (player) {
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
        this.save(player);

        // emit au joueur
        let succ;
        for (const success of Success) {
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
        this.update(this.datas[key], player);

        for (const succ of Success) {
            if (this[succ.token](this.datas[key], player))
                this.checkCompleted(succ.id, player);
        }
        this.datas[key].turnNumber++;
    }

    update (obj, player) {
        if (this.game.turnData.canRollDiceAgain)
            obj.nbDoubles ++;

        if (player.remainingTurnsInJail === 3)
            obj.nbJailTimes ++;

        if (player.cellPos === 4)
            obj.nbTaxesPaid ++;
    }

    make10Doubles (obj, player) {
        if (obj.nbDoubles >= 10)
            return true;
    }

    make5Doubles (obj, player) {
        if (obj.nbDoubles >= 5)
            return true;
    }

    inJail3Times (obj, player) {
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

    doubleAtBeg (obj, player) {
        if (obj.turnNumber === 0 && this.game.turnData.nbDoubleDices !== 0)
            return true;
    }

    buyWacken (obj, player) {
        const wacken = new Street(Properties.STREET[5]);
        if (player.properties.indexOf(wacken) !== -1)
            return true;
    }

    pay3TimesTaxes (obj, player) {
        if (obj.nbTaxesPaid >= 3)
            return true;
    }
}

module.exports = SuccessManager;
