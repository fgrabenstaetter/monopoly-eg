/** Liste des effectType:
 *  - moveAbsolute
 *  - moveRelative -> /!\ effectArg peut être négatif
 *  - loseMoney
 *  - gainMoney
 *  - jailEscapeCard
 *  - repair -> /!\ utilise effectArg2
 */


const communityChestCards = [{
    description: "Avancez jusqu'au départ (recevez 200€)",
    effectType: 'moveAbsolute',
    effectArg1: 0
}, {
    description: 'Erreur de la banque en votre faveur. Recevez 200€.',
    effectType: 'gainMoney',
    effectArg1: 200
}, {
    description: "Payez votre police d'assurance s'élevant à 50€",
    effectType: 'loseMoney',
    effectArg1: 50
}, {
    description: 'La vente de votre stock vous rapporte 50€.',
    effectType: 'gainMoney',
    effectArg1: 50
}, {
    description: "Vous obtenez une carte 'Fin de session parlementaire'. Elle peut être conservée jusqu'à être utilisée ou vendue",
    effectType: 'jailEscapeCard'
}, {
    description: "Allez en session parlementaire. Ne passez pas par la case Départ. Ne recevez pas 200€",
    effectType: 'goJail',
    effectArg1: 30
}, {
    description: 'Recevez votre revenu annuel. 100€.',
    effectType: 'gainMoney',
    effectArg1: 100
}, {
    description: 'Les contributions vous remboursent la somme de 20€',
    effectType: 'gainMoney',
    effectArg1: 20
}, {
    description: "C'est votre anniversaire! Chaque joueur doit vous donner 10€.",
    effectType: 'anniversary',
    effectArg1: 10
}, {
    description: "Payez à l'Hopital 100€",
    effectType: 'loseMoney',
    effectArg1: 100
}, {
    description: "Payez les frais de l'Université. 50€",
    effectType: 'loseMoney',
    effectArg1: 50
}, {
    description: "Recevez vos intérêts sur l'emprunt à 7%. 25€",
    effectType: 'gainMoney',
    effectArg1: 25
}, {
    description: 'Votre ami Benjamin vous rembourse enfin les cafés que vous lui avez avancé. Recevez 10€',
    effectType: 'gainMoney',
    effectArg1: 10
}, {
    description: 'Vous heritez de 100€',
    effectType: 'gainMoney',
    effectArg1: 100
}, {
    description: "Allez à la rue du vieux marché aux poissons",
    effectType: 'moveAbsolute',
    effectArg1: 1
}];

module.exports = communityChestCards;
