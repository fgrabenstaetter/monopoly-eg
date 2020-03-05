# Events socket.io + format des données

## Introduction

**Req = requête client -> serveur**
> Les données sont à passer en argument lors de l'envoi via socket

**Res = réponse serveur -> client (pas forcément après un Req)**
> Les données sont reçues en argument de la fonction callback de l'event socket

- Pour avoir accès à la connexion socket.io, être connecté (jeton JWT)
- Dans une réponse, **error** est égal à **0** lorsqu'il s'agit d'un succès, sinon contient un code d'erreur **> 0**. Tous les types d'erreurs sont définis dans le fichier **server/lib/errors.js**. **status** contient toujours le message lié à ce code d'erreur.

## Lobby

- **Le client est prêt à recevoir des messages socket**
    > À envoyer lorsque toutes les écoutes de message sockets ont été préparées du côté client (socket.on)

    * **Requête:** lobbyReadyReq
        * *Données:*
        ```javascript
        null
        ```

### --- Créer / Inviter / Rejoindre / Quitter

- **Le lobby a été créé**
    > Lors de la connexion au socket, un lobby est automatiquement créé pour vous avec des paramètres par défaut

    * **Réponse:** lobbyCreatedRes
        > Automatiquement envoyé après la connexion au socket

        * *Données:*
        ```javascript
        {
            targetUsersNb: int, // par défaut à 4
            pawn: int // par défaut à 0
        }
        ```

- **Inviter un ami dans le lobby**
    * **Requête:** lobbyInvitationReq
        * *Données:*
        ```javascript
        {
            friendNickname: string
        }
        ```

    * **Réponse:** lobbyInvitationRes
        * *Données:*
        ```javascript
        {
            error: int,
            status: string
        }
        ```

- **Invitation reçue d'un ami pour rejoindre son lobby**
    * **Réponse:** lobbyInvitationReceivedRes
        * *Données:*
        ```javascript
        {
            invitationID: int,
            senderFriendNickname: string,
            nbUsersInLobby: int
        }
         ```

- **Accepter une demande d'invitation lobby d'un ami**
    * **Requête:** lobbyInvitationAcceptReq
        * *Données:*
        ```javascript
        {
            invitationID: int
        }
         ```
    * **Réponse:** lobbyInvitationAcceptRes
        * *Données:*
        ```javascript
        {
            error: int,
            status: string
        }
        ```

- **Données initiales lors du rejoignage d'un lobby**
    > Reçu uniquement par le joueur qui vient de rejoindre un lobby (pour avoir les informations du lobby)

    * **Réponse:** lobbyJoinedRes
        * *Données:*
        ```javascript
        {
            targetUsersNb: int, // nombre de joueurs désirés pour la partie
            users: [
                // premier user = host
                {
                    nickname: string,
                    pawn: int
                },
                ...
                // dernier user = le nouveau qui a reçu cet évènnement
            ],
            messages: [ // max 100 messages, les plus récents en dernier
                {
                    sender: string,
                    content: string,
                    createdTime: timestamp
                },
                ...
            ]
        }
        ```

- **Un nouveau joueur a rejoint le lobby**
    * **Réponse:** lobbyUserJoinedRes
        * *Données:*
        ```javascript
        {
            nickname: string
            pawn: int
        }
        ```

- **Kicker un joueur du lobby**
    * **Requête:** lobbyKickReq
        * *Données:*
        ```javascript
        {
            userToKickNickname: string
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

- **Un joueur est parti / a été kické du lobby**
    * **Réponse:** lobbyUserLeftRes
        > Est envoyé à tout le monde dans le lobby. Si le user en question recoit aussi l'event, cela veut dire qu'il n'est pas parti mais qu'il a été kické du lobby (actualiser l'affichage)

        * *Données:*
            > Le pseudo de l'hôte est retourné (*host*) car il change après le départ de l'hôte (uniquement)

        ```javascript
        {
            nickname: string,
            host: string // host nickname
        }
        ```

### --- Paramètres / Chat

- **Modifier le nombre désiré de joueurs du lobby**
    > Uniquement par l'hôte, et attention: si le nombre désiré est plus petit que le nombre actuel de d'utilisateurs du lobby, ceux en trop seront automatiquement kickés

    * **Requête:** lobbyChangeTargetUsersNbReq
        * *Données:*
        ```javascript
        {
            nb: int // 2 - 8
        }
        ```

    * **Réponse:** lobbyChangeTargetUsersNbRes
        * *Données:*
        ```javascript
        {
            error: int,
            status: string
        }
        ```

- **Le nombre désiré de joueurs a changé**
    > Reçu par tous les utilisateurs dans le lobby

    * **Réponse:** lobbyTargetUsersNbChangedRes
        * *Données:*
        ```javascript
        {
            nb: int // 2 - 8
        }
        ```

- **Modifier son pion**
    * **Requête:** lobbyChangePawnReq
        * *Données:*
        ```javascript
        {
            pawn: int
        }
        ```

    * **Réponse:** lobbyChangePawnRes
        * *Données:*
        ```javascript
        {
            error: int,
            status: string
        }
        ```

- **Un joueur a changé son pion**
    > Reçu par tous les utilisateurs dans le lobby

    * **Réponse:** lobbyUserPawnChangedRes
        * *Données:*
        ```javascript
        {
            nickname: string, // pseudo de celui qui a changé son pion
            pawn: int
        }
        ```

- **Envoyer un message dans le chat du lobby**
    * **Requête:** lobbyChatSendReq
        * Envoyer un message
        * *Données:*
        ```javascript
        {
            text: string
        }
        ```

    * **Réponse:** lobbyChatSendRes
        * *Données:*
        ```javascript
        {
            error: int,
            status: string,
        }
        ```

- **Recevoir un message dans le chat**
    * **Réponse:** lobbyChatReceiveRes
        * *Données:*
        ```javascript
        {
            sender: string, // pseudo de l'émetteur
            content: string, // texte
            createdTime: timestamp
        }
        ```

- **Démarrer la partie (=> Matchmaking)**
    > Rechercher une partie avec les joueurs présents dans le lobby

    * **Requête:** lobbyPlayReq
        * *Données:*
        ```javascript
         null
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

### --- Amis

- **Envoyer une demande d'ami**

    * **Requête:** lobbyFriendInviteReq
        * *Données:*
        ```javascript
        {
            receiverNickname: string
        }
        ```

    * **Réponse:** lobbyFriendInviteRes
        * *Données:*
        ```javascript
        {
            error: int,
            status: string
        }
        ```

* **Acceptation / Déclinaison d'une demande d'ami (action du récepteur)**
    > Envoyé à l'émetteur de la requête après que son récepteur ai accepté ou décliné l'invitation

    * **Réponse:** lobbyFriendInvitationRes
        * *Données:*
        ```javascript
        {
            receiverNickname: string
            state: string // accepted | rejected
        }
        ```

* **Réception d'une demande d'ami**
    > Reçu lorsque quelqu'un nous a envoyé une demande d'ami

    * **Réponse:** lobbyFriendInvitationReceivedRes
        * *Données:*
        ```javascript
        {
            senderNickname: string
        }
        ```

* **Accepter / Décliner une demande d'ami**
    > Accepter ou décliner une demande d'ami qui a été reçue

    * **Requête:** lobbyFriendInvitationActionReq
        * *Données:*
        ```javascript
        {
            senderNickname: string,
            action: string // accept | reject
        }
        ```

    * **Réponse:** lobbyFriendInvitationActionRes
        * *Données:*
        ```javascript
        {
            error: int,
            status: string
        }
        ```

* **Supprimer un ami**
    > Supprimer un ami revient à le supprimer des deux côtés (plus aucun des deux n'a l'autre en ami)

    * **Requête:** lobbyFriendDeleteReq
        * *Données:*
        ```javascript
        {
            friendNickname: string
        }
        ```

    * **Réponse:** lobbyFriendDeleteRes
        * *Données:*
        ```javascript
        {
            error: int,
            status: string
        }
        ```

## Game

### --- Début et fin

- **Le client est prêt à recevoir des messages socket du jeu**
    > À envoyer lorsque toutes les écoutes de message sockets pour la partie ont été préparées du côté client (socket.on).
    Lorsque tous les joueurs ont envoyés cet évènnement, la partie est démarée.

    * **Requête:** gameReadyReq
        * *Données:*
        ```javascript
        null
        ```

- **Démarrage - infos générales du jeu**
    > Nom des joueurs, pions, cases du plateau, ...

    * **Réponse:** gameStartedRes
        * *Données:*
        ```javascript
        {
            gameEndTime: timestamp, // timestamp de fin de partie (limite)
            players: [
                {
                    nickname: string,
                    pawn: int
                }, ...
            ],
            cells: [
                {
                    id: int,
                    type: string, // begin | parc | property | parc | prison | card
                    propertyID: int | null // null ou ID de propriété
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
        // Si type = street
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

        // Si type = trainStation
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

- **Un joueur a quitté la partie**
    > Automatiquement émit lorsqu'un joueur quitte la partie

    * **Réponse:** gameQuitRes
        * *Données:*
        ```javascript
        {
            playerNickname: string
        }
        ```

### --- Tour de jeu

- **Doit jouer (lancer les dés)**
    > Signale le nom du joueur qui doit jouer = lancer les dés.
    Le décompte de timeout du tour commence ici.

    * **Réponse:** gameTurnRes
        * *Données:*
        ```javascript
        {
            nickname: string,
            turnEndTime: timestamp // timestamp de fin forcé du tour
        }
        ```

- **Lancer les dés**
    > Un joueur peut parfois lancer les dés plusieurs fois par tour, ex. double valeur aux dés

    * **Requête:** gameRollDiceReq
        * *Données:*
        ```javascript
        null
         ```
    * **Réponse:** gameRollDiceRes
        * *Données:*
        ```javascript
        {
            error: int,
            status: string
        }
        ```

- **Action de tour**
    > Contient le résultat des dés et toutes les infos à mettre à jour (action de jeu)

    * **Réponse:** gameActionRes
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
        > Envoyé automatiquement au joueur lorsque son timeout de tour a expiré

        * *Données:*
        ```javascript
        {
            error: int,
            status: string
        }
        ```

### --- Chat et offres

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

### --- Enchères, hypothèques et divers

- **Une enchère a démarrée/changée/terminée**
    > Peut être reçue plusieurs fois (si sur-enchérissement) pour mettre à jour le prix (alors même bidID)
        Également reçue lorsque l'enchère est terminée (nom du gagnant compris dans text et price = null)

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

- **Une quête vient d'être accomplie**
    > Le client et le serveur doivent connaître toutes les quêtes selon leur ID

    * **Réponse:** gameQuestFinishedRes
        * *Données:*
        ```javascript
        {
            questID: int
        }
        ```
