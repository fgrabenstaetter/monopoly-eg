document.getElementById('leftNbJ').addEventListener("click", leftNbJ);
document.getElementById('rightNbJ').addEventListener("click", rightNbJ);

function leftNbJ() {
	let nb = parseFloat(document.getElementById('nbJoueurs').innerHTML);
	if (nb != 1) {
		nb--;
		document.getElementById('nbJoueurs').innerHTML = nb;
	}
}

function rightNbJ() {
	let nb = parseFloat(document.getElementById('nbJoueurs').innerHTML);
	if (nb != 8) {
		nb++;
		document.getElementById('nbJoueurs').innerHTML = nb;
	}
}
