// let varMovement, varCase, vdp, varFunction, varPawn;
let name, zoomOn = 1;
// let name, zoomOn = 1, counter = 0, counter2 = 0;
// Pas possible de les changer en let
// var pawn, window, cases;

const canvas = document.querySelector('#c');
const HEIGHT = canvas.clientHeight;
const WIDTH = canvas.clientWidth;
const W_HEIGHT = window.innerHeight;
const W_WIDTH = window.innerWidth;
const aspectRatio = WIDTH / HEIGHT;

// const W_HEIGHT = window.innerHeight;
// const W_WIDTH = window.innerWidth;
const pixelRatio = window.devicePixelRatio;

const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
renderer.setViewport(0,0,W_WIDTH,W_HEIGHT);
// renderer.setPixelRatio(pixelRatio);
renderer.setSize(WIDTH, HEIGHT);


const gltfLoader = new THREE.GLTFLoader();
const dracoLoader = new THREE.DRACOLoader();
dracoLoader.setDecoderPath('/js/threejs/draco/');
gltfLoader.setDRACOLoader(dracoLoader);


/**
 * RENDERER
 */

//Creation du render
// renderer.setClearColor(0x000000, 0);
// renderer.setPixelRatio(pixelRatio);
// renderer.setSize(WIDTH, HEIGHT);


renderer.outputEncoding = THREE.sRGBEncoding;
renderer.gammaOutput = true;
renderer.gammaFactor = 2.2;
renderer.shadowMap.enabled = true;

window.addEventListener('resize', handleWindowResize, false);


/**
 * SCENE
 */
const scene = new THREE.Scene();


/**
 * CAMERA
 */
const d = 2;
const camera = new THREE.OrthographicCamera(-d * aspectRatio, d * aspectRatio, d, -d, 1, 1000);
camera.position.set(20, 20, 20);
camera.lookAt(scene.position);

/**
 * OBJETS glTF PLATEAU
 */
{
	const plateauObjects = ['plateau2']; // Plateau texture UV
	// const plateauObjects = [];
	// const plateauObjects = [
	// 	'collections', 'eau', 'egout', 'egout',
	// 	'orangerie', 'parlement', 'pont', 'rail',
	// 	'route', 'tram', 'campus', 'cascade', 'maison'
	// ];
	// const plateauObjects = [
	// 	'plateau2', 'egout',
	// 	'orangerie', 'parlement', 'pont',
	// 	'tram', 'campus', 'cascade', 'maison'
	// ];
	
	for (const i in plateauObjects) {
		gltfLoader.load('models/plateau/' + plateauObjects[i] + '.gltf', (gltf) => {
			const root = gltf.scene;
			scene.add(root);
		});
	}

	// gltfLoader.load('models/town/scene.gltf', (gltf) => {
	// 	const root = gltf.scene;
	// 	scene.add(root);
	// });
	// camera.zoom = 0.001;
	// camera.updateProjectionMatrix();
	
	// Chargement du plateau par "cube Three JS"
	// const geometry = new THREE.BoxBufferGeometry(4, 0.3, 4);
	// const textureLoader = new THREE.TextureLoader();
	// const materials = [
	// 	new THREE.MeshBasicMaterial({ color: 0x3c2105 }),
	// 	null,
	// 	new THREE.MeshBasicMaterial({
	// 		map: textureLoader.load('/img/texture_plateau.png', (texture) => {
	// 			texture.outputEncoding = THREE.LinearEncoding
	// 		}),
	// 		needsUpdate: true,
	// 		reflectivity: false
	// 	}),
	// 	null,
	// 	new THREE.MeshBasicMaterial({ color: 0x3c2105 }),
	// 	null,
	// ];
	// let cube = new THREE.Mesh(geometry, materials);
	// cube.position.set(0, -0.13, 0);
	// scene.add(cube);
}

 /**
  * LUMIERE
  */
 {
	// let light = new THREE.PointLight("rgb(154, 151, 150)", 1, 0);
	// light.position.set(7, 4, 3);
	// scene.add(light);

	// let light2 = new THREE.PointLight("rgb(154, 151, 150)", 1, 0);
	// light2.position.set(3, 3, 4);
	// scene.add(light2);

	// let ambientLight = new THREE.AmbientLight(0x111111);
	// scene.add(ambientLight);

	const color = 0xFFFFFF;
    const intensity = 1;
    const light = new THREE.DirectionalLight(color, intensity);
    light.position.set(5, 10, 2);
    scene.add(light);
    scene.add(light.target);
}

function handleWindowResize() {
	const canvas = renderer.domElement;
	const width = canvas.clientWidth;
	const height = canvas.clientHeight;
	renderer.setSize(width, height);
	camera.aspect = width / height;
	camera.updateProjectionMatrix();
}

// let rendererStats	= new THREEx.RendererStats();
// rendererStats.domElement.style.position	= 'absolute'
// rendererStats.domElement.style.left	= '0px'
// rendererStats.domElement.style.bottom	= '0px'
// document.body.appendChild( rendererStats.domElement )

let stats = new Stats();
document.body.appendChild(stats.dom)

/**
 * Génère le rendu de la scène 
 * @return {needSize} Booléen 
 */
function render(time) {
	// if (resizeRendererToDisplaySize(renderer)) {
	// 	const canvas = renderer.domElement;
	// 	camera.aspect = canvas.clientWidth / canvas.clientHeight;
	// 	camera.updateProjectionMatrix();
	// }

	stats.update();
	// rendererStats.update(renderer);
	TWEEN.update(time);

	renderer.render(scene, camera);
	requestAnimationFrame(render);
}
requestAnimationFrame(render);


/**
 * Supprime une maison
 * @param {int} Numero de case
 * @param {int} Numero de maison
 */
function deleteHouse(ncase, nhouse) {
	let concatS = "";
	deleteHouseD(concatS.concat(tabHouse[ncase], "_", nhouse));
}

/**
 * Supprime une maison (Auxiliaire)
 * @param {string} Numero de la maison
 */
function deleteHouseD(houseProperty) {
	// requestAnimationFrame(render);
	scene.remove(window[houseProperty]);
}


/**
 * Supprime un hotel
 * @param {int} Numero de case
 */
function deleteHotel(ncase) {
	let concatS = "";
	deleteHotelD(concatS.concat(tabHotel[ncase]));
}

/**
 * Supprime un hotel (Auxiliaire)
 * @param {string} Numero de l'hotel
 */
function deleteHotelD(hotelProperty) {
	// requestAnimationFrame(render);
	scene.remove(window[hotelProperty]);
}


/**
 * Supprime un pion
 * @param {string} nom du pion
 */
function deletePawn(pawn) {
	// requestAnimationFrame(render);
	scene.remove(window[pawn]);
}


/**
 * Modifie la couleur du drapeau
 * @param {string} Nom du drapeau
 * @param {string} Nom de la couleur
 */
function changeColorFlag(flag, colore) {
	deleteFlag(flag);
	loaderFlag(flag, colore);
}

/**
 * Supprime un drapeau
 * @param {string} Nom du drapeau
 */
function deleteFlag(flag) {
	// requestAnimationFrame(render);
	scene.remove(window[flag]);
}

/**
 * Ajoute un drapeau de la couleur du joueur sur la propriété
 * @param {string} Nom du drapeau
 * @param {string} Nom de la couleur
 */
function loaderFlag(flag, colore) {
	gltfLoader.load('models/drapeaux/' + flag + '.gltf', (gltf) => {
		// requestAnimationFrame(render);
		const root = gltf.scene;
		window[flag] = gltf.scene;
		window[flag].traverse((o) => {
			if (o.isMesh) {
				if (o.name === drapPlane[flag])
					o.material.color = new THREE.Color(colore);
			}
		});
		scene.add(root);
	});
}

/**
  * Tableau de nom des drapeaux
  * @type {array} 
  */
var plateauDrapeaux = [
	'd1', 'd3', 'd5', 'd6', 'd8', 'd9',
	'd11', 'd12', 'd13', 'd14', 'd15', 'd16', 'd18',
	'd19', 'd21', 'd23', 'd24', 'd25', 'd26', 'd27',
	'd28', 'd29', 'd31', 'd32', 'd34', 'd35', 'd37',
	'd39'
];


/**
 * Ajoute un pion à la case qu'on veut
 * @param {string} pawn Le nom du pion (Ex: 'moto')
 * @param {int} vdp Un entier entre [0-39]
 */
function loaderPawn(pawn, vdp) {
	gltfLoader.load('models/pions/' + pawn + '.gltf', (gltf) => {
		// requestAnimationFrame(render);
		const root = gltf.scene;
		window[pawn] = gltf.scene;

		varMovement = vdp;
		varCase = tabCases[varMovement];

		let vdpx = varCase.x;
		//vdpx = (Math.floor(vdpx * 100) / 100);
		let vdpz = varCase.z;
		//vdpz = (Math.floor(vdpz * 100) / 100);
		root.position.set(vdpx, 2, vdpz);

		if (vdp >= 0 && vdp <= 9) {
			root.rotateY(Math.PI / -2);
			//window[pawn].position.x -= (Math.floor(0.01 * 100) / 100);
			//console.log(window[pawn].position.x );
		} else if (vdp >= 10 && vdp <= 19) {
			root.rotateY(Math.PI);
			//window[pawn].position.z -= (Math.floor(0.01 * 100) / 100);
		} else if (vdp >= 20 && vdp <= 29) {
			root.rotateY(Math.PI / 2);
			//window[pawn].position.x += (Math.floor(0.01 * 100) / 100);
		} else {
			root.rotateY(Math.PI * 2);
			//window[pawn].position.z += (Math.floor(0.01 * 100) / 100);
		}

		scene.add(root);
	});
}


/**
 * Fonction auxiliaire - Charge une maison à la case spécifiée
 * @param {int} ncase Chiffre de la case
 * @param {int} nhouse Entier entre [1-4]. 1 -> met la case en bas à droite de la case
 * 					 					 2 -> met la case en bas à gauche de la case
 * 										 3 -> met la case en haut à droite de la case
 * 										 4 -> met la case en haut à gauche de la case
 */
function loaderHouseProperty(ncase, nhouse) {
	let concatS = "";
	housePropertyL(concatS.concat(tabHouse[ncase], "_", nhouse));
}


/**
 * Fonction prinicpale - Charge une maison à la case spécifiée
 * @param {string} houseProperty  Nom de la maison (Ex: M3_1_2)
 */
function housePropertyL(houseProperty) {
	gltfLoader.load('models/maisonPro/' + houseProperty + '.gltf', (gltf) => {
		// requestAnimationFrame(render);
		const root = gltf.scene;
		window[houseProperty] = gltf.scene;
		scene.add(root);
	});
}


/**
 * Fonction auxiliaire - Charge un hôtel à la case spécifiée
 * @param {int} ncase Chiffre de la case 
 */
function loaderHotelProperty(ncase) {
	let concatS = "";
	hotelPropertyL(concatS.concat(tabHotel[ncase]));
}


/**
 * Fonction principale - Charge un hôtel à la case spécifiée
 * @param {string} hotelPropriete Nom de l'hôtel (Ex: H1_2)
 */
function hotelPropertyL(hotelPropriete) {
	gltfLoader.load('models/maisonPro/' + hotelPropriete + '.gltf', (gltf) => {
		// requestAnimationFrame(render);
		const root = gltf.scene;
		window[hotelPropriete] = gltf.scene;
		scene.add(root);
	});
}


/**
 * Active ou désactive le zoom sur le plateau
 * @param {int} number Entier entre [0-1]. 0 pour désactiver le zoom et 1 pour l'activer
 */
function zoomOnOff(number) {
	zoomOn = number;
}

/* Animates a Vector3 to the target */
function animateVector3(pawn, vectorToAnimate, target, options){
	//console.log("5");
	options = options || {};
	// get targets from options or set to defaults
	var to = target || THREE.Vector3(),
		easing = options.easing || TWEEN.Easing.Quadratic.In,
		duration = options.duration || 2000;
	// create the tween
	var tweenVector3 = new TWEEN.Tween(vectorToAnimate)
		.to({ x: to.x, y: to.y, z: to.z, }, duration)
		.easing(easing)
		.onUpdate(function (d) {
			if (options.update) {
				options.update(d);
			}
		})
		.onComplete(function () {
			if (options.callback) options.callback();
		});
	// start the tween

	tweenVector3.start();
	
	// return the tween in case we want to manipulate it later on
	return tweenVector3;
}


/**
 * Déplace le pion sur le plateau
 * @param {string} pawn Le nom du pion (Ex: 'moto')
 * @param {int} vdp Un entier entre [0-39] 
 * @callback callback Appel d'un callback()
 */
let posPawn;
function movement (pawn, caseArr, callback) {
	let i;
	vdp = caseArr;
	for (i=0;i<40;i++)
	{
		if ((Math.floor(window[pawn].position.x *100)/ 100) == (Math.floor(tabCases[i].x * 100) / 100) && (Math.floor(window[pawn].position.z * 100)/100) == (Math.floor(tabCases[i].z * 100) / 100)) {
			posPawn = i;
			//console.log("1");
		}
	}

	//console.log((Math.floor(tabCases[10].x * 100) / 100));
	console.log(posPawn);

		if(vdp > posPawn && vdp < 10){
			// route en bas
			console.log("1");
			movementAux(0, pawn, vdp, callback);
		} else if (vdp == 10 && posPawn < 10) {
			// pour aller dans le coins en bas a gauche
			console.log("2");
			movementAux(1, pawn, 10, callback);
		} else if (posPawn == 10 && vdp > 10 && vdp < 20) {
			// aller du coin en bas a gauche vers la route de gauche
			console.log("3");
			movementAux(0, pawn, vdp, callback);
 		} else if (posPawn < 10 && vdp > 10) {
			 // de la route en bas à la route à gauche
			 console.log("4");
			movementAux(1, pawn, 10, callback);
		} else if (posPawn > 10 && posPawn < 20 && vdp < 20) {
			// route de gauche vers la route à gauche
			console.log("5");
			movementAux(0, pawn, vdp, callback);
		} else if (vdp == 20 && posPawn < 20) {
			// pour aller dans le coin en haut a gauche
			console.log("6");
			movementAux(1, pawn, 20, callback);
		} else if (posPawn == 20 && vdp > 20 && vdp < 30) { 
			// aller du coin en haut a gauche vers la route d'en haut
			console.log("7");
			movementAux(0, pawn, vdp, callback);
		} else if (posPawn < 20 && vdp > 20) { 
			 // de la route gauche à la route d'en haut
			 console.log("8");
			movementAux(1, pawn, 20, callback);
		} else if (posPawn > 20 && posPawn < 30 && vdp > 20 && vdp < 30) { 
			// route d'en haut vers la route d'en haut
			console.log("9");
			movementAux(0, pawn, vdp, callback);
		} else if (vdp == 30 && posPawn < 30) {
			// pour aller dans le coin en haut a droite
			console.log("10");
			movementAux(1, pawn, 30, callback);
		} else if (posPawn == 30 && vdp > 30) {
			// aller du coin en haut a droite vers la route a droite
			console.log("11");
			movementAux(0, pawn, vdp, callback);
		} else if (posPawn < 30 && vdp > 30) {
			// de la route d'en haut à la route de droite
			console.log("12");
			movementAux(1, pawn, 30, callback);
		} else if (posPawn > 30 && posPawn < 39 && vdp >= 31 && vdp <= 39) { 
			// route de droite vers la route de droite
			console.log("13");
			movementAux(0, pawn, vdp, callback);
		} else if (posPawn >= 30 && posPawn <= 39 && vdp == 0) {
			// pour aller dans le coin en haut en bas
			console.log("14");
			movementAux(0, pawn, 0, callback);
		} else if (posPawn == 0 && vdp > 0) {
			// aller du coin en bas a droite vers la route d'en bas
			console.log("15");
			movementAux(0, pawn, vdp, callback);
		} else if (posPawn >= 30 && posPawn <= 39 && vdp >= 0 && vdp <= 11) {
			// de la route de droite à la route d'en bas
			console.log("16");
			movementAux(1, pawn, 0, callback);
		} else if (posPawn >= 20 && posPawn <= 30 && vdp >= 0 && vdp <= 10) {
			// de la route en haut à la route d'en bas
			console.log("17");
			movementAux(1, pawn, 30, callback);
		} 


		if (callback)
			callback();
}


/**
 * Déplace le pion sur le plateau
 * @param {string} pawn Le nom du pion (Ex: 'moto')
 * @param {int} vdp Un entier entre [0-39]
 * @callback callback Appel d'un callback()
 */
//let compteur = 0;
function movementAux (compteur, pawn, coin, callback) {
	// const target = new THREE.Vector3(3.5, 2, 3.85);
	const target = tabCases[coin];
	//console.log(window[pawn].position);
	animateVector3(window[pawn], window[pawn].position, target, {
		duration: 2000,
		easing : TWEEN.Easing.Quadratic.InOut,
		update: function(d) {
				//console.log(window[pawn].position);
			if ((Math.floor(window[pawn].position.x * 100) / 100) == 0.33 && (Math.floor(window[pawn].position.z * 100) / 100) == 3.85 && compteur == 1) { 
				//console.log("bon1");
				if (vdp > 20) 
					movementAux(0, pawn, 20, callback);
				else 
					movementAux(0, pawn, vdp, callback);		
			} else if ((Math.floor(window[pawn].position.x * 100) / 100) == 0.33 && (Math.floor(window[pawn].position.z * 100) / 100) == 0.33 && compteur == 1) {
				//console.log("bon2");
				if (vdp > 30) 
					movementAux(0, pawn, 30, callback);
				else
					movementAux(0, pawn, vdp, callback);
			} else if ((Math.floor(window[pawn].position.x * 100) / 100) == 3.85 && (Math.floor(window[pawn].position.z * 100) / 100) == 0.33 && compteur == 1) {
				//console.log("bon3");
				if (vdp >= 0 && vdp <= 10)
					movementAux(0, pawn, 0, callback);
				else 
					movementAux(0, pawn, vdp, callback);
			}else if ((Math.floor(window[pawn].position.x * 100) / 100) == 3.85 && (Math.floor(window[pawn].position.z * 100) / 100) == 3.85 && compteur == 1) {
				//console.log("bon4");
				if (vdp >= 10 && vdp <= 20)
					movementAux(0, pawn, 10, callback);
				else
					movementAux(0, pawn, vdp, callback);
			} else if ((Math.floor(window[pawn].position.x * 100) / 100) == 0.33 && (Math.floor(window[pawn].position.z * 100) / 100) == 0.33 && compteur == 0 && vdp > 20 && vdp < 30) {
				movementAux(2, pawn, vdp, callback);
			} else if ((Math.floor(window[pawn].position.x * 100) / 100) == 3.85 && (Math.floor(window[pawn].position.z * 100) / 100) == 0.33 && compteur == 0 && vdp > 30 && vdp < 40) {
				movementAux(2, pawn, vdp, callback);
			} else if ((Math.floor(window[pawn].position.x * 100) / 100) == 3.85 && (Math.floor(window[pawn].position.z * 100) / 100) == 3.85 && compteur == 0 && vdp >= 0 && vdp < 10) {
				movementAux(2, pawn, vdp, callback);
			} else if ((Math.floor(window[pawn].position.x * 100) / 100) == 0.33 && (Math.floor(window[pawn].position.z * 100) / 100) == 3.85 && compteur == 0 && vdp >= 10 && vdp < 20) {
				movementAux(2, pawn, vdp, callback);
			}
		},
		/*callback : function(){
			callback();
		}*/
	});

}
