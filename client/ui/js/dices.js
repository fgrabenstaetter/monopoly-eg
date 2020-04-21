function sleep(ms) {
	return new Promise(resolve => setTimeout(resolve, ms));
};

function random(min, max) {
	min = Math.ceil(min);
	max = Math.floor(max);
	return Math.floor(Math.random() * (max - min + 1)) + min;
};

async function showDices() {
	$(".dice-container").css("display", "block");
	await sleep(200);
	$(".dice-container").css("opacity", "1");
}

async function hideDices() {
	$(".dice-container").css("opacity", "0");
	await sleep(200);
	$(".dice-container").css("display", "none");
}

function rotateDice(dice, number) {
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

function scaleUpDice(dice) {
	if (dice == 1) {
		$(".ingame-ui-container .dice-container #view1").css("transform", "scale(0.7)");
	}
	else if (dice == 2) {
		$(".ingame-ui-container .dice-container #view2").css("transform", "scale(0.7)");
	}
}

function scaleDownDice(dice) {
	if (dice == 1) {
		$(".ingame-ui-container .dice-container #view1").css("transform", "scale(0.5)");
	}
	else if (dice == 2) {
		$(".ingame-ui-container .dice-container #view2").css("transform", "scale(0.5)");
	}
}

async function rollDice(dice, number, rotations) {
	var i;
	var lastNum = 1;
	var tmp = 0;
	for (i = 0; i < rotations; i++) {
		while (tmp == lastNum) {
			tmp = random(1, 6);
		}
		lastNum = tmp;
		rotateDice(dice, tmp);
		await sleep(400);
	}
	rotateDice(dice, number);
	await sleep(400);
	scaleUpDice(dice);
	await sleep(150);
	scaleDownDice(dice);
	await sleep(150);
}

async function triggerDices(d1, d2, _callback) {
	rotations = 6;
	if ($('.dice-container').css('top') == '50px') {
		$('.dice-container').css('top', '50%');
		$('.dice-container').css('transform', 'translate(-50%, -50%) scale(1)');
		await sleep(1000);
	}
	showDices();
	await sleep(300);
	rollDice(1, d1, rotations);
	rollDice(2, d2, rotations);
	await sleep(rotations * 400 + 800);
	$('.dice-container').css('top', '50px');
	$('.dice-container').css('transform', 'translate(calc(-50% + 50vw - 118px), 0) scale(0.5)');
	if (typeof _callback !== "undefined")
		_callback();
}
