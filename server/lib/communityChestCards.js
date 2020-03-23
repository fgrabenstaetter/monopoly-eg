/** Liste des effectType:
 *  - advanceAbsolute
 *  - advanceRelative -> /!\ effectArg peut être négatif
 *  - loseMoney
 *  - gainMoney
 *  - jailBreak
 *  - jailTime
 *  - repair -> /!\ utilise effectArg2
 */


const communityChestCards = [{
    'token': 'advanceGo',
    'description': 'Advance to "Go". (Collect $200)',
    'effectType': 'advance',
    'effectArg1': 15
}, {
    'token': 'gainBankError',
    'description': 'Bank error in your favor. Collect $200.',
    'effectType': 'gainMoney',
    'effectArg1': 200
}, {
    'token': 'payDoctorFee',
    'description': 'Doctor\'s fees. Pay $50.',
    'effectType': 'loseMoney',
    'effectArg1': 50
}, {
    'token': 'gainStock',
    'description': 'From sale of stock you get $50.',
    'effectType': 'gainMoney',
    'effectArg1': 50
}, {
    'token': 'jailBreak',
    'description': 'Get Out of Jail Free. This card may be kept until needed or sold/traded.',
    'effectType': 'jailBreak'
}, {
    'token': 'advanceJail',
    'description': 'Go to Jail. Go directly to jail. Do not pass Go, Do not collect $200.',
    'effectType': 'jailTime'
}, {
    'token': 'gainOpera',
    'description': 'Grand Opera Night. Collect $50 from every player for opening night seats.',
    'effectType': 'gainMoney',
    'effectArg1': 50
}, {
    'token': 'gainHolidayFund',
    'description': 'Holiday Fund matures. Receive $100.',
    'effectType': 'gainMoney',
    'effectArg1': 100
}, {
    'token': 'gainTaxRefund',
    'description': 'Income tax refund. Collect $20.',
    'effectType': 'gainMoney',
    'effectArg1': 20
}, {
    'token': 'gainBirthday',
    'description': 'It is your birthday. Collect $10 from every player.',
    'effectType': 'gainMoney',
    'effectArg1': 10
}, {
    'token': 'gainLifeInsurance',
    'description': 'Life insurance matures – Collect $100',
    'effectType': 'gainMoney',
    'effectArg1': 100
}, {
    'token': 'payHospital',
    'description': 'Hospital Fees. Pay $50.',
    'effectType': 'loseMoney',
    'effectArg1': 50
}, {
    'token': 'paySchool',
    'description': 'School fees. Pay $50.',
    'effectType': 'loseMoney',
    'effectArg1': 50
}, {
    'token': 'gainConsultancy',
    'description': 'Receive $25 consultancy fee.',
    'effectType': 'gainMoney',
    'effectArg1': 25
}, {
    'token': 'payRepair',
    'description': 'You are assessed for street repairs: Pay $40 per house and $115 per hotel you own.',
    'effectType': 'loseMoney',
    'effectArg1': 40,
    'effectArg2': 115
}, {
    'token': 'gainBeauty',
    'description': 'You have won second prize in a beauty contest. Collect $10.',
    'effectType': 'gainMoney',
    'effectArg1': 10
}, {
    'token': 'gainInheritance',
    'description': 'You inherit $100.',
    'effectType': 'gainMoney',
    'effectArg1': 100
}];

module.exports = communityChestCards;
