/** Liste des effectType:
 *  - advanceAbsolute
 *  - advanceRelative -> /!\ effectArg peut être négatif
 *  - loseMoney
 *  - gainMoney
 *  - jailBreak
 *  - jailTime
 *  - repair -> /!\ utilise effectArg2
 */



const chanceCards = [{
    'token': 'advanceRueDesOrfevres',
    'description': 'Rendez-vous à la Rue des Orfèvres',
    'effectType': 'advanceAbsolute',
    'effectArg1': 39 //OK
}, {
    'token': 'PayDrunkennessFine',
    'description': 'Amende pour ivresse. Payez 20€.',
    'effectType': 'loseMoney',
    'effectArg1': 20 //OK
}, {
    'token': 'advanceAvForetNoire',
    'description': "Avancez jusqu'à l'Avenue de la Forêt Noire. Si vous passez par la case départ recevez 200€.",
    'effectType': 'advanceAbsolute',
    'effectArg1': 24 //OK
}, {
    'token': 'PayScolarity',
    'description': 'Payez pour frais de scolarité 150€.',
    'effectType': 'loseMoney',
    'effectArg1': 150 //OK
}, {
    'token': 'advanceGO',
    'description': "Avancez jusqu'à la case départ",
    'effectType': 'advanceAbsolute',
    'effectArg1': 0 //OK
}, {
    'token': 'gainBankDivident',
    'description': 'La Banque vous verse un dividende de 50€',
    'effectType': 'gainMoney',
    'effectArg1': 50 //OK
}, {
    'token': 'jailBreak',
    'description': "Vous êtes libérés de prison. Cette carte peut être conservée jusqu'à être utilisée ou vendue",
    'effectType': 'jailBreak' //OK
}, {
    'token': 'advanceBack',
    'description': 'Reculez de 3 cases',
    'effectType': 'advanceRelative',
    'effectArg1': -3 //OK
}, {
    'token': 'advanceJail',
    'description': 'Allez en prison. Avancez tout droit en prison, ne passez pas par la case départ. Ne recevez pas 200€',
    'effectType': 'jailTime' //OK
}, {
    'token': 'payRepairs',
    'description': 'Faites des réparations pour toutes vos maisons. Versez pour chaque maison 25€. Versez pour chaque hôtel 100€',
    'effectType': 'repair',
    'effectArg1': 25, // prix a payer par maison
    'effectArg2': 100 // prix a payer par hotel OK
}, {
    'token': 'paySpeedLimitFine',
    'description': 'Amende pour excès de vitesse. Payez 15€.',
    'effectType': 'loseMoney',
    'effectArg1': 15 //OK
}, {
    'token': 'advanceTramDroitsHomme',
    'description': "Allez à l'arrêt de tram Droits de l'Homme. Si vous passez par la case départ recevez 200€.",
    'effectType': 'advanceAbsolute',
    'effectArg1': 15 //OK
}, {
    'token': 'advanceCheminDuWacken',
    'description': 'Avancez au chemin du Wacken. Si vous passez par la case départ recevez 200€.',
    'effectType': 'advanceAbsolute',
    'effectArg1': 11 // OK
}, {
    'token': 'payHugeRepair',
    'description': 'Vous êtes imposés pour les réparations de voirire à raison de 40€ par maison et 115€ par hôtel.',
    'effectType': 'repair',
    'effectArg1': 40, // prix a payer par maison
    'effectArg2': 115 // prix a payer par hotel OK
}, {
    'token': 'gainLoan',
    'description': 'Votre immeuble et votre prêt rapportent. Recevez 150€',
    'effectType': 'gainMoney',
    'effectArg1': 150 //OK
}, {
    'token': 'gainCrossword',
    'description': 'Vous avez gagné le prix de mots croisés : recevez 100€',
    'effectType': 'gainMoney',
    'effectArg1': 100 //OK
}];

module.exports = chanceCards;
