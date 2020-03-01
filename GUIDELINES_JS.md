# Guidelines de codage

- Déclarer les variables qui ne seront jamais modifiées avec **const** et les autres avec **let** (et non var)
- Utiliser des **simple quotes** et non des double quotes
- Utiliser le **camelCase** (premier mot non capitalisé, les autres oui) pour le nom des variables, fonctions et classes ainsi que pour le nom des fichiers. Pour les classes, capitaliser également le premier mot (**MyClass**)
- Essayer de ne pas dépasser les **120 caractères** par ligne (sauf si vraiment nécessaire)
- Écrire les commentaires, documentation, messages visibles par l'utilisateur ou debug ainsi que le nom des commits GIT en **français**, et tout le reste en **anglais**:
```javascript
const myName = 'John'; // je m'apelle John
let myAge = 20;
```
- Utiliser des tabulations à **4**
- Toujours insérer un **;** en fin d'instruction
- Lorsque possible, placer l'accolade ouvrante en **fin de ligne** après un espace, et l'accolade fermante sur une nouvelle ligne
```javascript
let colors = {
    first: 'red',
    second: 'green',
    third: 'blue'
};
```
- Toujours mettre des **espaces** autour des opérateurs et après les virgules
```javascript
let x = y + z;
let values = ['Volvo', 'Saab', 'Fiat'];
```
- Ne pas mettre d'**accolades** si un bloc ne comporte qu'une seule ligne (mais faire attention si rajout de ligne)
```javascript
if (true)
    console.log('c\'est vrai !');
else
    console.log('c\'est faux !');
```

- Insérer **un espace** avant la parenthèse ouvrante lors de la déclaration d'une fonction, d'une condition, d'une boucle, etc. mais pas lors de l'appel d'une fonction
```javascript
function myFunction (args) {
    while (true)
        console.log('spam');
}
```

- Utiliser la **notation de callback** de l'ES6 (ECMAScript 2015)
```javascript
function test (callback) {
    return callback(true);
}

// nouvelle notation
test( (res) => {
    if (res)
        return;
    else
        exit(1);
});

// ancienne notation
test( function (res) {
    ...
});
```
- Correctement utiliser les **opérateurs de comparaison** en fonction de la souplesse de typage souhaitée
```javascript
3 == '3' // true
3 === '3' // false
5 != '5' // false
5 !== '5' // true
null == undefined // true
null === undefined // false
```
- Pour vérifier si une condition est vraie ou fausse, utiliser la **syntaxe légère**
```javascript
if (!test) // test == false
    return false;

if (test) // test == true
    return true;
```
- Ajouter des **parenthèses** lorsque nécessaire uniquement
```javascript
if (a * b === c) // pas besoin de parenthèses autour de 'a * b'
    ...

if (a * (b % 3) === c) // besoin des parenthèses

if (a + b > 6 && !b) // correct
```
- Style des **conditions**
```javascript
if (a) {
    const res = 3 * 3;
    return res;
} else {
    console.error('valeur incorrecte pour a')
    return null;
}
```
- Préférer les **commentaires** sur ligne séparée pour améliorer la lisibilité
```javascript
// Préferer les commentaires de cette façon
const myVar = true;
const myVar2 = true; // et non comme ceci
```
- Lorsque nécessaire commenter les **arguments et la valeur de retour** d'une fonction
```javascript
/**
 * @param tab un tableau d'entiers
 * @param add un nombre à ajouter à chaque valeur
 * @return la taille du tableau tab
 */
function printAll (tab, add) {
    for (const e of tab)
        console.log(e + add);
    return tab.length;
}
```
