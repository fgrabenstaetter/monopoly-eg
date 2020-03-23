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
    'token': 'advanceStart',
    'description': "Avancez jusqu'au départ (recevez 200€)",
    'effectType': 'advanceAbsolute',
    'effectArg1': 0 //ok
}, {
    'token': 'gainBankError',
    'description': 'Erreur de la banque en votre faveur. Recevez 200€.',
    'effectType': 'gainMoney',
    'effectArg1': 200 //ok
}, {
    'token': 'payAssuranceFee',
    'description': "Payez votre police d'assurance s'élevant à 50€",
    'effectType': 'loseMoney',
    'effectArg1': 50 //ok
}, {
    'token': 'gainStock',
    'description': 'La vente de votre stock vous rapporte 50€.',
    'effectType': 'gainMoney',
    'effectArg1': 50 //ok
}, {
    'token': 'jailBreak',
    'description': "Vous êtes libéré de prison. Cette carte peut être conservée jusqu'à ce qu'elle soit utilisée ou vendue.",
    'effectType': 'jailBreak' //ok
}, {
    'token': 'advanceJail',
    'description': "Allez en prison. Ne passez pas par la case Départ. Ne recevez pas 200€",
    'effectType': 'jailTime' //ok
}, {
    'token': 'gainHolidayFund',
    'description': 'Recevez votre revenue annuel. 100€.',
    'effectType': 'gainMoney',
    'effectArg1': 100 //ok
}, {
    'token': 'gainTaxRefund',
    'description': 'Les contributions vous remboursent la somme de 20€',
    'effectType': 'gainMoney',
    'effectArg1': 20 //ok
}, {
    'token': 'gainBirthday',
    'description': "C'est votre anniversaire! Chaque joueur doit vous donner 10€.",
    'effectType': 'gainMoney',
    'effectArg1': 10 //ok
}, {
    'token': 'payHospital',
    'description': "Payez à l'Hopital 100€",
    'effectType': 'loseMoney',
    'effectArg1': 100 //ok
}, {
    'token': 'paySchool',
    'description': "Payez les frais de l'Université. 50€",
    'effectType': 'loseMoney',
    'effectArg1': 50 //ok
}, {
    'token': 'gainConsultancy',
    'description': "Recevez vos intérêts sur l'emprunt à 7%. 25€",
    'effectType': 'gainMoney',
    'effectArg1': 25 //ok
}, {
    'token': 'gainBeauty',
    'description': 'Vous avez gagné le premier prix de mocheté. Recevez 10€',
    'effectType': 'gainMoney',
    'effectArg1': 10 //ok
}, {
    'token': 'gainInheritance',
    'description': 'Vous heritez de 100€',
    'effectType': 'gainMoney',
    'effectArg1': 100 //ok
}, {
    'token': 'AdvanceToFishMarket',
    'description': "Retournez à la rue du vieux marché aux poissons ",
    'effectType': 'advanceAbsolute',
    'effectArg1': 1 //ok
}];

module.exports = communityChestCards;
