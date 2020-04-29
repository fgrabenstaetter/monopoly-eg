# Game

Ecran de jeu dans lequel se déroule une partie (contenant HUD, plateau, chat, etc.)

## Methods

<!-- @vuese:Game:methods:start -->
|Method|Description|Parameters|
|---|---|---|
|nickToId|Récupère l'ID d'un joueur à partir de son pseudo (null si non trouvé)|Le pseudo du joueur|
|idToNick|Récupère le pseudo d'un joueur à partir de son ID (null si non trouvé)|L'ID du joueur|
|getPlayerById|Récupère un objet 'player' (joueur) à partir de son ID (null si non trouvé)|L'ID du joueur|
|getCellById|Récupère un objet 'cell' (case du plateau) à partir de son ID (null si non trouvé)|L'ID de la case|
|getPropertyById|Récupère un objet 'property' (propriété) à partir de son ID (null si non trouvé)|L'ID de la propriété|
|getPropertyByCellId|Récupère un objet 'property' (propriété) à partir de l'ID d'une 'cell' (case du plateau) (null si non trouvé)|L'ID de la case dont on souhaite récupérer la propriété "associée"|
|getCellByProperty|Récupère un objet 'cell' (case du plateau) à partir d'une 'property' (propriété)|La propriété dont on souhaite récupérer la case|
|gameRollDiceReq|Envoie une requête de lancement de dés|-|
|gameTurnEndReq|Signale la fin de notre tour de jeu (pour pouvoir manuellement passer la main au joueur suivant)|-|
|discardTurnNotif|Supprime une notification de tour ('turn notification') de la liste des notifications (et donc du HUD)|L'index de la notification à supprimer|
|saleCardBuyProperty|Envoi une requête d'achat (après être tombé sur la case d'un terrain vierge) et supprime la notification associée|L'index de la notification concernée|
|acceptUseBonusJail|Indique que l'on utilisera notre carte bonus "Sortir du parlement" au prochain lancement de dés|L'index de la notification concernée (qui sera supprimée)|
|discardOffer|Efface une offre d'achat faite par un autre joueur (sans l'accepter)|L'ID de l'offre concernée (et non pas l'index !)|
|offerAccept|Accepte une offre d'achat faite par un autre joueur et supprime la notification associée|L'ID de l'offre concernée|
|sendBid|Envoi notre participation à une enchère en cours|L'objet 'bid' contenant l'enchère à laquelle on participe|
|rejectBid|Rejette la participation à une enchère ("passer" l'enchère) et envoie une participation à 0€ au serveur|L'objet 'bid' contenant l'enchère que l'on souhaite passer|
|playMusic|Lance la musique de fond du jeu|-|
|setMusicLevel|Modifie le volume de la musique|Pourcentage du volume (entier de 0 à 100)|
|stopMusic|Coupe la musique de fond (en fondu)|-|
|loadSfx|Précharge tous les effets sonores (SFX) du jeu|-|
|setSfxLevel|Modifie le volume des effets sonores|Pourcentage du volume (entier de 0 à 100)|
|gameReady|Indique au serveur que l'on est prêt à commencer la partie côté client (et donc à recevoir les sockets du serveur)|-|
|pushGameOfferReceive|Ajoute une offre d'achat à notre liste|L'offre à ajouter (objet 'offer')|
|pushGameBid|Ajoute une enchère à notre liste|Enchère à ajouter (objet 'bid')|
|quitGame|Quitte volontairement la partie et de manière définitive (en le signalant au serveur)|-|
|gameActionResAfterFirstMovement|Continue le tour de jeu (gameActionRes) après le premier déplacement|data : données de gameActionRes ; currPlayer : joueur courant ; cellPos2 : position #2 (le cas échéant)|
|gameActionResAfterSecondMovement|Termine le gameActionRes (et vérifie si un double a été fait avec les dés)|Données de 'gameActionRes'|

<!-- @vuese:Game:methods:end -->


## Data

<!-- @vuese:Game:data:start -->
|Name|Type|Description|Default|
|---|---|---|---|
|gameMounted|`Boolean`|Indique si le jeu a été 'mounted' (écran chargé) par Vue|false|
|CST|`Object`|Constantes du jeu (pions, couleurs des joueurs, etc.)|-|
|loading|`Boolean`|Affiche l'écran de chargement|true|
|loggedUser|`Member`|Utilisateur connecté (chargé depuis le store Vuex)|-|
|socket|`Call`|socket client utilisé pour les communications|-|
|players|`Array`|Liste des joueurs dans la partie (envoyée par le serveur)|-|
|cells|`Array`|Liste des cellules du plateau de jeu (envoyée par le serveur)|-|
|properties|`Array`|Liste des propriétés du plateau de jeu (envoyée par le serveur)|-|
|gameEndTime|`Null`|Timestamp de fin de la partie (envoyé par le serveur)|-|
|gameRemainingTime|`Null`|Temps restant avant la fin de la partie|-|
|gameTimer|`Null`|Timer (contenant un setInterval()) de la partie|-|
|turnNotifications|`Array`|Notifications du tour en cours (apparaissent sur la droite de l'écran)|-|
|currentPlayerID|`Number`|Identifiant du joueur courant|0|
|useBonusJail|`Boolean`|Flag indiquant si l'on souhaite utiliser notre carte bonus "Sortir du parlement" lors du prochain lancé de dés|false|
|offers|`Array`|Liste des offres d'achat reçues de la part d'autres joueurs|-|
|bids|`Array`|Liste d'enchères en cours|-|
|audio|`Object`|Ressources audio du jeu|-|
|endGame|`Boolean`|Indique si la partie est terminée (affiche l'écran de fin si true)|false|

<!-- @vuese:Game:data:end -->


