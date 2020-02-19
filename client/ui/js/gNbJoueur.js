document.getElementById('leftNbJ').addEventListener("click", leftNbJ);
document.getElementById('rightNbJ').addEventListener("click", rightNbJ);

/** Fonction qui decremente le nombre de joueur
*/
function leftNbJ() {
	let nb = parseFloat(document.getElementById('nbJoueurs').innerHTML);
	if (nb > 2) {
		nb--;
		document.getElementById('nbJoueurs').innerHTML = nb;
	}
}

/** Fonction qui incermente le nombre de joueur
*/
function rightNbJ() {
	let nb = parseFloat(document.getElementById('nbJoueurs').innerHTML);
	if (nb < 8) {
		nb++;
		document.getElementById('nbJoueurs').innerHTML = nb;
	}
}
