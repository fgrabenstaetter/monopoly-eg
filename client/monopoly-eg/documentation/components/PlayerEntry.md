# PlayerEntry

Entrée d'un joueur dans la liste de joueurs du jeu (HUD)

## Props

<!-- @vuese:PlayerEntry:props:start -->
|Name|Description|Type|Required|Default|
|---|---|---|---|---|
|player|Le joueur représenté par cette instance de "PlayerEntry"|`Object`|`true`|-|
|isCurrent|Indique si 'player' est le joueur courant (dont c'est actuellement le tour)|`Boolean`|`false`|-|
|loggedUser|Joueur connecté sur ce client|`Object`|`true`|-|
|socket|Socket utilisé pour les communications serveur|`Object`|`true`|-|

<!-- @vuese:PlayerEntry:props:end -->


## Methods

<!-- @vuese:PlayerEntry:methods:start -->
|Method|Description|Parameters|
|---|---|---|
|allPropertiesByType|Récupère toutes les propriétés du jeu d'un certain type|Le type de propriété à récupérer (couleur de la rue ou 'trainStation' ou 'publicCompany')|
|playerPropertiesByType|Récupère les propriétés appartenant à un joueur et d'un certain type (par couleur / gare / compagnie publique)|Le type de propriété à récupérer (couleur de la rue ou 'trainStation' ou 'publicCompany')|
|remainingPropertiesByType|Renvoie le nombre de propriétés restantes (qui n'appartiennent pas au joueur) d'un certain type|Le type de propriété à considérer (couleur de la rue ou 'trainStation' ou 'publicCompany')|
|submitPropertiesEdition|Envoie une demande de modification de propriétés au serveur (ajouter/enlever des maisons/hotels sur nos propriétés)|-|
|cancelPropertiesEdition|Annule l'édition des propriétés en cours (et remets les valeurs avant modification en place)|-|
|propertiesEditionRemovePropertyFromModifications|Enlève la propriété donnée des modifications en cours|Propriété à retirer (objet 'property')|
|propertiesEditionGetPropertyModificationIndex|Récupère l'index d'une propriété dans la liste des modifications en cours (null si non trouvé)|La propriété dont on chercher l'index (objet 'property')|
|propertiesEditionAddHouse|Ajoute une maison à une propriété dans la liste des modifications en cours|Propriété (objet 'property') à laquelle on ajoute une maison|
|propertiesEditionRemoveHouse|Retire une maison d'une propriété dans la liste des modifications en cours|Propriété (objet 'property') de laquelle on souhaite retirer une maison|
|showPlayerProperties|Affiche les propriétés du joueur|-|
|hidePlayerProperties|Masque les propriétés du joueur|-|
|displayOverviewCard|Affiche une carte de propriété du joueur (i.e. détails d'une propriété)|La propriété (objet 'property') que l'on veut afficher en détails|
|hideOverviewCard|Masque les détails d'une carte du joueur|-|
|openPropertiesEdition|Active l'édition de propriétés|-|
|openOverviewCardSell|Affiche la popup de vente d'une propriété (input prix de départ)|-|
|openOverviewCardBuy|Affiche la popup de proposition d'achat d'une propriété (input prix proposé)|-|
|closeOverviewCardSell|Ferme la popup de vente (enchère manuelle) d'une propriété|-|
|closeOverviewCardBuy|Ferme la popup de proposition d'achat d'une propriété|-|
|closeOverviewCardBuySell|Ferme à la fois la popup de vente et de proposition d'achat d'une propriété (si l'une ou les deux sont ouvertes)|-|
|toggleOverviewCardSell|Toggle (affiche si fermé, masque si affiché) la popup de vente d'une propriété|-|
|toggleOverviewCardBuy|Toggle (affiche si fermé, masque si affiché) la popup de proposition d'achat d'une propriété|-|
|sellProperty|Envoie une requête de vente (enchère manuelle) au serveur pour une propriété|-|
|buyProperty|Envoie une proposition d'achat pour une propriété au serveur (gameOfferSendReq)|-|
|mortgageProperty|Met une propriété en vente (enchère manuelle) (envoie la requête au serveur)|ID de la propriété que l'on souhaite hypothéquer|
|rebuyProperty|Rachète l'hypothèque d'une propriété (envoie la requête au serveur)|ID de la propriété dont on souhaite racheter l'hypothèque|

<!-- @vuese:PlayerEntry:methods:end -->


## Computed

<!-- @vuese:PlayerEntry:computed:start -->
|Computed|Type|Description|From Store|
|---|---|---|---|
|playerPropertiesObj|-|Renvoie les propriétés du joueur sous forme de tableau d'objets 'property' (et non plus uniquement un tableau d'IDs des propriétés)|No|
|playerPawnImgSrc|-|Chemin du fichier contenant l'image du pion du joueur|No|

<!-- @vuese:PlayerEntry:computed:end -->


## Data

<!-- @vuese:PlayerEntry:data:start -->
|Name|Type|Description|Default|
|---|---|---|---|
|propertiesTypes|`Array`|Types des propriétés et nombre total ([{ name: string, totalNb: int[, cssClass: string] }, ...])|[]|
|showProperties|`Boolean`|Indique si la fenêtre de propriétés est ouverte (bool)|false|
|overviewCard|`Boolean`|Affichage d'une carte du joueur : 'false' pour masquer sinon objet 'property'|false|
|overviewCardBuy|`Object`|Input de proposition d'achat d'une propriété : { open: bool, price: int }|-|
|overviewCardSell|`Object`|Input de mise en vente (enchère manuelle) d'une propriété : { open: bool, price: int }|-|
|propertiesEdition|`Object`|Edition des propriétés : { open: bool, totalPrice: int, modifications: [] }|-|

<!-- @vuese:PlayerEntry:data:end -->


