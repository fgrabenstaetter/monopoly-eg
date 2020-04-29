# ChatIO

Chat du jeu (utilisé dans le lobby et dans le jeu)

## Props

<!-- @vuese:ChatIO:props:start -->
|Name|Description|Type|Required|Default|
|---|---|---|---|---|
|socket|socket utilisé pour l'envoi de messages|`Object`|`true`|-|
|env|Environnement dans lequel est utilisé le chat : 'lobby' ou 'game'|`String`|`false`|lobby|

<!-- @vuese:ChatIO:props:end -->


## Methods

<!-- @vuese:ChatIO:methods:start -->
|Method|Description|Parameters|
|---|---|---|
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


