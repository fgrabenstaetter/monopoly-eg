# Monopoly EG

Projet intégrateur de S6 de l'UFR Math Info

## Architecture du dépôt
- / : racine
- /server : code du serveur
- /client : code du client (uniquement le client léger pour l'instant, càd le client web)
- /misc : miscellaneous (= "divers" en français)
- /misc/tests : dossier réservé aux tests
- /misc/tests/blender : dossier réservé aux tests Blender (*i.e.* modèles, objets, scènes, screenshots, etc.)
- /misc/tests/threejs : dossier prévu pour vos tests Three JS (*i.e.* dossiers de tests avec HTML, CSS, JS, etc.)

## Auteurs

Team EG

- Benjamin FREELING <benjaminfreeling@gmail.com>
- Boris FLESCH <boris.flesch@gmail.com>
- Côme FRAPPÉ—VIALATOUX <cfrappevialatoux@gmail.com>
- Danyl EL-KABIR  <elkabirdanyl@gmail.com>
- Dorin GUTU <doringutsu@gmail.com>
- Edouard GU <gu.edouard67@gmail.com>
- Florian FALKNER <falknerflorian@hotmail.fr>
- François GRABENSTAETTER <francoisgrabenstaetter@gmail.com>
- Matthias FOYER <matthias.foyer@gmail.com>
- Xavier FARGEAS <xavier.fargeas@gmail.com>

## Utilisation

### Serveur

(Testé avec nodejs LTS 12.14.1)

0. Avoir installé Node LTS 12.14.1 et MongoDB 4.2.3 sur sa machine (et avoir le service MongoDB en cours d'exécution)

1. Changer de répertoire

```bash
cd server/
```

2. Installer tous les modules via NPM

```bash
npm install
```

3. Démarrer le serveur en mode développement/production

```bash
npm start # mode développement
npm start production # mode production
```

4. Lancer les tests unitaires
```bash
npm test
```
