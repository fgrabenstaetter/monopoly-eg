#Une petit documentation pour les API du plateau

* loaderPawn(pawn, vdp);
    Ceci nous offre la possibilité d'ajouter un pion à la case qu'on veut. 
    pawn -> nom du pion.
    vdp -> Chiffre de la case.
    Exemple : loaderPawn('moto', 14); -> ajoute le pion moto à la case 14.


* movement(pawn, vdp, callback);
    Une API pour le déplacement. 
    pawn -> ['moto', 'citroenC4', 'boat', 'montgolfiere', 'overboard', 'tracteur', 'schoolbus', 'camion'];
    vdp -> Chiffre de la case.
    Callback: Appel d'un callback.
    Exemple : movement('moto', 12, function() {
                console.log('le déplacement est terminé');
             });) -> deplacement de la moto vers la case 12 et une fois arrivé à la case 12 affichage du texte.


* loaderHouseProperty(ncase, nhouse);
    Une API pour charger une maison à la bonne case.
    ncase -> Chiffre de la case.

    nhouse -> 1 pour mettre la maison en bas à droite. 2 pour la maison en bas à gauche.
              3 pour la maison en haut à droite et 4 pour la maison en haut à gauche.
	Garder cet ordre de chargement des maisons.
    ATTENTION! Pour les propriétés marrons et bleus foncé, il y a que 2 cases pour chaque propriété.

    Exemple : loaderHouseProperty(9, 1);
    Ceci ajoute une maison à la 9 case avec la maison en bas à droite.


* loaderHotelProperty(ncase);
    Une API pour charger un hôtel à la bonne case.
    ncase -> Chiffre de la case. 
    ATTENTION! Pour les propriétés marrons et bleus foncé, il y a que 2 cases pour chaque propriété.
    Exemple : loaderHotelProperty(3).
    Ceci ajoute un hôtel sur la troisième case.


* deleteHouse(ncase, nhouse);
    Pour supprimer une maison. 
    ncase -> Chiffre de la case.
    nhouse -> Chiffre de la maison (entre 1 et 4).
    Exemple : deleteHouse(3, 1) -> supprime la maison d'en bas à droite(la 1ère) à la case 3.


* deleteHotel(ncase);  
    Pour supprimer un hôtel.
    ncase -> Chiffre de la case.
    Exemple : deleteHotel(18) -> supprime l'hôtel à la case 18.
	

* deletePawn('nom_du_pion');
	Supprime un pion en cas de défaite.
    Exemple : deletePawn('boat') -> supprime le pion bateau.
    
	
* loaderFlag(flag, colore);
	Charge un drapeau sur la propriété achetée au couleur du joueur
	Exemple : loaderFlag('d1', 'yellow')

	
* deleteFlag(flag)
	Supprime un drapeau
	Exemple : deleteFlag('d1')

	
* changeColorFlag(flag, colore)
	Change la couleur d'un drapeau
	Exemple : changeColorFlag('d1','yellow')


* deleteCase(cases):
	Supprime une case (utilisé dans le changement de couleur).
	

* changeColorCase(cases, colore);
	Modifie la couleur d'une case. 
    Exemple : changecolorCase('case12', 0X00FF00).
	

* zoomOnOff(number);
    Active ou désactive le zoom. Par défaut, le zoom est activé.
    1 pour activer et 0 pour désactiver.