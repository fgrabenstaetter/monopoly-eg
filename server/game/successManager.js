const Success   = require('./../lib/success');
const Constants = require('./../lib/constants');

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
        }
    }

    check (game) {
        //use game.turnData pour les données du tour qui vient de s'achever
        const player = game.curPlayer;
        const key = player.id;
        for (const succ of Success) {
            switch (succ.token) {
                case 'make10doubles':
                    if (game.turnData.nbDoubleDices !== 0) {
                        this.datas[key].nbDoubles += game.turnData.nbDoubleDices;
                    }
                    if (this.datas[key].nbDoubles >= 10) {
                        this.datas[key].completed = true;
                    }
                    break;

                case '3timesInJail':
                    if (player.remainingTurnsInJail === 3) {
                        this.datas[key].nbJailTimes++;
                    }
                    if (this.datas[key].nbJailTimes >= 3) {
                        this.datas[key].completed = true;
                    }
                    break;

                case 'build3hostels':
                    let cpt = 0;
                    for (const prop of player.properties) {
                        console.log(prop);
                        if (prop.type === Constants.PROPERTY_TYPE.STREET) {
                            if (prop.hostel) {
                                cpt++;
                            }
                        }
                    }
                    this.datas[key].nbHostels += cpt;
                    if (this.datas[key].nbHostels >= 3) {
                        this.datas[key].completed = true;
                    }
                    break;

                //Ajouter d'autres succès ?
                default:
                    break;
            }
        }
    }
}

module.exports = SuccessManager;
