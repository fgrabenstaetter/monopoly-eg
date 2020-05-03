# ChatIO

Chat du jeu (utilisé dans le lobby et dans le jeu) Important : le parent de ce composant doit posséder une connexion établie à un socket dans l'attribut data 'socket' que ce composant utilisera pour ses communications

## Props

<!-- @vuese:ChatIO:props:start -->
|Name|Description|Type|Required|Default|
|---|---|---|---|---|
|env|Environnement dans lequel est utilisé le chat : 'lobby' ou 'game'|`String`|`false`|lobby|

<!-- @vuese:ChatIO:props:end -->


## Methods

<!-- @vuese:ChatIO:methods:start -->
|Method|Description|Parameters|
|---|---|---|
|initSocket|Initialisation des sockets (appelé par le parent lorsque la connexion au socket est établie)|-|
|postMsg|Envoi le contenu du nouveau message au serveur et vide la zone de saisie ('msg')|-|
|scrollToBottom|Descend au bas de la zone de chat (pour afficher les derniers messages reçus)|-|
|loadSfx|Charge les effets sonores du chat|-|

<!-- @vuese:ChatIO:methods:end -->


## Data

<!-- @vuese:ChatIO:data:start -->
|Name|Type|Description|Default|
|---|---|---|---|
|messages|`Array`|Messages du chat|-|

<!-- @vuese:ChatIO:data:end -->


