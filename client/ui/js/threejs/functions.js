let varMovement, varCase, vdp, varFunction, varPawn;
let name, zoomOn = 1, counter = 0, counter2 = 0;
let scene, light, camera, renderer;
// Pas possible de les changer en let
var pawn, window, cases;


/**
 * Creation de la scene
 * @return {scene} La scene
 */
function getScene () {
	let scene = new THREE.Scene();
	return scene;
}


/**
 * Creation de la camera
 * @return {camera} La camera
 */
function getCamera () {
	const canvas = document.querySelector('#c');
	const WIDTH = canvas.clientWidth;
	const HEIGHT = canvas.clientHeight;
	const aspectRatio = WIDTH / HEIGHT;

	const d = 2;
	camera = new THREE.OrthographicCamera(-d * aspectRatio, d * aspectRatio, d, -d, 1, 1000);
	camera.position.set(20, 20, 20);

	camera.lookAt(scene.position);

	return camera;
}


/**
 * Creation de la lumiere
 * @return {light} La lumiere
 */
function getLight (scene) {
	let light = new THREE.PointLight("rgb(154, 151, 150)", 1, 0);
	light.position.set(7, 4, 3);
	scene.add(light);

	let light2 = new THREE.PointLight("rgb(154, 151, 150)", 1, 0);
	light2.position.set(3, 3, 4);
	scene.add(light2);

	let ambientLight = new THREE.AmbientLight(0x111111);
	scene.add(ambientLight);

	return light;
}


/**
 * Creation du rendu
 * @return {renderer} Le rendu
 */
function getRenderer () {
	const canvas = document.querySelector('#c');
	const HEIGHT = canvas.clientHeight;
	const WIDTH = canvas.clientWidth;
	// const HEIGHT = window.innerHeight;
	// const WIDTH = window.innerWidth;
	const pixelRatio = window.devicePixelRatio;

	//Creation du render
	renderer = new THREE.WebGLRenderer({antialias: false, alpha: true, canvas});
	renderer.setClearColor(0x000000, 0);
	renderer.setPixelRatio(pixelRatio);
	renderer.setSize(WIDTH, HEIGHT);
	// document.body.appendChild(renderer.domElement);


	renderer.outputEncoding = THREE.sRGBEncoding;
	renderer.gammaOutput = true;
	renderer.gammaFactor = 2.2;
	// renderer.autoClear = false;
	renderer.shadowMap.enabled = false;

	window.addEventListener('resize', handleWindowResize, false);
	
	return renderer;
}

function handleWindowResize() {
	const canvas = renderer.domElement;
	const width  = canvas.clientWidth;
	const height = canvas.clientHeight;
	renderer.setSize(width, height);
	camera.aspect = width / height;
	camera.updateProjectionMatrix();
}

scene = getScene();
camera = getCamera();
light = getLight(scene);
renderer = getRenderer();

// let rendererStats	= new THREEx.RendererStats();
// rendererStats.domElement.style.position	= 'absolute'
// rendererStats.domElement.style.left	= '0px'
// rendererStats.domElement.style.bottom	= '0px'
// document.body.appendChild( rendererStats.domElement )

let stats = new Stats();
document.body.appendChild(stats.dom)

// let glS = new glStats();
// let tS = new threeStats( renderer ); // init after WebGLRenderer is created
// let rS = new rStats( {
//     values: {
//         frame: { caption: 'Total frame time (ms)', over: 16 },
//         fps: { caption: 'Framerate (FPS)', below: 30 },
//         calls: { caption: 'Calls (three.js)', over: 3000 },
//         raf: { caption: 'Time since last rAF (ms)' },
//         rstats: { caption: 'rStats update (ms)' }
//     },
//     groups: [
//         { caption: 'Framerate', values: [ 'fps', 'raf' ] },
//         { caption: 'Frame Budget', values: [ 'frame', 'texture', 'setup', 'render' ] }
//     ],
//     fractions: [
//         { base: 'frame', steps: [ 'render' ] }
//     ],
//     plugins: [
//         tS,
//         glS
//     ]
// } );


/**
 * Génère le rendu de la scène 
 * @return {needSize} Booléen 
 */
function render (time) {
    // glS.start();

    // rS( 'frame' ).start();
    // rS( 'rAF' ).tick();
    // rS( 'FPS' ).frame();
    

	// TWEEN.update();
	
	// if (counter != 0)
	// 	movement(varPawn, varMovement, varFunction);

	// if (resizeRendererToDisplaySize(renderer)) {
	// 	const canvas = renderer.domElement;
	// 	camera.aspect = canvas.clientWidth / canvas.clientHeight;
	// 	camera.updateProjectionMatrix();
	// }

	// if (counter == 0) {
	// 	const canvas = document.querySelector('#c');
	// 	let aspectRatio = canvas.clientWidth / canvas.clientHeight;
	// 	let d = 2;
	// 	camera = new THREE.OrthographicCamera(-d * aspectRatio, d * aspectRatio, d, -d, 1, 1000); 
	
	// 	camera.position.set(20, 20, 20);
	// 	camera.lookAt(scene.position);
	// }

	stats.update();
	// rendererStats.update(renderer);
	TWEEN.update(time);
	
    // rS( 'render' ).start();
	renderer.render(scene, camera);
    // rS( 'render' ).end();

	// rS( 'frame' ).end();

	// rS( 'rStats ' ).start();
	// rS().update();
	// rS( 'rStats' ).end();
	
	requestAnimationFrame(render);
}
requestAnimationFrame(render);


/**
 * Supprime une maison
 * @param {int} Numero de case
 * @param {int} Numero de maison
 */
function deleteHouse (ncase, nhouse) {
	let concatS = "";
	deleteHouseD(concatS.concat(tabHouse[ncase],"_",nhouse));
}

/**
 * Supprime une maison (Auxiliaire)
 * @param {string} Numero de la maison
 */
function deleteHouseD (houseProperty) {
	// requestAnimationFrame(render);
	scene.remove(window[houseProperty]);
}


/**
 * Supprime un hotel
 * @param {int} Numero de case
 */
function deleteHotel (ncase) {
	let concatS = "";
	deleteHotelD(concatS.concat(tabHotel[ncase]));
}

/**
 * Supprime un hotel (Auxiliaire)
 * @param {string} Numero de l'hotel
 */
function deleteHotelD (hotelProperty) {
	// requestAnimationFrame(render);
	scene.remove(window[hotelProperty]);
}


/**
 * Supprime un pion
 * @param {string} nom du pion
 */
function deletePawn (pawn) {
	// requestAnimationFrame(render);
	scene.remove(window[pawn]);
}


/**
 * Modifie la couleur du drapeau
 * @param {string} Nom du drapeau
 * @param {string} Nom de la couleur
 */
function changeColorFlag (flag, colore) {
	deleteFlag(flag);
	loaderFlag(flag, colore);
}

/**
 * Supprime un drapeau
 * @param {string} Nom du drapeau
 */
function deleteFlag (flag) {
	// requestAnimationFrame(render);
	scene.remove(window[flag]);
}

/**
 * Ajoute un drapeau de la couleur du joueur sur la propriété
 * @param {string} Nom du drapeau
 * @param {string} Nom de la couleur
 */
function loaderFlag (flag, colore) {
	let load = new THREE.GLTFLoader();
	load.load('models/drapeaux/'+flag+'.gltf', (gltf) => {
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
 * Charge le plateau
 * @param {function} Loader
 * @param {string} Nom de l'élément du plateau
 */
function loaderPlateau (load, test) {
	load.load('models/plateau/'+test+'.gltf', (gltf) => {
	  // requestAnimationFrame(render);
	  const root = gltf.scene;
	  scene.add(root);

	  root.updateMatrixWorld();
	});
}

/**
 * Tableau de nom éléments du décor
 * @type {array} 
 */
var plateauObjects = [
			'collections', 'eau', 'egout', 'egout',
			'orangerie', 'parlement', 'pont', 'rail',
			'route', 'tram', 'campus', 'cascade', 'maison'
];

for (let i = 0; i < 13; i++) {
  let objVar = plateauObjects[i];
  let loader = new THREE.GLTFLoader();
  loaderPlateau(loader, objVar);
}


/**
 * Ajoute un pion à la case qu'on veut
 * @param {string} pawn Le nom du pion (Ex: 'moto')
 * @param {int} vdp Un entier entre [0-39]
 */
function loaderPawn (pawn, vdp) {
	load = new THREE.GLTFLoader();
	load.load('models/pions/'+pawn+'.gltf', (gltf) => {
		// requestAnimationFrame(render);
		const root = gltf.scene;
		window[pawn] = gltf.scene;

		varMovement = vdp;
		varCase = tabCases[varMovement];

		let vdpx = varCase.x;
		vdpx = (Math.floor(vdpx * 100) / 100);

		let vdpz = varCase.z;
		vdpz = (Math.floor(vdpz * 100) / 100);
		root.position.set(vdpx, 2, vdpz);

		if (vdp >= 0 && vdp <= 9) {
			root.rotateY(Math.PI / -2);
			window[pawn].position.x -= (Math.floor(0.01 * 100) / 100);
		} else if (vdp >= 10 && vdp <= 19) {
			root.rotateY(Math.PI);
			window[pawn].position.z -= (Math.floor(0.01 * 100) / 100);
		} else if (vdp >= 20 && vdp <= 29) {
			root.rotateY(Math.PI / 2);
			window[pawn].position.x += (Math.floor(0.01 * 100) / 100);
		} else {
			root.rotateY(Math.PI * 2);
			window[pawn].position.z += (Math.floor(0.01 * 100) / 100);
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
function loaderHouseProperty (ncase, nhouse) {
	let concatS = "";
	housePropertyL(concatS.concat(tabHouse[ncase],"_",nhouse));
}


/**
 * Fonction prinicpale - Charge une maison à la case spécifiée
 * @param {string} houseProperty  Nom de la maison (Ex: M3_1_2)
 */
function housePropertyL (houseProperty) {
	let load = new THREE.GLTFLoader();
	load.load('models/maisonPro/'+houseProperty+'.gltf', (gltf) => {
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
function loaderHotelProperty (ncase) {
	let concatS = "";
	hotelPropertyL(concatS.concat(tabHotel[ncase]));
}


/**
 * Fonction principale - Charge un hôtel à la case spécifiée
 * @param {string} hotelPropriete Nom de l'hôtel (Ex: H1_2)
 */
function hotelPropertyL (hotelPropriete) {
	let load = new THREE.GLTFLoader();
	load.load('models/maisonPro/'+hotelPropriete+'.gltf', (gltf) => {
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
function animateVector3(vectorToAnimate, target, options){
	options = options || {};
	// get targets from options or set to defaults
	var to = target || THREE.Vector3(),
		easing = options.easing || TWEEN.Easing.Quadratic.In,
		duration = options.duration || 2000;
	// create the tween
	var tweenVector3 = new TWEEN.Tween(vectorToAnimate)
		.to({ x: to.x, y: to.y, z: to.z, }, duration)
		.easing(easing)
		.onUpdate(function(d) {
			if(options.update){ 
				options.update(d);
			}
		})
		.onComplete(function(){
		if(options.callback) options.callback();
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
function movement (pawn, vdp, callback) {

	// const target = new THREE.Vector3(3.5, 2, 3.85);
	const target = tabCases[vdp];
	animateVector3(window[pawn].position, target, {
		duration: 3000,
		easing : TWEEN.Easing.Quadratic.InOut,
		update: function(d) {
			// console.log("Updating: " + d);
		},
		callback : function(){
			callback();
		}
	});

	return;

	varFunction = callback;
	varMovement = vdp;
	varCase = tabCases[varMovement];
	varPawn = pawn;

	let ppx = window[pawn].position.x;
	ppx = (Math.floor(ppx * 100) / 100);
	
	let ppz = window[pawn].position.z;
	ppz = (Math.floor(ppz * 100) / 100);

	let vdpx = varCase.x;
	vdpx = (Math.floor(vdpx * 100) / 100);
	
	let vdpz = varCase.z;
	vdpz = (Math.floor(vdpz * 100) / 100);
	
	let xmin = 0.335;
	xmin = (Math.floor(xmin * 100) / 100);
	
	let xmax = 0.335*11.5;
	xmax = (Math.floor(xmax * 100) / 100);
	
	let zmin = 0.335;
	zmin = (Math.floor(zmin * 100) / 100);
	
	let zmax = 0.335*11.5;
	zmax = (Math.floor(zmax * 100) / 100);
	
	counter = 1;

	if (ppx == vdpx && ppz == vdpz) {
		camera.zoom = 0;
		counter = 0;
		counter2 = 0;

		if (callback)
			callback();
	}


	// Rotation pour les pions
	if (ppx == xmin && ppz == zmax) {
		window[pawn].rotateY(Math.PI / -2);
		window[pawn].position.z -= (Math.floor(0.01 * 100) / 100);
	} else if (ppx == xmin && ppz == zmin) {
		window[pawn].rotateY(Math.PI / -2);
		window[pawn].position.x += (Math.floor(0.01 * 100) / 100);
	} else if (ppx == xmax && ppz == zmin) {
		window[pawn].rotateY(Math.PI / -2);
		window[pawn].position.z += (Math.floor(0.01 * 100) / 100);
	} else if (ppx == xmax && ppz == zmax) {
		window[pawn].rotateY(Math.PI / -2);
		window[pawn].position.x -= (Math.floor(0.01 * 100) / 100);
	}


	// La route d'en bas - Du coin droit vers le coin gauche
	if (ppx != vdpx && ((ppz == vdpz) || (ppz != vdpz)) && ppz == zmax && vdpz == zmax) {
		// Pour revenir sur la même route (un tour du plateau)
		if (ppx == xmin && ppz == zmax){
			// requestAnimationFrame(render);
			window[pawn].position.z -= (Math.floor(0.01 * 100) / 100);
		} else {
			if (zoomOn === 0) {
				// requestAnimationFrame(render);	
				window[pawn].position.x -= (Math.floor(0.01 * 100) / 100);
			}

			if (zoomOn === 1) {
				// requestAnimationFrame(render);
				console.log("Counter1: " + counter);
				console.log("Counter2: " + counter2);
				camera.zoom = 1.5;
				if (counter2 <= 50 && (window[pawn].position.x > 1.67 && window[pawn].position.x < 3.85))
					camera.position.y -= 0.01;

				window[pawn].position.x -= (Math.floor(0.01 * 100) / 100);
				counter2++;

				if (counter2 >= 75 && (window[pawn].position.x > 1.67 && window[pawn].position.x < 3.85))
					camera.position.x -= 0.01;
				else if (window[pawn].position.x > 0.33 && window[pawn].position.x < 1.67)
					camera.position.x -= 0.01;
			}
		}

	// La route d'en bas vers une case de la route à gauche
	} else if (ppx != vdpx && ppz != vdpz && vdpx == xmin && ppz == zmax){
		if (zoomOn === 0) {
			// requestAnimationFrame(render);
			window[pawn].position.x -= (Math.floor(0.01 * 100) / 100);
		}
		
		if (zoomOn === 1) {
			// requestAnimationFrame(render);
			camera.zoom = 1.5;

			if (counter2 <= 50 && (window[pawn].position.x > 1.67 && window[pawn].position.x < 3.85))
				camera.position.y -= 0.01;

			window[pawn].position.x -= (Math.floor(0.01 * 100) / 100);
			counter2++;

			if (counter2 >= 75 && (window[pawn].position.x > 1.67 && window[pawn].position.x < 3.85))
				camera.position.x -= 0.01;
			else if (window[pawn].position.x > 0.33 && window[pawn].position.x < 1.67)
				camera.position.x -= 0.01;
		}		

	// La route d'en bas - Du coin gauche vers le coin gauche d'en haut
	} else if (ppx == xmin && vdpx == xmin && ppx == vdpx && ppz != vdpz) {
		// Pour revenir sur la même route (un tour du plateau)
		if (ppx == xmin && ppz == zmin){
			// requestAnimationFrame(render);
			window[pawn].position.x += (Math.floor(0.01 * 100) / 100);
		} else {
			if (zoomOn === 0) {
				// requestAnimationFrame(render);
				window[pawn].position.z -= (Math.floor(0.01 * 100) / 100);
			}
			
			if (zoomOn === 1) {
				// requestAnimationFrame(render);
				camera.zoom = 1.5;		

				if (counter2 <= 50 && (window[pawn].position.z > 1.67 && window[pawn].position.z < 3.85))
					camera.position.x -= 0.015;

				window[pawn].position.z -= (Math.floor(0.01 * 100) / 100);
				counter2++;

				if (counter2 >= 50 && (window[pawn].position.z > 1.67 && window[pawn].position.z < 3.85))
					camera.position.z -= 0.007;
				else if (window[pawn].position.z > 0.33 && window[pawn].position.z < 1.67)
					camera.position.z -= 0.007;
			}
		}

	// La route gauche vers une case de la route en haut
	} else if (ppx != vdpx && ppz != vdpz && ppx == xmin && vdpz == zmin) {
		if (zoomOn === 0) {
			// requestAnimationFrame(render);
			window[pawn].position.z -= (Math.floor(0.01 * 100) / 100);
		}
		
		if (zoomOn === 1) {
			// requestAnimationFrame(render);
			camera.zoom = 1.5;		

			if (counter2 <= 50 && (window[pawn].position.z > 1.67 && window[pawn].position.z < 3.85))
				camera.position.x -= 0.015;

			window[pawn].position.z -= (Math.floor(0.01 * 100) / 100);
			counter2++;

			if (counter2 >= 50 && (window[pawn].position.z > 1.67 && window[pawn].position.z < 3.85))
				camera.position.z -= 0.007;
			else if (window[pawn].position.z > 0.33 && window[pawn].position.z < 1.67)
				camera.position.z -= 0.007;
		}

	// La route d'en haut - Le coin haut gauche vers le coin haut droite
	} else if (ppx != vdpx && ppz == vdpz && ppz == zmin && vdpz == zmin) {
		// Pour revenir sur la même route (un tour du plateau)
		if (ppx == xmax && ppz == zmin) {
			// requestAnimationFrame(render);
			window[pawn].position.z += (Math.floor(0.01 * 100) / 100);
		} else {
			if (zoomOn === 0) {
				// requestAnimationFrame(render);
				window[pawn].position.x += (Math.floor(0.01 * 100) / 100);
			}
			
			if (zoomOn === 1) {
				// requestAnimationFrame(render);
				camera.zoom = 1.5;

				if (counter2 <= 50 && (window[pawn].position.x > 1.67 && window[pawn].position.x < 3.85))
					camera.position.y += 0.005;
				else if (window[pawn].position.x > 0.33 && window[pawn].position.x < 1.67)
					camera.position.y += 0.008;

				window[pawn].position.x += (Math.floor(0.01 * 100) / 100);
				counter2++;

				if (counter2 >= 75 && (window[pawn].position.x > 1.67 && window[pawn].position.x < 3.85))
					camera.position.x += 0.01;
				else if (window[pawn].position.x > 0.33 && window[pawn].position.x < 1.67)
					camera.position.x += 0.01;
			}
		}

	// L'opposer de la route d'en bas ->  haut (case 9 -> case 21)
	} else if (((ppx == vdpx) || (ppx != vdpx)) && ppz != vdpx && ppz == zmax && vdpz == zmin) {
		if (zoomOn === 0) {
			// requestAnimationFrame(render);
			window[pawn].position.x -= (Math.floor(0.01 * 100) / 100);
		}
		
		if (zoomOn === 1) {	
			// requestAnimationFrame(render);
			camera.zoom = 1.5;

			if (counter2 <= 50 && (window[pawn].position.x > 1.67 && window[pawn].position.x < 3.85))
				camera.position.y -= 0.01;

			window[pawn].position.x -= (Math.floor(0.01 * 100) / 100);
			counter2++;

			if (counter2 >= 75 && (window[pawn].position.x > 1.67 && window[pawn].position.x < 3.85))
				camera.position.x -= 0.01;
			else if (window[pawn].position.x > 0.33 && window[pawn].position.x < 1.67)
				camera.position.x -= 0.01;
		}

	// La route de droite - Le coin haut droite vers le coin bas droite
	} else if (ppx == xmax && vdpx == xmax && ppx == vdpx && ppz != vdpz) {
		// Pour revenir sur la même route (un tour du plateau)
		if (ppx == xmax && ppz == zmax) {
			// requestAnimationFrame(render);
			window[pawn].position.x -= (Math.floor(0.01 * 100) / 100);
		} else {
			if (zoomOn === 0) {
				// requestAnimationFrame(render);
				window[pawn].position.z += (Math.floor(0.01 * 100) / 100);
			}
			
			if (zoomOn === 1) {
				// requestAnimationFrame(render);
				camera.zoom = 1.5;		

				if (counter2 <= 50 && (window[pawn].position.z > 0.33 && window[pawn].position.z < 1.67))
					camera.position.x += 0.01;
				else if (counter2 <= 30 && (window[pawn].position.z > 1.67 && window[pawn].position.z < 3.35))
					camera.position.x += 0.01;
			
				window[pawn].position.z += (Math.floor(0.01 * 100) / 100);
				counter2++;

				if (counter2 >= 50 && (window[pawn].position.z > 1.67 && window[pawn].position.z < 3.35))
					camera.position.z += 0.007;
				else if (window[pawn].position.z > 0.33 && window[pawn].position.z < 1.67)
					camera.position.z += 0.007;
			}
		}

	// La route d'en haut vers une case de la route à droite
	} else if (ppx != vdpx && ppz != vdpz && vdpx == xmax && ppz == zmin) {
		if (ppx == xmax && ppz == zmin) {
			// requestAnimationFrame(render);
			window[pawn].position.z += (Math.floor(0.01 * 100) / 100);
		} else {
			if (zoomOn === 0) {
				// requestAnimationFrame(render);
				window[pawn].position.x += (Math.floor(0.01 * 100) / 100);
			}
			
			if (zoomOn === 1) {
				// requestAnimationFrame(render);
				camera.zoom = 1.5;

				if (counter2 <= 50 && (window[pawn].position.x > 1.67 && window[pawn].position.x < 3.85))
					camera.position.y += 0.005;
				else if (window[pawn].position.x > 0.33 && window[pawn].position.x < 1.67)
					camera.position.y += 0.008;

				window[pawn].position.x += (Math.floor(0.01 * 100) / 100);
				counter2++;

				if (counter2 >= 75 && (window[pawn].position.x > 1.67 && window[pawn].position.x < 3.85))
					camera.position.x += 0.01;
				else if (window[pawn].position.x > 0.33 && window[pawn].position.x < 1.67)
					camera.position.x += 0.01;
			}
		}

	// L'opposer de la route de gauche ->  droit (case 19 -> case 31)
	} else if (ppx != vdpx && ((ppz != vdpz) || (ppz == vdpz)) && ppx == xmin && vdpx == xmax) {
		if (zoomOn === 0) {
			// requestAnimationFrame(render);
			window[pawn].position.z -= (Math.floor(0.01 * 100) / 100);
		}
		
		if (zoomOn === 1) {	
			// requestAnimationFrame(render);
			camera.zoom = 1.5;		

			if (counter2 <= 50 && (window[pawn].position.z > 1.67 && window[pawn].position.z < 3.85))
				camera.position.x -= 0.015;

			window[pawn].position.z -= (Math.floor(0.01 * 100) / 100);
			counter2++;

			if (counter2 >= 50 && (window[pawn].position.z > 1.67 && window[pawn].position.z < 3.85))
				camera.position.z -= 0.007;
			else if (window[pawn].position.z > 0.33 && window[pawn].position.z < 1.67)
				camera.position.z -= 0.007;
		}

	// La route de droite vers une case de la route en bas
	} else if(ppx != vdpx && ppz != vdpz && ppx == xmax && vdpz == zmax) {
		if (zoomOn === 0) {
			// requestAnimationFrame(render);
			window[pawn].position.z += (Math.floor(0.01 * 100) / 100);
		}
		
		if (zoomOn === 1) {	
			// requestAnimationFrame(render);
			camera.zoom = 1.5;		

			if (counter2 <= 50 && (window[pawn].position.z > 0.33 && window[pawn].position.z < 1.67))
				camera.position.x += 0.01;
			else if (counter2 <= 30 && (window[pawn].position.z > 1.67 && window[pawn].position.z < 3.85))
				camera.position.x += 0.02;

			window[pawn].position.z += (Math.floor(0.01 * 100) / 100);
			counter2++;

			if (counter2 >= 50 && (window[pawn].position.z > 1.67 && window[pawn].position.z < 3.35))
				camera.position.z += 0.007;
			else if (window[pawn].position.z > 0.33 && window[pawn].position.z < 1.67)
				camera.position.z += 0.007;
		}

	// L'opposer de la route du haut ->  bas (case 29 -> case 1)
	} else if (((ppx == vdpx) || (ppx != vdpx)) && ppz != vdpz && ppz == zmin && vdpz == xmax) {
		if (zoomOn === 0) {
			// requestAnimationFrame(render);
			window[pawn].position.x += (Math.floor(0.01 * 100) / 100);
		}
		
		if (zoomOn === 1) {	
			// requestAnimationFrame(render);
			camera.zoom = 1.5;

			if (counter2 <= 50 && (window[pawn].position.x > 1.67 && window[pawn].position.x < 3.85))
				camera.position.y += 0.005;
			else if (window[pawn].position.x > 0.33 && window[pawn].position.x < 1.67)
				camera.position.y += 0.002;

			window[pawn].position.x += (Math.floor(0.01 * 100) / 100);
			counter2++;

			if (counter2 >= 75 && (window[pawn].position.x > 1.67 && window[pawn].position.x < 3.85))
				camera.position.x += 0.01;
			else if (window[pawn].position.x > 0.33 && window[pawn].position.x < 1.67)
				camera.position.x += 0.01;
		}

	// L'opposer de la route de droite ->  gauche (case 39 -> case 11)
	} else if (ppx != vdpx && ((ppz != vdpz) || (ppz == vdpz)) && ppx == xmax && vdpx == xmin) {
		if (zoomOn === 0) {
			// requestAnimationFrame(render);
			window[pawn].position.z += (Math.floor(0.01 * 100) / 100);
		}
		
		if (zoomOn === 1) {	
			// requestAnimationFrame(render);
			camera.zoom = 1.5;		

			if (counter2 <= 50 && (window[pawn].position.z > 0.33 && window[pawn].position.z < 1.67))
				camera.position.x += 0.01;
			else if (counter2 <= 30 && (window[pawn].position.z > 1.67 && window[pawn].position.z < 3.85))
				camera.position.x += 0.015;
			
			window[pawn].position.z += (Math.floor(0.01 * 100) / 100);
			counter2++;

			if (counter2 >= 50 && (window[pawn].position.z > 1.67 && window[pawn].position.z < 3.35))
				camera.position.z += 0.007;
			else if (window[pawn].position.z > 0.33 && window[pawn].position.z < 1.67)
				camera.position.z += 0.007;
		}

	// La route de gauche vers une case de la route en bas
	} else if (ppx != vdpx && ppz != vdpz && ppx == xmin && vdpz == zmax) {
		if (zoomOn === 0) {
			// requestAnimationFrame(render);
			window[pawn].position.z -= (Math.floor(0.01 * 100) / 100);
		}
		
		if (zoomOn === 1) {	
			// requestAnimationFrame(render);
			camera.zoom = 1.5;		

			if (counter2 <= 50 && (window[pawn].position.z > 1.67 && window[pawn].position.z < 3.85))
				camera.position.x -= 0.015;

			window[pawn].position.z -= (Math.floor(0.01 * 100) / 100);
			counter2++;

			if (counter2 >= 50 && (window[pawn].position.z > 1.67 && window[pawn].position.z < 3.85))
				camera.position.z -= 0.007;
			else if (window[pawn].position.z > 0.33 && window[pawn].position.z < 1.67)
				camera.position.z -= 0.007;
		}

	// La route d'en haut vers une case de la route de gauche
	} else if((ppx != vdpx) && (ppz != vdpz) && (ppz == zmin) && (vdpx == xmin)) {
		if (zoomOn === 0) {
			// requestAnimationFrame(render);
			window[pawn].position.x += (Math.floor(0.01 * 100) / 100);
		}
		
		if (zoomOn === 1) {	
			// requestAnimationFrame(render);
			camera.zoom = 1.5;

			if (counter2 <= 50 && (window[pawn].position.x > 1.67 && window[pawn].position.x < 3.85))
				camera.position.y += 0.005;
			else if (window[pawn].position.x > 0.33 && window[pawn].position.x < 1.67)
				camera.position.y += 0.008;

			window[pawn].position.x += (Math.floor(0.01 * 100) / 100);
			counter2++;

			if (counter2 >= 75 && (window[pawn].position.x > 1.67 && window[pawn].position.x < 3.85))
				camera.position.x += 0.01;
			else if (window[pawn].position.x > 0.33 && window[pawn].position.x < 1.67)
				camera.position.x += 0.01;
		}

	// La route de droite vers une case de la route d'en haut
	} else if(ppx != vdpx && ppz != vdpz && ppx == xmax && vdpz == zmin) {
		if (zoomOn === 0) {
			// requestAnimationFrame(render);
			window[pawn].position.z += (Math.floor(0.01 * 100) / 100);
		}
		
		if (zoomOn === 1) {	
			// requestAnimationFrame(render);
			camera.zoom = 1.5;		

			if (counter2 <= 50 && (window[pawn].position.z > 0.33 && window[pawn].position.z < 1.67))
				camera.position.x += 0.01;
			else if (counter2 <= 150 && (window[pawn].position.z > 1.67 && window[pawn].position.z < 3.85))
				camera.position.x += 0.01;
			
			window[pawn].position.z += (Math.floor(0.01 * 100) / 100);
			counter2++;

			if (counter2 >= 5 && (window[pawn].position.z > 1.67 && window[pawn].position.z < 3.35))
				camera.position.z += 0.01;
			else if (window[pawn].position.z > 0.33 && window[pawn].position.z < 1.67)
				camera.position.z += 0.01;
		}

	// La route d'en bas vers une case de la route de droite
	} else if(ppx != vdpx && ppz != vdpz && ppz == vdpx) {
		if (zoomOn === 0) {
			// requestAnimationFrame(render);
			window[pawn].position.x -= (Math.floor(0.01 * 100) / 100);
		}
		
		if (zoomOn === 1) {	
			// requestAnimationFrame(render);
			camera.zoom = 1.5;

			if (counter2 <= 50 && (window[pawn].position.x > 1.67 && window[pawn].position.x < 3.85))
				camera.position.y -= 0.01;

			window[pawn].position.x -= (Math.floor(0.01 * 100) / 100);
			counter2++;

			if (counter2 >= 75 && (window[pawn].position.x > 1.67 && window[pawn].position.x < 3.85))
				camera.position.x -= 0.01;
			else if (window[pawn].position.x > 0.33 && window[pawn].position.x < 1.67)
				camera.position.x -= 0.01;
		}
	}
}
