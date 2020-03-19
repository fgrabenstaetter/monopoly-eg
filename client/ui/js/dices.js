function sleep(ms){
	return new Promise(resolve => setTimeout(resolve, ms));
};

function random(min, max){
	min = Math.ceil(min);
	max = Math.floor(max);
	return Math.floor(Math.random() * (max - min +1)) + min;
};

async function showDices(){
	$(".dice-container").css("display", "block");
	await sleep(200);
	$(".dice-container").css("opacity", "1");
}

async function hideDices(){
	$(".dice-container").css("opacity", "0");
	await sleep(200);
	$(".dice-container").css("display", "none");
}

function rotateDice(dice, number){
	if (dice == 1) {
		switch (number) {
			case 1:
				$(".ingame-ui-container .dice-container #dice1").css("transform", "rotateY(360deg)");
				break;
			case 2:
				$(".ingame-ui-container .dice-container #dice1").css("transform", "rotateX(-90deg)");
				break;
			case 3:
				$(".ingame-ui-container .dice-container #dice1").css("transform", "rotateY(-90deg)");
				break;
			case 4:
				$(".ingame-ui-container .dice-container #dice1").css("transform", "rotateY(90deg)");
				break;
			case 5:
				$(".ingame-ui-container .dice-container #dice1").css("transform", "rotateX(90deg)");
				break;
			case 6:
				$(".ingame-ui-container .dice-container #dice1").css("transform", "rotateY(180deg)");
				break;
			default:
				$(".ingame-ui-container .dice-container #dice1").css("transform", "rotateY(360deg)");
		}
	}
	else if (dice == 2) {
		switch (number) {
			case 1:
				$(".ingame-ui-container .dice-container #dice2").css("transform", "rotateY(360deg)");
				break;
			case 2:
				$(".ingame-ui-container .dice-container #dice2").css("transform", "rotateX(-90deg)");
				break;
			case 3:
				$(".ingame-ui-container .dice-container #dice2").css("transform", "rotateY(-90deg)");
				break;
			case 4:
				$(".ingame-ui-container .dice-container #dice2").css("transform", "rotateY(90deg)");
				break;
			case 5:
				$(".ingame-ui-container .dice-container #dice2").css("transform", "rotateX(90deg)");
				break;
			case 6:
				$(".ingame-ui-container .dice-container #dice2").css("transform", "rotateY(180deg)");
				break;
			default:
				$(".ingame-ui-container .dice-container #dice2").css("transform", "rotateY(360deg)");
		}
	}
};

function scaleUpDice(dice){
	if (dice == 1) {
		$(".ingame-ui-container .dice-container #view1").css("transform", "scale(0.7)");
	}
	else if (dice == 2) {
		$(".ingame-ui-container .dice-container #view2").css("transform", "scale(0.7)");
	}
}

function scaleDownDice(dice){
	if (dice == 1) {
		$(".ingame-ui-container .dice-container #view1").css("transform", "scale(0.5)");
	}
	else if (dice == 2) {
		$(".ingame-ui-container .dice-container #view2").css("transform", "scale(0.5)");
	}
}

async function rollDice(dice, number, rotations){
	var i;
	var lastNum = 1;
	var tmp = 0;
	for (i = 0; i < rotations; i++) {
		while(tmp == lastNum) {
			tmp = random(1,6);
		}
		lastNum = tmp;
		rotateDice(dice, tmp);
		await sleep(500);
	}
	rotateDice(dice, number);
	await sleep(500);
	scaleUpDice(dice);
	await sleep(150);
	scaleDownDice(dice);
	await sleep(150);
}

$(document).ready(function(){
	$(".action-button").click(async function(){
		rotations = random(5,10);
		showDices();
		await sleep(300);
		rollDice(1,4,rotations);
		rollDice(2,2,rotations);
		await sleep(rotations*500+3000);
		hideDices();
		await sleep(200);
	});
});