# Monopoly EG

Projet Intégrateur S6 - UFR de Mathématiques et d'Informatique - Université de Strasbourg

## Architecture du dépôt

- /server : code serveur
- /client : code client

## Auteurs

Équipe EG

- Benjamin FREELING <benjaminfreeling@gmail.com> [Client 3D + Sockets]
- Boris FLESCH <boris.flesch@gmail.com> [Chef de projet]
- Côme FRAPPÉ—VIALATOUX <cfrappevialatoux@gmail.com> [Client 3D + Sockets]
- Danyl EL-KABIR  <elkabirdanyl@gmail.com> [Serveur]
- Dorin GUTU <doringutsu@gmail.com> [Serveur]
- Edouard GU <gu.edouard67@gmail.com> [Client IHM]
- Florian FALKNER <falknerflorian@hotmail.fr> [Client 3D + ThreeJS]
- François GRABENSTAETTER <francoisgrabenstaetter@gmail.com> [Serveur]
- Matthias FOYER <matthias.foyer@gmail.com> [Client IHM]
- Xavier FARGEAS <xavier.fargeas@gmail.com> [Client 3D + ThreeJS]

## Utilisation

### Serveur

**Pré-requis** : NodeJS installé et MongoDB installé + lancé
*Testé avec Nodejs LTS 12.16.3 et MongoDB 4.2.6*

Toutes les commandes suivantes nécessitent d'être exécutées dans le répertoire "server" : `cd server/`

#### Lancement du serveur

2. Installer tous les modules via NPM

   ```bash
   npm install
   ```

3. Démarrer le serveur en mode développement / production

   ```bash
   npm start # mode développement
   npm start production # mode production
   ```

#### Lancement des tests unitaires

```bash
npm test
```

#### Génération de la documentation

```bash
jsdoc *.js game/*.js models/*.js -d doc
```

### Client

**Pré-requis** : serveur lancé et Vue.js CLI installé

Toutes les commandes suivantes nécessitent d'être exécutées dans le répertoire "monopoly-eg" : `cd client/monopoly-eg/`

#### Lancement du serveur local

1. Installer tous les modules via NPM

   ```bash
   npm install
   ```

2. Démarrer le serveur local
*Remarque :* Les URLs du serveur connues par le client peuvent être modifiées dans /client/monopoly-eg/src/store/store.js (lignes 8 à 11). Par défaut, elles pointent vers le serveur en ligne https://egserv.singlequote.net.

   ```bash
   npm run serve
   ```

Le client est ensuite accessible à l'adresse par défaut : http://localhost:8080/

#### Build du client

**Client web**

```bash
npm run build # Destination : dists/
```

**Client lourd**

```bash
npm run electron:build # Destination : dist_electron/
```

#### Génération de la documentation

Vuese doit être installé globalement pour que la commande aboutisse

```bash
npm install -g vuese
vuese gen # génère la documentation
vuese serve --open # crée un serveur local + ouvre la documentation dans le navigateur
```

