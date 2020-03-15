const chanceCards = [{
    'token': 'advanceGo',
    'description': 'Advance to "Go". (Collect $200)',
    'effectType': 'advance',
    'effectArg1': 0  // move to cell number 1
}, {
    'token': 'advanceIllinoisAve',
    'description': 'Advance to Illinois Avenue. If you pass Go, collect $200.',
    'effectType': 'advance',
    'effectArg1': 0 // move to Illinois Avenue
}, {
    'token': 'advanceStCharles',
    'description': 'Advance to St. Charles Place. If you pass Go, collect $200.',
    'effectType': 'advance',
    'effectArg1': 0 // move to St. Charles Place
}, {
    'token': 'advanceUtility',
    'description': 'Advance token to nearest Utility. If unowned, you may buy it from the Bank. If owned, throw dice and pay owner a total 10 times the amount thrown.',
    'effectType': 'advance',
    'effectArg1': 0 // move to nearest Utility
}, {
    'token': 'advanceRailroad',
    'description': 'Advance token to the nearest Railroad and pay owner twice the rental to which he/she is otherwise entitled. If Railroad is unowned, you may buy it from the Bank.',
    'effectType': 'advance',
    'effectArg1': 0 // move to nearest Railroad
}, {
    'token': 'gainBankDivident',
    'description': 'Bank pays you dividend of $50.',
    'effectType': 'gainMoney',
    'effectArg1': 50 // gain $50
}, {
    'token': 'jailBreak',
    'description': 'Get out of Jail Free. This card may be kept until needed, or traded/sold.',
    'effectType': 'jailBreak'
}, {
    'token': 'advanceBack',
    'description': 'Go Back Three (3) Spaces.',
    'effectType': 'jailBreak',
    'effectArg1': 1 // gain 1 jailbreak card
}, {
    'token': 'advanceJail',
    'description': 'Go to Jail. Go directly to Jail. Do not pass GO, do not collect $200.',
    'effectType': 'jailTime'
}, {
    'token': 'payRepairs',
    'description': 'Make general repairs on all your property: For each house pay $25, For each hotel pay $100.',
    'effectType': 'loseMoney',
    'effectArg1': 1 // TODO
}, {
    'token': 'payPoorTax',
    'description': 'Pay poor tax of $15.',
    'effectType': 'loseMoney',
    'effectArg1': 15
}, {
    'token': 'advanceReadingRail',
    'description': 'Take a trip to Reading Railroad. If you pass Go, collect $200.',
    'effectType': 'advance',
    'effectArg1': 1 // Take a trip to Reading Railroad
}, {
    'token': 'advanceBoardwalk',
    'description': 'Take a walk on the Boardwalk. Advance token to Boardwalk.',
    'effectType': 'advance',
    'effectArg1': 1 // Take a trip to Reading Railroad
}, {
    'token': 'payChairman',
    'description': 'You have been elected Chairman of the Board. Pay each player $50.',
    'effectType': 'loseMoney',
    'effectArg1': 50 // TODO
}, {
    'token': 'gainLoan',
    'description': 'Your building loan matures. Receive $150.',
    'effectType': 'gainMoney',
    'effectArg1': 150
}, {
    'token': 'gainCrossword',
    'description': 'You have won a crossword competition. Collect $100.',
    'effectType': 'gainMoney',
    'effectArg1': 100
}]

module.exports = chanceCards;
