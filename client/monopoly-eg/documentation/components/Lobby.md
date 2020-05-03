# Lobby

Ecran de lobby : profil du joueur, gestion des amis, paramètres de la partie, matchmaking, etc.

## Methods

<!-- @vuese:Lobby:methods:start -->
|Method|Description|Parameters|
|---|---|---|
|play|Clic sur le bouton "Jouer" : lance la partie (ou recherche une partie selon nos critères) OU annule la recherche de partie (selon l'état du bouton)|-|
|idToNick|Récupère le pseudo d'un joueur à partir de son ID|ID du joueur|
|leftNbJClick|Diminue le nombre de joueurs souhaités pour la partie (min : min(2, [nb joueurs déjà dans le lobby]))|-|
|rightNbJClick|Augmente le nombre de joueurs souhaités pour la partie (max : 8)|-|
|leftGameTimeClick|Diminue le temps souhaité pour la partie|-|
|rightGameTimeClick|Augmente le temps souhaité pour la partie|-|
|deleteLobbyInvitation|Supprime une invitation à rejoindre un lobby|ID de l'invitation à supprimer|
|acceptLobbyInvitation|Accepte une invitation à rejoindre un lobby (et la supprime de l'écran)|ID de l'invitation à accepter|
|rejectLobbyInvitation|Rejette une invitation à rejoindre un lobby (i.e. la supprime)|ID de l'invitation à rejeter|
|addFriend|Envoie le formulaire d'ajout d'ami au serveur|-|
|deleteFriendInvitation|Supprime une invitation d'ami|ID du joueur dont l'invitation en ami sera supprimée|
|acceptFriendInvitation|Accepte une invitation d'ami (et la supprime de l'affichage)|ID du joueur accepté en ami ; Pseudo du joueur accepté en ami|
|rejectFriendInvitation|Rejette une invitation d'ami (et la supprime de l'affichage)|ID du joueur refusé en ami ; Pseudo du joueur refusé en ami|
|inviteFriendInLobby|Envoie une invitation dans le lobby à un ami|ID du joueur que l'on souhaite inviter|
|kickPlayerFromLobby|Expulse un joueur de notre lobby|ID du joueur à expulser|
|imHost|Change les paramètres d'affichage (accessibilité des boutons) pour que l'on puisse - en tant qu'hôte - gérer le lobby|-|
|logout|Déconnexion du jeu (et redirection à l'écran d'accueil)|-|
|playMusic|Lance la musique de fond du lobby|-|
|setMusicLevel|Modifie le volume de la musique|Pourcentage du volume (entier de 0 à 100)|
|stopMusic|Coupe la musique de fond (en fondu)|-|
|loadSfx|Précharge tous les effets sonores (SFX) du jeu|-|
|setSfxLevel|Modifie le volume des effets sonores|Pourcentage du volume (entier de 0 à 100)|
|updateProfile|Envoie au serveur une requête de mise à jour du profil avec les informations du formulaire|-|
|processAvatar|Vérifie si l'avatar a été modifié dans la zone de fichiers du formulaire d'édition du profil|Evénement déclenché au changement de l'avatar|

<!-- @vuese:Lobby:methods:end -->


## Data

<!-- @vuese:Lobby:data:start -->
|Name|Type|Description|Default|
|---|---|---|---|
|loggedUser|`Member`|Utilisateur actuelement connecté (récupéré du store)|-|
|socket|`Null`|Socket utilisé pour les connexions|-|
|playBtn|`Object`|Bouton "Jouer" ({ text: string, loading: bool, disabled: bool })|-|
|addFriendForm|`Object`|Formulaire d'ajout d'ami ({ nickname: string })|-|
|editProfile|`Object`|Formulaire d'édition du profil ({ nickname: string, email: string, password: string })|-|
|siofu|`Null`|Gestionaire d'eupload d'image (pour l'avatar, cf. socketio-file-upload)|-|
|loading|`Boolean`|Indique si le lobby est en chargement (bool)|false|
|players|`Array`|Liste des joueurs dans le lobby ('Mon groupe') (liste d'objets 'player')|-|
|friends|`Array`|Liste d'amis|-|
|friendsInvitations|`Array`|Liste d'invitations d'amis|-|
|hostID|`Null`|ID de l'hôte|-|
|leftNbJ|`Boolean`|Flèche 'changement de joueurs' de gauche affichée (bool)|false|
|rightNbJ|`Boolean`|Flèche 'changement de joueurs' de droite affichée (bool)|false|
|leftGameTime|`Boolean`|Flèche 'changement de temps' de gauche affichée (bool)|false|
|rightGameTime|`Boolean`|Flèche 'changement de temps' de droite affichée (bool)|false|
|gameTime|`String`|Temps souhaité pour la partie ['30 min', '1 h', 'Illimité']|Illimité|
|nbPlayers|`Number`|Nombre de joueurs souhaités ('target') pour la partie (matchmaking)|0|
|lobbyInvitations|`Array`|Liste des invitations à rejoindre le lobby de quelqu'un d'autre|-|
|searchFriends|`String`|Recherche dans la liste d'amis|-|
|audio|`Object`|Ressources audio utilisées dans le Lobby|-|

<!-- @vuese:Lobby:data:end -->


## Watch

<!-- @vuese:Lobby:watch:start -->
|Name|Description|Parameters|
|---|---|---|
|searchFriends|Rafraîchit la liste d'amis en fonction de la recherche|-|

<!-- @vuese:Lobby:watch:end -->


