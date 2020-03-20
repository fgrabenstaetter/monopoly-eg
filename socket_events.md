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
            friendID: int
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
            senderFriendID: int,
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
                    id: int,
                    pawn: int
                },
                ...
                // dernier user = le nouveau qui a reçu cet évènnement
            ],
            messages: [ // max 100 messages, les plus récents en dernier
                {
                    senderUserID: int,
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
            nickname: string,
            id: int,
            pawn: int
        }
        ```

- **Kicker un joueur du lobby**
    * **Requête:** lobbyKickReq
        * *Données:*
        ```javascript
        {
            userToKickID: int
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
            > L'ID de l'hôte est retourné (*hostID*) car il change après le départ de l'hôte (uniquement)

        ```javascript
        {
            userID: int,
            hostID: int
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
            userID: int,
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
            content: string, // texte
            createdTime: timestamp,
            senderUserID: int
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

- **Recevoir la liste d'amis**

    * **Requête:** lobbyFriendListReq
        * *Données:*
        ```javascript
        null
        ```

    * **Réponse:** lobbyFriendListRes
        * *Données:*
        ```javascript
        {
            friends: [
                {
                    id: int,
                    nickname: string
                }, ...
            ]
        }
        ```

- **Recevoir la liste d'amis demandés (mais pas encore acceptées/rejetées par le receveur)**

    * **Requête:** lobbyRequestedFriendListReq
        * *Données:*
        ```javascript
        null
        ```

    * **Réponse:** lobbyRequestedFriendListRes
        * *Données:*
        ```javascript
        {
            friends: [
                {
                    id: int,
                    nickname: string
                }, ...
            ]
        }
        ```

- **Recevoir la liste d'amis en attente (invitations que l'on a reçues mais pas encore acceptées/rejetées)**

    * **Requête:** lobbyPendingFriendListReq
        * *Données:*
        ```javascript
        null
        ```

    * **Réponse:** lobbyPendingFriendListRes
        * *Données:*
        ```javascript
        {
            friends: [
                {
                    id: int,
                    nickname: string
                }, ...
            ]
        }
        ```

- **Envoyer une requête d'ami à quelqu'un**
    * **Requête:** lobbyFriendInvitationSendReq
        * *Données:*
        ```javascript
        {
            nickname: string
        }
         ```
    * **Réponse:** lobbyFriendInvitationSendRes
        * *Données:*
        ```javascript
        {
            error: int,
            status: string
        }
        ```

- **Accepter/rejeter une requête d'ami reçue**
    * **Requête:** lobbyFriendInvitationActionReq
        * *Données:* action (0 = rejeter, 1 = accepter)
        ```javascript
        {
            action: 0/1
            nickname: string
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

- **Réception d'une demande d'ami**
    > Reçu lorsque quelqu'un nous a envoyé une demande d'ami

    * **Réponse:** lobbyFriendInvitationReceivedRes
        * *Données:*
        ```javascript
        {
            id: int,
            nickname: string
        }
        ```

- **Réception de la notification d'acceptation d'une demande d'ami**
    > Reçu lorsque quelqu'un a accepté une demande d'ami qu'on lui a envoyé

    * **Réponse:** lobbyFriendInvitationAcceptedRes
        * *Données:*
        ```javascript
        {
            id: int,
            nickname: string
        }
        ```


- **Supprimer un ami**
    > Supprimer un ami revient à le supprimer des deux côtés (plus aucun des deux n'a l'autre en ami)

    * **Requête:** lobbyFriendDeleteReq
        * *Données:*
        ```javascript
        {
            id: int
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
                    id: int,
                    pawn: int
                }, ...
            ],
            cells: [
                {
                    id: int,
                    type: string, // prison | property | chance | community | other
                    propertyID: int | null // null ou ID de propriété si type == property
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
            playerID: int
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
            turnEndTime: timestamp, // timestamp de fin forcé du tour
            playerID: int
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
            dicesRes: [ int, int ],
            playerID: int,
            cellPos: int,
            actionMessage: string, // message lié à l'action de tour
            asyncRequestType: string ou null, // null | 'canBuy' | 'canUpgrade' | 'shouldMortage'
            asyncRequestArgs: array ou null, // selon asyncRequestType (voir plus bas)
            updateMoney:
            [
                // peut être vide (dynamique)
                playerID: int, // nouveau solde
                ...
            ],
            extra: [
                {
                    // contient 0 ou 1 seul de ces éléments
                    nbJailEscapeCards: int, // nb de cartes sortie de prison si il a changé
                    newCard: {
                        type: string, // chance | community
                        name: string,
                        description: string
                    }
                }, ...
            ]
        }
        ```

        **asyncRequestArgs** ci-dessus peut être:
        ```javascript
        // Si asyncRequestType = canBuy
            [price]
        // Si asyncRequestType = canUpgrade
            [level1Price, level2Price, level3Price, level4price] // le prix d'amélioration CUMULÉ selon le niveau désiré, si niveau déjà aquis ou pas les moyens => vaut null
        // Si asyncRequestType = shouldMortage
            [totalMoneyToHave] // le montant de loyer à payer (donc à obtenir avec argent actuel + hypothèque de propriétés)
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

- **Un joueur est en faillite**

    * **Réponse:** gamePlayerFailureRes
        * *Données:*
        ```javascript
        {
            playerID: int,
            bankMoney: int
        }
        ```

### --- Actions de tour asynchrones

- Les événements suivants ne sont effectifs que lorsque la réponse d'une action de tour de jeu ('gameActionRes') l'indique (actionType)
- Toutes les requêtes suivantes doivent êtres envoyées avant la fin du tour de jeu si nécéssaire, sinon elles seront ignorées.
- Toutes les réponses suivantes sont envoyées à tous les joueurs si succès, sinon uniquement à l'émetteur en cas d'erreur avec les champs 'error' et 'status' renseignés.

- **Acheter une propriété**
    > Envoyer la requête uniquement si on veux acheter la propriété sur laquelle on se situe.

    * **Requête:** gamePropertyBuyReq
        * *Données:*
        ```javascript
        null
        ```

    * **Réponse:** gamePropertyBuyRes
        * *Données:*
        ```javascript
        {
            propertyID: int,
            playerID: int,
            playerMoney: int, // nouveau solde
            bankMoney: int
        }
        ```

- **Améliorer une propriété**
    > Envoyer la requête uniquement si on veux améliorer sa propriété (maison(s) ou hotel)

    * **Requête:** gamePropertyUpgradeReq
        * *Données:*
        ```javascript
        {
            level: int // niveau d'amélioration: 1: une maison, 2: deux maisons, 3: trois maisons, 4: un hôtel
        }
        ```

    * **Réponse:** gamePropertyUpgradeRes
        * *Données:*
        ```javascript
        {
            propertyID: int,
            level: int, // idem requête
            playerID: int,
            playerMoney: int // nouveau solde
        }
        ```

* **Hypothéquer une/des propriété(s) (si forcé)**
    > Choisir quelles propriétés hypothéquer pour pouvoir payer un loyer par exemple, lorsque le solde actuel n'est plus suffisant (= vente forcée). Ignorer cet événement pour faire une vente automatique.

    * **Requête:** gamePropertyForcedMortageReq
        * *Données:*
        ```javascript
        {
            properties: [int, ...] // liste des ID de propriétés à hypothéquer
        }
        ```

    * **Réponse:** gamePropertyForcedMortageRes
        * *Données:*
        ```javascript
        {
            properties: [int, ...], // liste des ID des propriétés hypothéquées
            playerID: int,
            playerMoney: int, // nouveau solde
            message: string, // message lié à l'hypothèque forcée
            rentalOwner: { // joueur qui a reçu l'argent (loyer)
                id: int,
                money: int // son nouveau montant
            }
        }
        ```

### --- Chat et offres

- **Envoyer un message dans le chat du jeu**

    * **Requête:** gameChatSendReq
        * *Données:*
        ```javascript
        {
            text: string
        }
        ```

    * **Réponse:** gameChatSendRes
        * *Données:*
        ```javascript
        {
            error: int,
            status: string
        }
        ```
- **Recevoir un message dans le chat du jeu**

    * **Réponse:** gameChatReceiveRes
        > Pas forcément un message text brut, peut aussi être une offre (d'achat)

        * *Données:*
        ```javascript
        {
            type: string, // text | offer
            playerID: int,
            text: string,
            createdTime: timestamp,
            offer: { // ou null si type !== offer
                id, // ID de l'offre (utile pour l'accepter)
                receiver: string,
                property: int, // ID de la propriété
                amount: int
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
            playerID: int,
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
