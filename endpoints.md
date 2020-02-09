# Liste des endpoints (XMLHttpRequest)

Dans une réponse, **error** vaut **0** lorsqu'il s'agit d'un succès, sinon un code d'erreur **> 0** (voir fichier **constants.js**)

- **Inscription:** /register
    * *Paramètres POST:*
    ```javascript
    "email": string,
    "pseudo": string,
    "password": string
    ```
    * *Réponse:*
    ```javascript
    "error": int
    ```

- **Connexion:** /login
    * *Paramètres POST:*
    ```javascript
    "pseudo": string,
    "password": string
    ```
    * *Réponse:*
    ```javascript
    "error": int
