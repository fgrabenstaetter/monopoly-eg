# GameBoard

Plateau du jeu (utilisé dans le jeu)

## Methods

<!-- @vuese:GameBoard:methods:start -->
|Method|Description|Parameters|
|---|---|---|
|refreshPlayerGraphicsQuality|Adapte la qualité des graphismes en fonctions des paramètres utilisateur|-|
|refreshPlayerAutoZoom|Adapte le zoom auto en fonction des paramètres utilisateur|-|
|deleteHouse|Supprime une maison|{int} ncase: Numero de case (int), nhouse: Numero de maison (int)|
|deleteHouseD|Supprime une maison (Auxiliaire)|{string} houseProperty de la maison|
|deleteHotel|Supprime un hotel|{int} ncase: Numero de case|
|deleteHotelD|Supprime un hotel (Auxiliaire)|{string} hotelProperty: Numero de l'hotel|
|deletePawn|Supprime un pion|{string} pawn: nom du pion|
|changeColorFlag|Modifie la couleur du drapeau|Numéro de la case ; Couleur du drapeau (hexadecimal, ex : '#FFFFFF')|
|deleteFlag|Supprime un drapeau|Numéro de la case|
|loaderFlag|Ajoute un drapeau de la couleur du joueur sur la propriété|Numéro de la case ; Couleur du drapeau (hexadecimal, ex : '#FFFFFF')|
|deleteHypotheque|Efface l'hypothèque de la propriété|Numéro de la case|
|loaderHypotheque|Charge l'hypothèque pour la propriété|Numéro de la case|
|loaderPawn|Ajoute un pion à la case qu'on veut|{string} pawn: Le nom du pion (Ex: 'moto'), {int} vdp: Un entier entre [0-39]|
|loaderHouseProperty|Fonction auxiliaire - Charge une maison à la case spécifiée 1 -> met la case en bas à droite de la case 2 -> met la case en bas à gauche de la case 3 -> met la case en haut à droite de la case 4 -> met la case en haut à gauche de la case|{int} ncase Chiffre de la case, {int} nhouse Entier entre [1-4].|
|housePropertyL|Fonction prinicpale - Charge une maison à la case spécifiée|{string} houseProperty:  Nom de la maison (Ex: M3_1_2)|
|loaderHotelProperty|Fonction auxiliaire - Charge un hôtel à la case spécifiée|{int} ncase: Chiffre de la case|
|hotelPropertyL|Fonction principale - Charge un hôtel à la case spécifiée|{string} hotelPropriete: Nom de l'hôtel (Ex: H1_2)|
|zoomOnOff|Active ou désactive le zoom sur le plateau|{int} number: Entier entre [0-1]. 0 pour désactiver le zoom et 1 pour l'activer|
|animateVector3|Animation pour le déplacement des pions {int} target: Les coordonnées de la case d'arrivée, {int} options: Options - Callback Animates a Vector3 to the target|{int} pawn: Nom du pion, {int} vectorToAnimate: La position du pion,|
|test|Réplace la caméra au centre du plateau {int} time: La durée du mouvement de la caméra|{string} position: Les coordonnées de la case d'arrivée,|
|tweenCamera|Déplace la caméra en suivant le pion et fait un zoom sur le pion {int} time: La durée du mouvement de la caméra|{string} position: Les coordonnées de la case d'arrivée,|
|movement|Déplace le pion sur le plateau callback: Appel d'un callback()|{string} pawn: Le nom du pion (Ex: 'moto'), {int} vdp Un entier entre [0-39],|

<!-- @vuese:GameBoard:methods:end -->


