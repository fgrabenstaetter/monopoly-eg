#Une petit documentation pour les API du plateau

* loaderPawn('nom_du_pion');
    Ceci nous offre la possibilité d'ajouter un pion au plateau. 
    Exemple: loaderPawn('moto');


* movement(pawn[X], 'Y');
    Une API pour le déplacement. Le X -> mettre un chiffre entre 0 et 7 (0 et 7 inclus) Exemple: pawn[3]=montgolfiere.
	var pawn = ["moto","citroenC4","boat","montgolfiere","overboard","tracteur","schoolbus,"camion"];
    Le Y c'est pour la destination du pion. Un chiffre entre 0 et 39 (0 et 39 inclus) Exemple: '12'
    Exemple: movement(pawn[3], '12') -> deplacement de la montgolfiere vers la case 12.



*  loaderHouseProperty('MX_Y_Z');
    Une API pour charger une maison sur une case.
    X -> entre 1 et 8 (1 et 8 inclus). Ceci représente la propriété. Exemple: 1 pour les cases roses

    Y -> entre 1 et 3 (1 et 3 inclus). Exemple: 1 pour la première case de la propriété, 2 pour la deuxième case de la propriété et 3 pour la troisième case de la propriété.
    ATTENTION! Pour les propriétés roses et bleus foncé, il y a que 2 cases pour chaque propriété.

    Z -> entre 1 et 4 (1 et 4 inclus). Ceci ajoute une maison sur la case.
    Exemple: 1 pour mettre la maison d'en bas à droite. 2 pour la maison d'en bas à gauche.
    3 pour la maison d'en haut à droite et 4 pour la maison d'en haut à gauche.
	Garder cet ordre de chargement des maisons.

    Exemple: loaderHouseProperty('M2_3_1');
    Ceci m'ajoute une maison sur la propriété bleu clair (M2) dans la troisième case(M2_3) avec la maison d'en bas à gauche (M2_3_1)


* loaderHotelProperty('HX_Y');
    Une API pour charger un hôtel.
    X -> entre 1 et 8 (1 et 8 inclus). Ceci représente la propriété. Exemple: 1 pour les cases roses
	Y -> entre 1 et 3 (1 et 3 inclus). Exemple: 1 pour la première case de la propriété, 2 pour la deuxième case de la propriété et 3 pour la troisième case de la propriété.
    ATTENTION! Pour les propriétés roses et bleus foncé, il y a que 2 cases pour chaque propriété.
    Exemple: loaderHotelProperty('H3_2')
    Ceci m'ajoute un hôtel sur la propriété mauve (H3) dans la deuxième case.


* deleteHouse('MX_Y_Z');
    Pour supprimer une maison. 
    Exemple: deleteHouse('M2_3_1') -> supprime la maison d'en bas à gauche de la propriété 2 à la case 3.

* deleteHotel('HX_Y');  
    Pour supprimer un hôtel
    Exemple: deleteHotel('H3_2') -> supprime l'hôtel de la propriété 3 à la case 2.
	
* deletePawn(pawn[X]);
	supprime un pion en cas de défaite
	
* deleteCase(cases):
	supprime une case (utilisé dans le changement de couleur).
	
* changeColorCase(cases,colore);
	modifie la couleur d'une case. ex : changecolorCase('case12', 0X00FF00)
	