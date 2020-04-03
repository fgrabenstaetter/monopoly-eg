const Success  = require('./../lib/success');

class SuccessManager {
    constructor () {
        //this.nbDoubles = 0;
    }
    check (game) {
        for (const succ of Success) {
            switch (succ.token) {
                case 'make6double':
                    break;

                case '5timesInJail':
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
