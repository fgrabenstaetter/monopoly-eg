/** Liste des effectType:
 *  - moveAbsolute
 *  - moveRelative -> /!\ effectArg peut être négatif
 *  - loseMoney
 *  - gainMoney
 *  - jailEscapeCard
 *  - repair -> /!\ utilise effectArg2
 */

const chanceCards = [{
    description: 'Rendez-vous à la Rue des Orfèvres',
    effectType: 'moveAbsolute',
    effectArg1: 39
}, {
    description: 'Amende pour ivresse. Payez 20€.',
    effectType: 'loseMoney',
    effectArg1: 20
}, {
    description: "Avancez jusqu'à l'Avenue de la Forêt Noire. Si vous passez par la case départ recevez 200€.",
    effectType: 'moveAbsolute',
    effectArg1: 24
}, {
    description: 'Payez pour frais de scolarité 150€.',
    effectType: 'loseMoney',
    effectArg1: 150
}, {
    description: "Avancez jusqu'à la case départ",
    effectType: 'moveAbsolute',
    effectArg1: 0
}, {
    description: 'La Banque vous verse un dividende de 50€',
    effectType: 'gainMoney',
    effectArg1: 50
}, {
    description: "Vous obtenez une carte 'Fin de session parlementaire'. Elle peut être conservée jusqu'à être utilisée ou vendue",
    effectType: 'jailEscapeCard'
}, {
    description: 'Reculez de 4 cases',
    effectType: 'moveRelative',
    effectArg1: -4
}, {
    description: 'Allez en Session parlementaire. Avancez tout droit jusqu\'au parlement, ne passez pas par la case départ. Ne recevez pas 200€',
    effectType: 'goJail'
}, {
    description: 'Faites des réparations pour toutes vos maisons. Versez pour chaque maison 25€. Versez pour chaque hôtel 100€',
    effectType: 'repair',
    effectArg1: 25, // prix a payer par maison
    effectArg2: 100 // prix a payer par hotel
}, {
    description: 'Amende pour excès de vitesse. Payez 15€.',
    effectType: 'loseMoney',
    effectArg1: 15
}, {
    description: "Allez à l'arrêt de tram Droits de l'Homme. Si vous passez par la case départ recevez 200€.",
    effectType: 'moveAbsolute',
    effectArg1: 15
}, {
    description: 'Avancez au chemin du Wacken. Si vous passez par la case départ recevez 200€.',
    effectType: 'moveAbsolute',
    effectArg1: 11
}, {
    description: 'Vous êtes imposés pour les réparations de voitures à raison de 40€ par maison et 135€ par hôtel.',
    effectType: 'repair',
    effectArg1: 40, // prix a payer par maison
    effectArg2: 135 // prix a payer par hotel
}, {
    description: 'Votre immeuble et votre prêt rapportent. Recevez 150€',
    effectType: 'gainMoney',
    effectArg1: 150
}, {
    description: 'Vous avez gagné le prix de mots croisés : recevez 100€',
    effectType: 'gainMoney',
    effectArg1: 100
}];

module.exports = chanceCards;
