# Events socket.io + format des données

## Introduction

**Req = requête client -> serveur**
> Les données sont à passer en argument lors de l'envoi via socket

**Res = réponse serveur -> client (pas forcément après un Req)**
> Les données sont reçus en argument de la fonction callback de l'event socket

- Pour avoir accès à la connexion socket.io, être connecté (session express.js)
- Socket => gérer le lobby, matchmaking, parties de jeu
- Dans une réponse, **error** est égal à **0** lorsqu'il s'agit d'un succès, sinon contient un code d'erreur **> 0**. Tous les types d'erreurs et messages correspondants à un code d'erreur sont définis dans le fichier **constants.js**.

## Lobby

- **Créer un lobby pour pouvoir jouer avec des amis**
    * **Requête:** lobbyCreateReq
        * *Données:*
        ```javascript
        null
        ```

    * **Réponse:** lobbyCreateRes
        * Ne peut pas échouer
        * *Données:*
        ```javascript
        null
        ```

- **Inviter un ami dans le lobby**
    * **Requête:** lobbyInviteFriendReq
        * *Données:*
        ```javascript
        {
            "friendPseudo": string
        }
        ```

    * **Réponse:** lobbyInviteFriendRes
        * *Données:*
        ```javascript
        {
            "error": int
        }
        ```

- **Invitation reçue d'un ami pour rejoindre son lobby**
    * **Réponse:** lobbyFriendInvitationRes
        * *Données:*
        ```javascript
        {
            "invitationID": int,
            "senderFriendPseudo": string,
            "nbPlayersInLobby": string
        }
         ```

- **Accepter une demande d'invitation lobby d'un ami**
    * **Requête:** lobbyFriendAcceptInvitationReq
        * *Données:*
        ```javascript
        {
            "invitationID": int
        }
         ```
    * **Réponse:** lobbyFriendAcceptInvitationRes
        * *Données:*
        ```javascript
        {
            "error": int
        }
        ```

- **Kicker un joueur du lobby**
    * **Requête:** lobbyKickReq
        * *Données:*
        ```javascript
        {
            "playerToKickPseudo": string
        }
        ```

- **Envoyer/Recevoir un message dans le chat du lobby**
    * **Requête:** lobbyChatMessageReq
        * Envoyer un message
        * *Données:*
        ```javascript
        {
            "text": string
        }
        ```
    * **Réponse:** lobbyChatMessageRes
        * *Données:*
        ```javascript
        {
            "senderPseudo": string,
            "text": string,
            "createdTime": timestamp
        }
        ```

- **Démarrer la partie (=> Matchmaking)**
    > Rechercher une partie avec les joueurs présents dans le lobby

    * **Requête:** lobbyPlayReq
        * *Données:*
        ```javascript
        {
            "pseudos": array of string,
            "pions": array of int
        }
         ```
    * **Réponse:** lobbyPlayRes
        * *Données:*
        ```javascript
        {
            "error": int
        }
        ```

## Game

- **Démarrage - infos générales du jeu**
    > Nom des joueurs, pions, cases du plateau, ...

    * **Réponse:** gameStartedRes
        * *Données:*
        ```javascript
        {
            "pseudos": array of string,
            "pions": array of int,
            "gameTimeout": timestamp, // date de fin de partie forcée
            "turnMaxDuration": int // temps maximum d'un tour (secondes)
        }
        ```

- **Doit jouer (lancer les dés)**
    > Signale le nom du joueur qui doit jouer = lancer les dés

    * **Réponse:** gameTurnRes
        * *Données:*
        ```javascript
        {
            "pseudo": string
        }
        ```

- **Action de tour / Lancer les dés**
    > Uniquement le joueur qui lance les dés envoie la Req, mais tous les joueurs recoivent la Res, un joueur peut lancer les dés plusieurs fois par tour, ex. double valeur aux dés

    * **Requête:** gameRollDiceReq
        * *Données:*
        ```javascript
        null
         ```

    * **Réponse:** gameRollDiceRes
        > Contient le résultat des dés ET toutes les infos à mettre à jour (action de jeu)

        * *"actionType"* peut signifier (rien, peutAcheter, doitPayerLoyer, peutConstruireMaison, peutConstruireHotel)
        * *Données:*
        ```javascript
        {
            "playerPseudo": string,
            "dicesRes": [int, int],
            "cellPos": int,
            "gameMessage": string, // message de l'action
            "actionType:" int,
            "updateMoney":
            [
                // peut être vide (dynamique)
                "pseudo": int, // nouveau solde
                ...
            ],
            "extra":
            [
                // contient 0 ou 1 seul de ces éléments
                "newCardJailEscape" // nouvelle carte prison
            ]
        }
        ```

- **Terminer son tour**
    > Terminer son tour manuellement (sinon timeout automatique)

    * **Requête:** gameTurnEndReq
        * *Données:*
        ```javascript
        null
        ```

    * **Réponse:** gameTurnEndRes
        * *Données:*
        ```javascript
        null
        ```

- **Envoyer/Recevoir un message dans le chat du jeu**

    * **Requête:** gameChatMessageReq
        * *Données:*
        ```javascript
        {
            "text": string
        }
        ```

    * **Réponse:** gameChatMessageRes
        > Pas forcément un message text brut, peut être par exemple une proposition de vente

        * *Données:*
        ```javascript
        {
            "messID": int,
            "type": int,
            "pseudoSrc": string,
            "pseudoDest": string | null,
            "text": string,
            "customData": selon type
        }
        ```

- **Faire une proposition d'offre**

    * **Requête:** gameOfferSendReq
        * *Données:*
        ```javascript
        {
            "type": int,
            "pseudoDst": string | null,
            "customData": selon type
        }
        ```

    * **Réponse:** gameOfferSendRes
        * *Données:*
        ```javascript
        null
        ```

- **Accepter une proposition d'offre**

    * **Requête:** gameOfferAcceptReq
        * *Données:*
        ```javascript
        {
            "offreID": int
        }
         ```

    * **Réponse:** gameOfferAcceptRes
        * *Données:*
        ```javascript
        {
            "error": int
        }
        ```

- **Une enchère a démarrée**

    * **Réponse:** gameBidRes
        * *Données:*
        ```javascript
        {
            "bidID": int,
            "playerPseudo": string,
            "text": string
        }
        ```

- **Surenchérir à une enchère**

    * **Requête:** gameOverbidReq
        * *Données:*
        ```javascript
        {
            "overbidID": int,
            "price": int
        }
         ```

    * **Réponse:** gameOverbidRes
        * *Données:*
        ```javascript
        {
            "error": int
        }
        ```

- **Hypothéquer une propriété**

    * **Requête:** gameMortageReq
        * *Données:*
        ```javascript
        {
            "propertyID": int
        }
        ```

- **Abandonner la partie**
    > Comportement automatiquement exécuté après un certain temps d'inactivité

    * **Requête:** gameQuitReq
        * *Données:*
        ```javascript
        null
        ```

    * **Réponse:** gameQuitRes
        > La réponse arrive chez tous les joueurs pour signaler qu'un joueur a abandonné

        * *Données:*
        ```javascript
        {
            "playerPseudo": string
        }
        ```

- **Une quête vient d'être accomplie**
    > Le client et le serveur doivent connaître toutes les quêtes selon leur ID

    * **Réponse:** gameQuestFinishedRes
        * *Données:*
        ```javascript
        {
            "questID": int
        }
        ```
