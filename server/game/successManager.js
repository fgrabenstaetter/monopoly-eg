const Success  = require('./../lib/success');

class SuccessManager {
    constructor (game) {
        const count = game.players.length;
        this.datas = new Array(count);
        for (let i = 0; i < count; i++) {
            this.datas[i].nbDoubles = 0;
            this.datas[i].nbJailTimes = 0;
            this.datas[i].nbHostels = 0;
            this.datas[i].completed = false;
            this.datas[i].playerID = game.players[i].id;
        }
    }
    check (game) {
        //use game.turnData pour les données du tour qui vient de s'achever
        for (const succ of Success) {
            switch (succ.token) {
                case 'make10doubles':
                    if (game.turnData.nbDoubleDices !== 0) {
                        for (const data of this.datas) {
                            if (data.playerID === game.curPlayer.id) {
                                data.nbDoubles += game.turnData.nbDoubleDices;
                                if (data.nbDoubles >= 10) {
                                    data.completed = true;
                                }
                                break
                            }
                        }
                    }
                    break;

                case '3timesInJail':
                    break;

                case 'build3hostels':
                    break;
                default:
                    break;
            }
        }
    }
}

module.exports = SuccessManager;
