# Liste des endpoints (XMLHttpRequest)

Dans une réponse, **error** vaut **0** lorsqu'il s'agit d'un succès, sinon un code d'erreur **> 0** (voir fichier **server/lib/errors.js**), et *status* correspond au message lié à cette erreur.


- **Inscription:** /register
    * *Paramètres POST:*
    ```javascript
    email: string,
    pseudo: string,
    password: string
    ```
    * *Réponse:*
    ```javascript
    error: int,
    status: string
    ```

- **Connexion:** /login
    * *Paramètres POST:*
    ```javascript
    pseudo: string,
    password: string
    ```
    * *Réponse:*
    ```javascript
    error: int,
    status: string,
    token: string, // jeton JWT
    id: int // user ID
    ```
