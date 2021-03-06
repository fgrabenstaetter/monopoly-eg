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
            duration: int, // 30 | 60 | null (temps de partie par défaut en minutes ou null pour illimité) par défault à null
            targetUsersNb: int // par défaut à 2
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

- **Accepter/Refuser une demande d'invitation lobby d'un ami**
    * **Requête:** lobbyInvitationActionReq
        * *Données:*
        ```javascript
        {
            invitationID: int
        }
         ```
    * **Réponse:** lobbyInvitationActionRes
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
            duration: int, // 30 | 60 | null (temps de partie par défaut en minutes ou null pour illimité)
            users: [
                // premier user = host
                {
                    id: int,
                    nickname: string,
                    avatar: string
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
            id: int,
            nickname: string,
            avatar: string
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

- **Changer la durée de la partie de jeu**
    > Hôte uniquement

    * **Requête:** lobbyChangeDurationReq
        * *Données:*
        ```javascript
        {
            newDuration: int // 30 | 60 | null (temps max d'une partie en minutes ou null si illimité)
        }
        ```

    * **Réponse:** lobbyChangeDurationRes
        * *Données:*
        ```javascript
        {
            error: int,
            status: string
        }
        ```

- **La durée de la partie de jeu a été changée**
    > Reçu par tous les joueurs

    * **Réponse:** lobbyDurationChangedRes
    ```javascript
    {
        newDuration: int // 30 | 60 | null (temps max d'une partie en minutes ou null si illimité)
    }
    ```

- **Recevoir un message dans le chat**
    * **Réponse:** lobbyChatReceiveRes
        * *Données:*
        ```javascript
        {
            content: string, // texte
            createdTime: timestamp,
            senderUserID: int // ou -1 => message du serveur
        }
        ```

- **Démarrer la recherche de partie (=> Matchmaking)**
    > Rechercher une partie avec les joueurs présents dans le lobby

    * **Requête:** lobbyPlayReq
        * *Données:*
        ```javascript
         null
         ```

    * **Réponse:** lobbyPlayRes
        > Si succès, envoyé à tout le monde, sinon (erreur) envoyée seulement à l'émetteur
        * *Données:*
        ```javascript
        {
            error: int,
            status: string
        }
        ```

- **Annuler la recherche de partie (retirer du Matchmaking)**
    > Annuler la recherche de partie. La réponse peut être envoyée sans requête préalable si un joueur quitte le lobby durant la recherche

    * **Requête:** lobbyCancelPlayReq
        * *Données:*
        ```javascript
         null
         ```

    * **Réponse:** lobbyCancelPlayRes
        > Si succès, envoyé à tout le monde, sinon (erreur) envoyée seulement à l'émetteur
        * *Données:*
        ```javascript
        {
            error: int,
            status: string
        }
        ```

* **Une partie a été trouvée => GO**
    > Lorsque reçu, rediriger vers /game pour entrer dans le jeu

    * **Réponse:** lobbyGameFoundRes
        * *Données:*
        ```javascript
        null
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
                    nickname: string,
                    avatar: string
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
            nickname: string,
            avatar: string
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

### --- Divers
- **Mettre à jour son profil**
    > Mettre à jour pseudo, adresse email et mot de passe (optionnel)

    * **Requête:** lobbyUpdateProfileReq
        * *Données:*
        ```javascript
        {
            nickname: string,
            email: string,
            password: string // peut être vide
        }
        ```

    * **Réponse:** lobbyUpdateProfileRes
        * *Données:*
        ```javascript
        {
            error: int,
            status: string,
            user: UserSchema // Toutes les données de l'utilisateur, uniquement si error = 0 (pas d'erreur)
        }
        ```

    * **Réponse:** lobbyUpdateAvatarRes - Uniquement envoyé si upload d'avatar
        * *Données:*
        ```javascript
        {
            error: int,
            status: string
        }
        ```

- **Mise à jour du pseudo d'un joueur**
    > Si un joueur met son profil à jour et change son pseudo, il doit être mis à jour chez tout le monde

    * **Réponse:** lobbyUserNicknameUpdatedRes
        * *Données:*
        ```javascript
        {
            error: int,
            status: string,
            user: UserSchema // Toutes les données de l'utilisateur, uniquement si error = 0 (pas d'erreur)
        }
        ```

- **Mise à jour de l'avatar d'un joueur**
    > Si un joueur met à jour son avatar, il doit être mis à jour chez tout le monde

    * **Réponse:** lobbyUserAvatarUpdatedRes
        * *Données:*
        ```javascript
        {
            id: string, // id de l'utilisateur qui a mis à jour son avatar
            path: string // nouveau path de l'image à partir de la racine du serveur
        }
        ```

- **Recevoir la liste de tous les succès**

    * **Réponse:** playerSuccessRes
        * *Données:*
        ```javascript
        {
            success: [ {
                description: string,
                difficulty: int, // 1: facile, 2: normal, 3: difficile
                exp: int,
                completed: bool
            }, ... ]
        }
        ```

## Game

### --- Début, fin, déconnexion et reconnexion

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
            gameEndTime: timestamp, // timestamp de fin de partie en ms ou null si illimité
            duration: int, 30 | 60 | null, // durée max en minutes ou null si illimité
            playersMoney: int, // argent initial de chaque joueur
            bankMoney: int, // argent initial de la banque
            moneyFromStart: int, // argent qu'on gagne en passant à la case départ
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
                    type: string, // goprison | property | chance | community | tax | other (parc ou début)
                    propertyID: int | null, // null ou ID de propriété si type == property
                    taxID: int | null, // null ou ID de la taxe si type === tax
                }, ...
            ],
            properties: [ // appartiennent toutes à la banque au début
                {
                    id: int,
                    type: string, // street | trainStation | publicCompany
                    name: string,
                    description: string,
                    // + autres champs selon type (voir ci-dessous)
                }, ...
            ],
            taxes: [
                {
                    id: int,
                    description: string,
                    money: int // argent à perdre lorsque on tombe sur cette taxe
                }, ...
            ]
        }

        ```
        Les champs supplémentaires dans *properties* sont:
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
                house: [ maison1 (int), maison2 (int), maison3 (int), maison4 (int) ],
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
            price: int
        }
        ```

- **Un joueur s'est déconnecté**
    > Automatiquement émit lorsqu'un joueur est déconnecté => tous ses tours seront passés

    * **Réponse:** gamePlayerDisconnectedRes
        * *Données:*
        ```javascript
        {
            playerID: int
        }
        ```

- **Un joueur s'est reconnecté**
    > Automatiquement émit à tous les joueurs SAUF celui qui s'est reconnecté

    * **Réponse:** gamePlayerReconnectedRes
        * *Données:*
        ```javascript
        {
            playerID: int
        }
        ```

- **Données de reconnexion**
    > Envoyé au joueur qui s'est reconnecté uniquement

    * **Réponse:** gameReconnectionRes
        * *Données:*
        ```javascript
        {
            gameEndTime: timestamp, // timestamp de fin de partie en ms ou null si illimité
            duration: int, 30 | 60 | null, // durée max en minutes ou null si illimité
            bankMoney: int, // argent initial de la banque
            chatMessages: array, // liste des messages de chat (chaque élément = même format que gameChatReceiveRes
            offers: array, // chaque élément: idem gameOfferReceiveRes
            bids: array, // chaque élément: idem gameBidRes
            moneyFromStart: int, // argent qu'on gagne en passant à la case départ
            players: [
                {
                    nickname: string,
                    id: int,
                    pawn: int,
                    money: int,
                    properties: array, // liste d'ID de ses propriétés
                    nbJailEscapeCards: int,
                    cellPos: int, // de 0 à 39
                    connected: bool,
                    failure: bool,
                    hasLeft: bool,
                    isInJail: int | false // tour de prison du joueur ou false si pas en prison
                }, ...
            ],
            cells: [], // voir gameStartedRes
            properties: [] // voir gameStartedRes et ligne ci-dessous (+ champ isMortgaged pour chaque propriété)
            // ATTENTION: si propriété == Street => l'objet contient aussi level (int de 0 à 5)
        }
        ```

- **Fin du jeu**
    > Envoyé à tous les joueurs lorsque un seul joueur n'est pas en faillite => il a gagné. Lorsque reçu, ne plus envoyer aucune requête (et rediriger sous peu le client vers une nouvelle page ?)

    * **Réponse:** gameEndRes
        * *Données:*
        ```javascript
        {
            type: string, // 'failure' si dernier joueur qui n'a pas fait faillite ou 'timeout' si le timeout de partie a expiré et que c'est le joueur qui possède la plus grande valeur
            winnerID: int, // ID joueur qui a gagné
            ranking: [] // tableau trié dans l'ordre croissant de victoire par ID => 1er = indice 0 / 2e indice 1 ... etc
            duration: timestamp // durée totale du jeu en ms
        }
        ```

- **Quitter la partie (ragequit)**
    > À envoyer pour quitter le jeu si on est un lâche (sans être reconnecté automatiquement)

    * **Requête:** gamePlayerLeavingReq
        * *Données:*
        ```javascript
        {
            null
        }
        ```

    * **Réponse:** gamePlayerLeavingRes
        * *Données:*
        ```javascript
        {
            error: int,
            status: string
        }
        ```

* **Un joueur a quitté la partie**

    * **Réponse:** gamePlayerHasLeftRes
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
            turnEndTime: timestamp, // timestamp de fin forcée du tour (ms)
            playerID: int,
            canRollDiceAgain: bool // uniquement utile lors de la reconnexion
        }
        ```

- **Lancer les dés**
    > Un joueur peut parfois lancer les dés plusieurs fois par tour, ex. double valeur aux dés

    * **Requête:** gameRollDiceReq
        * *Données:*
        ```javascript
        {
            useExitJailCard: bool // true si le joueur possède une carte sortie de prison, qu'il est en prison, et qu'il souhaite l'utiliser, sinon false (si paramètre manquant => false)
        }
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
        * *Données:*
        ```javascript
        {
            dicesRes: [ int, int ],
            playerID: int,
            cellPosTmp: int | null, // position intermédiaire si tombé sur une carte qui induit un déplacement (cellPosTmp = position après lancé des dés, cellPos = position finale comprenant le déplacement induit par la carte) OU null si pas de déplacement induit par une carte
            cellPos: int,
            turnEndTime: timestamp, // timestamp de fin de tour (ms)
            actionMessage: string, // message lié à l'action de tour
            asyncRequestType: string ou null, // null | 'canBuy' | 'shouldMortgage'
            asyncRequestArgs: array ou null, // selon asyncRequestType (voir plus bas)
            updateMoney:
            [
                // peut être vide (dynamique)
                {playerID: string, money: int}, // nouveau solde
                ...
            ],
            extra: {
                // contient 0, 1 ou plusieurs de ces champs (tester existence !)
                nbJailEscapeCards: int, // nb de cartes sortie de prison si il a changé
                goJail: true, // reçu uniquement lorsque on entre en prison et doit y rester
                gainMoneyFromStart: true, // reçu uniquement quand le joueur a gagné l'argent de la case départ
                newCard: {
                    type: string, // chance | community
                    description: string
                }
            }
        }
        ```

        **asyncRequestArgs** ci-dessus peut être:
        ```javascript
        // Si asyncRequestType = canBuy
            [price]
        // Si asyncRequestType = shouldMortgage
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

- **Améliorer une/des propriété(s)**
    > Envoyer la requête uniquement si on veux améliorer une/des propriété(s) (maison(s) ou hotel)

    * **Requête:** gamePropertyUpgradeReq
        * *Données:*
        ```javascript
        {
            list: [ { propertyID: int, level: int }, ... ]
            // level: 1: une maison, 2: deux maisons, 3: trois maisons, 4: quatre maisons, 5: un hôtel
        }
        ```

    * **Réponse:** gamePropertyUpgradeRes
        * *Données:*
        ```javascript
        {
            error: int,
            status: string
        }
        ```

* **Un joueur a amélioré une/des propriété(s)**
    > Reçu par tous les joueurs lorsqu'un joueur a amélioré une/des propriété(s)

    * **Réponse:** gamePropertyUpgradedRes
        * *Données:*
        ```javascript
        {
            playerID: int,
            playerMoney: int, // nouveau solde
            bankMoney: int,
            list: [ { propertyID: int, level: int } ] // voir gamePropertyUpgradeReq
        }
        ```

* **Hypothéquer une/des propriété(s)**
    > Choisir quelles propriétés hypothéquer pour pouvoir payer un loyer par exemple (si forcé) ou par simple volonté, Dans le cas ou l'hypothèque est forcée (recevoir 'shouldMortgage' en asyncRequestType de 'gameActionRes'), ignorer cet événement enclenche une vente automatique.

    * **Requête:** gamePropertyMortgageReq
        * *Données:*
        ```javascript
        {
            properties: [int, ...] // liste des ID de propriétés à hypothéquer
        }
        ```

    * **Réponse:** gamePropertyMortgageRes
        * *Données:*
        ```javascript
        {
            error: int,
            status: string
        }
        ```

* **Un joueur a hypothéqué une/des propriété(s)**
    > Envoyé à tous les joueurs lorsque un joueur a hypothéqué une/des propriété(s)

    * **Réponse:** gamePropertyMortgagedRes
        * *Données:*
        ```javascript
        {
            properties: [int, ...], // liste des ID des propriétés hypothéquées
            playerID: int,
            playerMoney: int, // nouveau solde
            bankMoney: int,
            auto: bool // true seulement si l'hypothèque était forcée et le serveur a du hypothéquer automatiquement, false sinon
        }
        ```

* **Annuler l'hypothécation d'une propriété**

    * **Requête:** gamePropertyUnmortgageReq
        * *Données:*
        ```javascript
        {
            propertyID: int
        }
        ```

    * **Réponse:** gamePropertyUnmortgageRes
        * *Données:*
        ```javascript
        {
            error: int,
            status: string
        }
        ```

* **Un joueur a annuler une de ses hypothèques**

    * **Réponse:** gamePropertyUnmortgagedRes
        * *Données:*
        ```javascript
        {
            playerID: int,
            propertyID: int,
            playerMoney: int,
            bankMoney: int
        }
        ```

* **Résultat d'une hypothèque forcée d'un joueur**
    > Envoyé à tous les joueurs lorsque l'hypothèque forcée d'un joueur a terminée

    * **Réponse:** gameForcedMortgageRes
        * *Données:*
        ```javascript
        {
            playerID: int,
            playerMoney: int, // nouveau solde
            bankMoney: int,
            message: string, // message lié à la fin de l'hypothèque forcée (peut êter succès ou échec = faillite)
            rentalOwner: { // seulement si hypothèque forcée pour PAYER UN LOYER, sinon null (taxe, carte par ex)
                id: int,
                money: int // son nouveau solde
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
            playerID: int, // ou -1 => message du serveur
            text: string,
            createdTime: timestamp
        }
        ```

- **Faire une proposition d'offre (acheter une propriété / carte prison à un joueur)**

    * **Requête:** gameOfferSendReq
        * *Données:*
        ```javascript
        {
            receiverID: int, // ID joueur à qui on souhaite acheter
            propertyID: int, // ID de la propriété qu'on veux acheter ou -1 pour carte sortie de prison
            price: int, // montant qu'on lui propose pour l'achat
        }
        ```

    * **Réponse:** gameOfferSendRes
        * *Données:*
        ```javascript
        {
            error: int,
            status: string
        }
        ```

- **Réception d'une proposition d'offre**

    * **Réponse:** gameOfferReceiveRes
        > Tout le monde reçoit cette réponse, mais seul le joueur d'ID receiverID pourra l'accepter
        * *Données:*
        ```javascript
        {
            offerID: int, // ID de l'offre
            makerID: int, // ID joueur qui a créer l'offre
            receiverID: int, // ID joueur auquel on souhaite acheter
            propertyID: int, // ID de la propriété que le créateur de l'offre souhaite acheter (appartient au joueur d'ID receiverID)
            price: int, // montant proposé pour l'achat
        }
        ```

- **Accepter/Refuser une proposition d'offre**

    * **Requête:** gameOfferActionReq
        * *Données:*
        ```javascript
        {
            offerID: int,
            accept: bool // true => accepter, false => refuser
        }
         ```

    * **Réponse:** gameOfferActionRes
        * *Données:*
        ```javascript
        {
            error: int,
            status: string
        }
        ```

- **Une offre est terminée**
    > Soit a expirée, soit a été remplie. Si propertyID vaut -1, il s'agit d'un achat de carte sortie de prison il faut alors ajouter (au niveau de l'affichage) une carte au création (maker), et en retirer une au récepteur (receiver) de l'offre qui l'a accepté

    * **Réponse:** gameOfferFinishedRes
        * *Données:*
        ```javascript
        {
            receiverID: int,
            offerID: int,
            price: int,
            propertyID: int, // ID de la propriété ou -1 pour carte sortie de prison
            makerID: int, // ID player du créateur de l'offre => celui qui gagne la propriété / carte prison
            accepted: bool
        }
        ```

### --- Enchères, hypothèques et divers

- **Une enchère a démarrée/changée**
    > Peut être reçue plusieurs fois (si sur-enchérissement) pour mettre à jour le prix (alors même bidID)

    * **Réponse:** gameBidRes
        * *Données:*
        ```javascript
        {
            bidID: int,
            propertyID: int,
            propertyOwnerID: int, // null si le terrain n'a pas de propriétaire (= banque, enchère auto)
            playerID: int, // null la première fois
            text: string,
            price: int
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

- **Fin d'une enchère**
    * **Réponse:** gameBidEndedRes
        * *Données:*
        ```javascript
        {
            bidID: int,
            playerID: int // null si expiré sans surenchérisseur (sinon ID du vainqueur)
            propertyID: int // null si expiré sans surenchérisseur (s
            propertyOldOwnerID: int, // ou null si pas d'ancien propriétaire (= banque, enchère auto)
            propertyOldOwnerMoney: int | null, // uniquement si enchère manuelle sinon null
            price: int,
            bankMoney: int,
            playerMoney: int, // null si aucun joueur ne surrenchérit lors d'une enchère générée automatiquement (non achat d'une propriété)
        }
        ```
- **Démarée une enchère manuelle**
    > = Démarrée une enchère pour vendre une de ses propriétés

    * **Requête:** gameManualBidReq
        * *Données:*
        ```javascript
        {
            propertyID: int,
            initialPrice: int
        }
        ```

    * **Réponse:** gameManualBidRes
        * *Données:*
        ```javascript
        {
            error: int,
            status: string
        }
        ```

- **Un succès vient d'être complété**
    > Reçu lorsque un succès a été complété (= validé)

    * **Réponse:** gameSuccessCompletedRes
        * *Données:*
        ```javascript
        {
            description: string,
            difficulty: int, // 1 facile 2 normal 3 difficile
            exp: int,
            playerLevel: int,
            playerExp: int
        }
        ```
