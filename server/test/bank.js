const Properties = require('../lib/properties');
const Street     = require('../game/street');
const Constants  = require('../lib/constants');
const Cells      = require('../lib/cells');
const Bank       = require('../game/bank');
const User       = require('../game/user');
const Player     = require('../game/player');
const assert     = require('assert');

describe("Bank", function() {
    let bank;
    let nbProperties = 0;
    for (const cell of Cells)
        if (cell.type === Constants.CELL_TYPE.PROPERTY)
            nbProperties ++;

    const userSchema = {
        nickname: 'Matthias',
        email: 'matthiass@gmail.com',
        level: 1,
        exp: 0
    };
    const user = new User(userSchema);
    const player = new Player(user, 0);

    beforeEach( () => {
         bank = new Bank(Cells);
    });

    it('Doit posséder le montant d\'argent initial', () => {
        assert.strictEqual(bank.money, Constants.GAME_PARAM.BANK_INITIAL_MONEY);
    });

    it('Doit posséder le bon nombre de propriétés', () => {
        assert.strictEqual(bank.properties.length, nbProperties);
    });

    it('Ajout d\'une propriété', () => {
        const prop = new Street(Properties.STREET[0]);
        bank.addProperty(prop);
        assert.strictEqual(bank.properties.length, nbProperties + 1);
        assert.notStrictEqual(bank.properties.indexOf(prop), -1);
    });

    it('Suppression d\'une propriété', () => {
        const prop = bank.properties[3];
        bank.delProperty(prop);
        assert.strictEqual(bank.properties.length, nbProperties - 1);
        assert.strictEqual(bank.properties.indexOf(prop), -1);
    });

    it('Ajout de monnaie', () => {
        const init = bank.money;
        bank.addMoney(600);
        assert.strictEqual(bank.money, init + 600);
    });

    it('Retrait de monnaie', () => {
        const init = bank.money;
        bank.loseMoney(32);
        assert.strictEqual(bank.money, init - 32);
        bank.loseMoney(bank.money * 2);
        assert.strictEqual(bank.money, 0);
    });

    it('Ajout d\'une dette', () => {
        bank.addDebt(player, 450);
        assert.strictEqual(bank.debts.length, 1);
    });

    it('Retrait d\'une dette', () => {
        const pMoney = player.money;
        const bMoney = bank.money;
        bank.addDebt(player, 450);
        bank.addDebt(player, 100);

        assert.strictEqual(bank.payDebt(player), true);
        assert.strictEqual(player.money, pMoney + 550);
        assert.strictEqual(bank.money, bMoney - 550);

        bank.addDebt(player, bank.money * 2);
        assert.strictEqual(bank.payDebt(player), false);
    });
});
