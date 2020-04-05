const Success  = require('./../lib/success');

class SuccessManager {
    constructor (game) {
        const count = game.players.length;
        //console.log(count);
        this.datas = new Array(count);
        for (let i = 0; i < count; i++) {
            const key = game.players[i].id;
            this.datas.push(key);
            this.datas[key] = [];
            this.datas[key].nbDoubles = 0;
            this.datas[key].nbJailTimes = 0;
            this.datas[key].nbHostels = 0;
            this.datas[key].completed = false;
            //console.log(this.datas[key]);
            //console.log(key);
        }
    }

    check (game) {
        //use game.turnData pour les données du tour qui vient de s'achever
        for (const succ of Success) {
            switch (succ.token) {
                case 'make10doubles':
                    const key = game.curPlayer.id;
                    if (game.turnData.nbDoubleDices !== 0) {
                        this.datas[key].nbDoubles += game.turnData.nbDoubleDices;
                        if (this.datas[key].nbDoubles >= 10) {
                            this.datas[key].completed = true;
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
