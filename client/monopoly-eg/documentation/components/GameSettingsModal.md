# GameSettingsModal

Modal (popup) de paramètres du jeu Important : le parent de ce composant doit posséder une connexion établie à un socket dans l'attribut data 'socket' que ce composant utilisera pour ses communications

## Props

<!-- @vuese:GameSettingsModal:props:start -->
|Name|Description|Type|Required|Default|
|---|---|---|---|---|
|env|Environnement dans lequel est utilisé le composant ('lobby' ou 'game')|`String`|`false`|lobby|
|loggedUser|Utilisateur actuellement connecté|`Object`|`true`|-|

<!-- @vuese:GameSettingsModal:props:end -->


## Methods

<!-- @vuese:GameSettingsModal:methods:start -->
|Method|Description|Parameters|
|---|---|---|
|updateUserSettings|Met à jour les paramètres utilisations : en local, à distance (via socket) et en temps réel (en jeu ou dans le lobby)|-|
|closeModal|Force la fermeture de la modal d'options|-|
|quitGame|Lors d'un clic sur le bouton "Quitter la partie", appelle la méthode "quitGame()" du parent si elle existe|-|

<!-- @vuese:GameSettingsModal:methods:end -->


## Data

<!-- @vuese:GameSettingsModal:data:start -->
|Name|Type|Description|Default|
|---|---|---|---|
|userSettings|`Object`|Paramètres utilisateur (prennent les valeurs des paramètres de loggedUser à l'initialisation)|-|

<!-- @vuese:GameSettingsModal:data:end -->


