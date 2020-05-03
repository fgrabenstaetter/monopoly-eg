# ActionButton

Bouton d'action du jeu : sert à déclencher les actions comme "lancer les dés", "terminer mon tour", etc. (avec timer inclus)

## Methods

<!-- @vuese:ActionButton:methods:start -->
|Method|Description|Parameters|
|---|---|---|
|progressInitialize|Appel de la fonction d'initialisation du bouton|-|
|progressReset|Remet le bouton a un etat cliquable|hard determine s'il faut remettre le bouton à l'état initial ou pas|
|progressStart|Commence le minuteur du duree de sec secondes|sec la duree du minuteur|
|progressFinish|Termine le minuteur|-|
|progressIncrement|Incremente le minuteur d'une valeur val donne|val la valeur a incrementer|
|progressSetStateTerminer|Changement du label de chargement à 'TERMINER'|-|
|progressSetStateRelancer|Changement du label de chargement à 'RELANCER LES DES'|-|
|progressSet|Change la position de la barre du minuteur à une valeur val donne|val la valeur en pourcentage|
|progressPause|Met en pause le minuteur|-|
|progressResume|Reprise du minuteur|-|

<!-- @vuese:ActionButton:methods:end -->


