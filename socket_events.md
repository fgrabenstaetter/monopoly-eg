# Events socket.io + format des données

## Introduction

**Req = requête client -> serveur**
> Les données sont à passer en argument lors de l'envoi via socket

**Res = réponse serveur -> client (pas forcément après un Req)**
> Les données sont reçues en argument de la fonction callback de l'event socket

- Pour avoir accès à la connexion socket.io, être connecté (session express.js)
- Socket => gérer le lobby, matchmaking, parties de jeu
- Dans une réponse, **error** est égal à **0** lorsqu'il s'agit d'un succès, sinon contient un code d'erreur **> 0**. Tous les types d'erreurs sont définis dans le fichier **server/lib/errors.js**. **status** contient toujours le message lié à ce code d'erreur.

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
            friendNickname: string
        }
        ```

    * **Réponse:** lobbyInviteFriendRes
        * *Données:*
        ```javascript
        {
            error: int,
            status: string
        }
        ```

- **Invitation reçue d'un ami pour rejoindre son lobby**
    * **Réponse:** lobbyFriendInvitationRes
        * *Données:*
        ```javascript
        {
            invitationID: int,
            senderFriendNickname: string,
            nbPlayersInLobby: int
        }
         ```

- **Accepter une demande d'invitation lobby d'un ami**
    * **Requête:** lobbyFriendAcceptInvitationReq
        * *Données:*
        ```javascript
        {
            invitationID: int
        }
         ```
    * **Réponse:** lobbyFriendAcceptInvitationRes
        * *Données:*
        ```javascript
        {
            error: int,
            status: string
        }
        ```

- **Kicker un joueur du lobby**
    * **Requête:** lobbyKickReq
        * *Données:*
        ```javascript
        {
            playerToKickNickname: string
        }
        ```

    * **Réponse:** lobbyKickRes
        * *Données:*
        ```javascript
        {
            error: int,
            status: string
        }
        ```

- **Envoyer/Recevoir un message dans le chat du lobby**
    * **Requête:** lobbyChatMessageReq
        * Envoyer un message
        * *Données:*
        ```javascript
        {
            text: string
        }
        ```
    * **Réponse:** lobbyChatMessageRes
        * *Données:*
        ```javascript
        {
            error: int,
            status: string,
            senderNickname: string,
            text: string,
            createdTime: timestamp
        }
        ```

- **Démarrer la partie (=> Matchmaking)**
    > Rechercher une partie avec les joueurs présents dans le lobby

    * **Requête:** lobbyPlayReq
        * *Données:*
        ```javascript
        {
            nicknames: array of string,
            pions: array of int
            players: [
                {
                    nickname: string,
                    pawn: int
                }, ...
            ]
        }
         ```
    * **Réponse:** lobbyPlayRes
        > Lors d'un succès, est envoyé à tous les joueurs du lobby

        * *Données:*
        ```javascript
        {
            error: int,
            status: string
        }
        ```

- **Kické du lobby**
    > Le joueur a été kické du lobby courrant

    * **Réponse:** lobbyKickedRes
        * *Données:*
        ```javascript
        null
        ```

## Game

- **Démarrage - infos générales du jeu**
    > Nom des joueurs, pions, cases du plateau, ...

    * **Réponse:** gameStartedRes
        * *Données:*
        ```javascript
        {
            gameTimeout: timestamp, // timestamp de fin de partie (limite)
            turnMaxDuration: int, // temps maximum d'un tour (secondes)
            players: [
                {
                    nickname: string,
                    pawn: int
                }, ...
            ],
            cells: [
                {
                    id: int,
                    type: string, // property | parc | prison | card
                    typeObjID: int | null // null ou ID d'objet (property ou card) selon le type
                }, ...
            ],
            properties: [
                {
                    id: int,
                    type: string, // street | trainStation | publicCompany
                    name: string,
                    description: string,
                    customData: selon le type (voir ci-dessous)
                }, ...
            ],
            cards: [
                {
                    id: int,
                    type: string, // chance | commnunity
                    name: string,
                    description: string
                }, ...
            ]
        }

        ```
        **customData** dans *properties* peut être:
        ```javascript
        // si type = street
        {
            color: int,
            prices: {
                empty: int,
                house: int,
                hostel: int
            },
            rentalPrices: {
                empty: int,
                house: [ maison1 (int), maison2 (int), maison2 (int) ],
                hostel: int
            }

        }

        // si type = trainStation
        {
           price: int,
           rentalPrices: [ 1gare (int), 2gare (int), 3gare (int), 4gare (int) ]
        }

        // Si type = publicCompany
        {
            price: int,
            rentalPrice: int
        }
        ```

- **Doit jouer (lancer les dés)**
    > Signale le nom du joueur qui doit jouer = lancer les dés

    * **Réponse:** gameTurnRes
        * *Données:*
        ```javascript
        {
            nickname: string
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

        * *actionType* peut signifier (rien, peutAcheter, doitPayerLoyer, peutConstruireMaison, peutConstruireHotel)
        * *Données:*
        ```javascript
        {
            playerNickname: string,
            dicesRes: [ int, int ],
            cellID: int,
            gameMessage: string, // message de l'action
            actionType: int,
            updateMoney:
            [
                // peut être vide (dynamique)
                nickname: int, // nouveau solde
                ...
            ],
            extra: [
                {
                    // contient 0 ou 1 seul de ces éléments
                    newCardJailEscape: null, // nouvelle carte prison
                    newCard: int, // ID de la carte chance ou community
                }, ...
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
            text: string
        }
        ```

    * **Réponse:** gameChatMessageRes
        > Pas forcément un message text brut, peut aussi être une offre (d'achat)

        * *Données:*
        ```javascript
        {
            messID: int,
            type: string, // text | offer
            nickname: string,
            text: string,
            offer: { // ou null si type !== offer
                id, // ID de l'offre (utile pour l'accepter)
                receiver: string,
                property: int, // ID de la propriété
                amount: int,
                datetimeOffer: datetime
            }
        }
        ```

- **Faire une proposition d'offre**

    * **Requête:** gameOfferSendReq
        * *Données:*
        ```javascript
        {
            receiver: string,
            property: int, // ID de la propriété qu'on souhaite acheter
            amount: int
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
            offerID: int
        }
         ```

    * **Réponse:** gameOfferAcceptRes
        * *Données:*
        ```javascript
        {
            error: int,
            status: string
        }
        ```

- **Une enchère a démarrée/changée/terminée**
    > Peut être reçue plusieurs fois (si sur-enchérissement) pour update le prix (alors même bidID)
        Également reçue lorsque l'enchère est terminée (nom du vainqueur dans text et price = null)

    * **Réponse:** gameBidRes
        * *Données:*
        ```javascript
        {
            bidID: int,
            playerNickname: string,
            text: string,
            price: int | null // null si l'enchère a terminée
        }
        ```

- **Surenchérir à une enchère**

    * **Requête:** gameOverbidReq
        * *Données:*
        ```javascript
        {
            bidID: int,
            price: int
        }
         ```

    * **Réponse:** gameOverbidRes
        * *Données:*
        ```javascript
        {
            error: int,
            status: string
        }
        ```

- **Hypothéquer une propriété**

    * **Requête:** gameMortageReq
        * *Données:*
        ```javascript
        {
            propertyID: int
        }
        ```

    * **Réponse:** gameMortageRes
        * *Données:*
        ```javascript
        null
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
            playerNickname: string
        }
        ```

- **Une quête vient d'être accomplie**
    > Le client et le serveur doivent connaître toutes les quêtes selon leur ID

    * **Réponse:** gameQuestFinishedRes
        * *Données:*
        ```javascript
        {
            questID: int
        }
        ```
