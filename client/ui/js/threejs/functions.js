let varMovement, varCase, vdp, vartest, varFunction, varPawn, positionPawn, counter = 0, counter2 = 0;
let scene, light, camera, renderer;
var pawn, window, cases;


function getScene () {
	let scene = new THREE.Scene();
	return scene;
}


function getCamera () {
	const canvas = document.querySelector('#c');
	let aspectRatio = canvas.clientWidth / canvas.clientHeight;
	let d = 2;
	camera = new THREE.OrthographicCamera(-d * aspectRatio, d * aspectRatio, d, -d, 1, 1000); 

	camera.position.set(20, 20, 20);
	camera.lookAt(scene.position);

	return camera;
}


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


function getRenderer () {
	//Creation du render
	const canvas = document.querySelector('#c');
	renderer = new THREE.WebGLRenderer({ antialias: false, alpha: true, canvas });
	renderer.setClearColor(0x000000, 0);
	renderer.setPixelRatio(window.devicePixelRatio);
	//renderer.setSize(window.innerWidth, window.innerHeight);

	renderer.outputEncoding = THREE.sRGBEncoding;
	renderer.gammaOutput = true;
	renderer.gammaFactor = 2.2;
	renderer.autoClear = false;
	//console.log(renderer.renderLists);
	//On ajoute l'objet à la page html
	//document.getElementsByClassName('board-container')[0].appendChild(renderer.domElement);
	return renderer;
}


scene = getScene();
camera = getCamera();
light = getLight(scene);
renderer = getRenderer();


function resizeRendererToDisplaySize (renderer) {
	const canvas = renderer.domElement;
	const pixelRatio = window.devicePixelRatio;
    const width  = canvas.clientWidth  * pixelRatio | 0;
    const height = canvas.clientHeight * pixelRatio | 0;
	const needResize = canvas.width !== width || canvas.height !== height;

	if (needResize) {
		renderer.setSize(width, height, false);
	}

	return needResize;
}


function render () {
	//requestAnimationFrame(render);
	if (counter!=0) {
		movement(varPawn, varMovement, varFunction);
	}

	if (resizeRendererToDisplaySize(renderer)) {
		const canvas = renderer.domElement;
		camera.aspect = canvas.clientWidth / canvas.clientHeight;
		camera.updateProjectionMatrix();
	}

	if (counter == 0) {
		const canvas = document.querySelector('#c');
		let aspectRatio = canvas.clientWidth / canvas.clientHeight;
		let d = 2;
		camera = new THREE.OrthographicCamera(-d * aspectRatio, d * aspectRatio, d, -d, 1, 1000); 
	
		camera.position.set(20, 20, 20);
		camera.lookAt(scene.position);
	}

	renderer.render(scene, camera);
}
render();


function deleteHouse (ncase, nhouse) {
	var concatS = "";
	deleteHouseD(concatS.concat(tabHouse[ncase],"_",nhouse));
}

function deleteHouseD (houseProperty) {
	requestAnimationFrame(render);
	scene.remove(window[houseProperty]);
}


function deleteHotel (ncase) {
	var concatS = "";
	deleteHotelD(concatS.concat(tabHotel[ncase]));
}

function deleteHotelD (hotelProperty) {
	requestAnimationFrame(render);
	scene.remove(window[hotelProperty]);
}


function deletePawn (pawn) {
	requestAnimationFrame(render);
	scene.remove(window[pawn]);
}


// à changer contre les drapeaux / doc API
function changeColorCase (cases, colore) {
	deleteCase(cases);
	loaderCases(cases, colore);
}

function deleteCase (cases) {
	requestAnimationFrame(render);
	scene.remove(window[cases]);
}


function loaderPlateau (load, test) {
  load.load('models/plateau/'+test+'.gltf', (gltf) => {
	requestAnimationFrame(render);
	const root = gltf.scene;
	scene.add(root);
  });
}


function loaderDrapeaux (load, test) {
	load.load('models/drapeaux/'+test+'.gltf', (gltf) => {
	  requestAnimationFrame(render);
	  const root = gltf.scene;
	  root.traverse((o) => {
            if (o.isMesh){
				//console.log(o);
				if(o.name === "Plane.018_0"){
					//o.material.color.setHex(0xFFFF00);// = new THREE.Color( 0xFFFF00 );
					o.material.color.set(0x000000);
				}
			}
		});
	  scene.add(root);
	});
  }


var plateauDrapeaux = [
				'f11', 'f12'
				]

for (var i = 0; i < 2; i++) {
var objVar = plateauDrapeaux[i];
var loader = new THREE.GLTFLoader();
loaderDrapeaux(loader, objVar);
}


var plateauObjects = [
				'collections', 'eau', 'egout', 'egout',
				'orangerie', 'parlement', 'pont', 'rail',
				'route', 'tram', 'campus', 'cascade'
] //maison

for (var i = 0; i < 12; i++) {
  var objVar = plateauObjects[i];
  var loader = new THREE.GLTFLoader();
  loaderPlateau(loader, objVar);
}


function loaderCases (cases, colorCase) {
    var load = new THREE.GLTFLoader();
    load.load('models/plateau/'+cases+'.gltf', (gltf) => {
        requestAnimationFrame(render);
        const root = gltf.scene;
        window[cases] = gltf.scene;
		scene.add(root);
	
        window[cases].traverse((o) => {
            if (o.isMesh)
                o.material.color = new THREE.Color( colorCase );
        });
    });
}


var plateauCases = [
			'case0', 'case1', 'case2', 'case3', 'case4', 'case5',
			'case6', 'case7', 'case8', 'case9', 'case10', 'case11',
			'case12', 'case13', 'case14', 'case15', 'case16', 'case17',
			'case18', 'case19', 'case20', 'case21', 'case22', 'case23',
			'case24', 'case25', 'case26', 'case27', 'case28', 'case29',
			'case30', 'case31', 'case32', 'case33', 'case34', 'case35',
			'case36', 'case37', 'case38', 'case39'
]

for(var i = 0; i < 40; i++){
  var objVar = plateauCases[i];
  loaderCases(objVar, 0xFFFFFF);
};


function loaderPawn (pawn, vdp) {
	load = new THREE.GLTFLoader();
	load.load('models/pions/'+pawn+'.gltf', (gltf) => {
		requestAnimationFrame(render);
		const root = gltf.scene;
		window[pawn] = gltf.scene;
		positionPawn = window[pawn];
		varMovement = vdp;
		varCase = tabCases[varMovement];

		var vdpx = varCase.x;
		vdpx = (Math.floor(vdpx * 100) / 100);

		var vdpz = varCase.z;
		vdpz = (Math.floor(vdpz * 100) / 100);
		root.position.set(vdpx, 2, vdpz);

		if (vdp >= 1 && vdp <= 10) {
			root.rotateY(Math.PI / -2);
		} else if (vdp >= 11 && vdp <= 20) {
			root.rotateY(Math.PI);
		} else if (vdp >= 21 && vdp <= 30) {
			root.rotateY(Math.PI / 2);
		} else {
			root.rotateY(Math.PI * 2);
		}

		/*root.traverse((o) => {
            if (o.isMesh){
				console.log(o);
				if(o.name === "Cube.002_3" || o.name === "Cube.002_4"){
					//o.material.color.setHex(0xFFFF00);// = new THREE.Color( 0xFFFF00 );
					o.material.color.set(0x000000);
				}
			}
		});*/
		scene.add(root);
	});
}


function loaderhouseProperty (ncase, nhouse) {
	var concatS = "";
	housePropertyL(concatS.concat(tabHouse[ncase],"_",nhouse));
}

function housePropertyL (houseProperty) {
	var load = new THREE.GLTFLoader();
	load.load('models/maisonPro/'+houseProperty+'.gltf', (gltf) => {
		requestAnimationFrame(render);
		const root = gltf.scene;
		window[houseProperty] = gltf.scene;
		scene.add(root);
	});
}


function loaderhotelProperty (ncase) {
	var concatS = "";
	hotelPropertyL(concatS.concat(tabHotel[ncase]));
}

function hotelPropertyL (hotelPropriete) {
	var load = new THREE.GLTFLoader();
	load.load('models/maisonPro/'+hotelPropriete+'.gltf', (gltf) => {
		requestAnimationFrame(render);
		const root = gltf.scene;
		window[hotelPropriete] = gltf.scene;
		scene.add(root);
	});
}


function movement (pawn, vdp, callback) {

	varFunction = callback;
	varMovement = vdp;
	varCase = tabCases[varMovement];
	varPawn = pawn;

	var ppx = window[pawn].position.x;
	ppx = (Math.floor(ppx * 100) / 100);
	
	var ppz = window[pawn].position.z;
	ppz = (Math.floor(ppz * 100) / 100);

	var vdpx = varCase.x;
	vdpx = (Math.floor(vdpx * 100) / 100);
	
	var vdpz = varCase.z;
	vdpz = (Math.floor(vdpz * 100) / 100);
	
	var xmin = 0.335;
	xmin = (Math.floor(xmin * 100) / 100);
	
	var xmax = 0.335*11.5;
	xmax = (Math.floor(xmax * 100) / 100);
	
	var zmin = 0.335;
	zmin = (Math.floor(zmin * 100) / 100);
	
	var zmax = 0.335*11.5;
	zmax = (Math.floor(zmax * 100) / 100);
	
	counter = 1;

	if (ppx == vdpx && ppz == vdpz) {
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
			console.log("1");
			requestAnimationFrame(render);
			window[pawn].position.z -= (Math.floor(0.01 * 100) / 100);
		} else {
			console.log("2");
			requestAnimationFrame(render);
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

	// La route d'en bas vers une case de la route à gauche
	} else if (ppx != vdpx && ppz != vdpz && vdpx == xmin && ppz == zmax){
		console.log("3");
		requestAnimationFrame(render);
		camera.zoom = 1.5;

		if (counter2 <= 50 && (window[pawn].position.x > 1.67 && window[pawn].position.x < 3.85))
			camera.position.y -= 0.01;

		window[pawn].position.x -= (Math.floor(0.01 * 100) / 100);
		counter2++;

		if (counter2 >= 75 && (window[pawn].position.x > 1.67 && window[pawn].position.x < 3.85))
			camera.position.x -= 0.01;
		else if (window[pawn].position.x > 0.33 && window[pawn].position.x < 1.67)
			camera.position.x -= 0.01;

	// La route d'en bas - Du coin gauche vers le coin gauche d'en haut
	} else if (ppx == xmin && vdpx == xmin && ppx == vdpx && ppz != vdpz) {
		// Pour revenir sur la même route (un tour du plateau)
		if (ppx == xmin && ppz == zmin){
			console.log("4");
			requestAnimationFrame(render);
			window[pawn].position.x += (Math.floor(0.01 * 100) / 100);
		} else {
			console.log("5");
			requestAnimationFrame(render);
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

	// La route gauche vers une case de la route en haut
	} else if (ppx != vdpx && ppz != vdpz && ppx == xmin && vdpz == zmin) {
		console.log("6");
		requestAnimationFrame(render);
		camera.zoom = 1.5;		

		if (counter2 <= 50 && (window[pawn].position.z > 1.67 && window[pawn].position.z < 3.85))
			camera.position.x -= 0.015;

		window[pawn].position.z -= (Math.floor(0.01 * 100) / 100);
		counter2++;

		if (counter2 >= 50 && (window[pawn].position.z > 1.67 && window[pawn].position.z < 3.85))
			camera.position.z -= 0.007;
		else if (window[pawn].position.z > 0.33 && window[pawn].position.z < 1.67)
			camera.position.z -= 0.007;

	// La route d'en haut - Le coin haut gauche vers le coin haut droite
	} else if (ppx != vdpx && ppz == vdpz && ppz == zmin && vdpz == zmin) {
		// Pour revenir sur la même route (un tour du plateau)
		if (ppx == xmax && ppz == zmin) {
			console.log("7");
			requestAnimationFrame(render);
			window[pawn].position.z += (Math.floor(0.01 * 100) / 100);
		} else {
			console.log("8");
			requestAnimationFrame(render);
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

	// L'opposer de la route d'en bas ->  haut (case 9 -> case 21)
	} else if (((ppx == vdpx) || (ppx != vdpx)) && ppz != vdpx && ppz == zmax && vdpz == zmin) {
		console.log("9");
		requestAnimationFrame(render);
			camera.zoom = 1.5;

			if (counter2 <= 50 && (window[pawn].position.x > 1.67 && window[pawn].position.x < 3.85))
				camera.position.y -= 0.01;

			window[pawn].position.x -= (Math.floor(0.01 * 100) / 100);
			counter2++;

			if (counter2 >= 75 && (window[pawn].position.x > 1.67 && window[pawn].position.x < 3.85))
				camera.position.x -= 0.01;
			else if (window[pawn].position.x > 0.33 && window[pawn].position.x < 1.67)
				camera.position.x -= 0.01;

	// La route de droite - Le coin haut droite vers le coin bas droite
	} else if (ppx == xmax && vdpx == xmax && ppx == vdpx && ppz != vdpz) {
		// Pour revenir sur la même route (un tour du plateau)
		if (ppx == xmax && ppz == zmax) {
			console.log("10");
			requestAnimationFrame(render);
			window[pawn].position.x -= (Math.floor(0.01 * 100) / 100);
		} else {
			console.log("11");
			requestAnimationFrame(render);
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

	// La route d'en haut vers une case de la route à droite
	} else if (ppx != vdpx && ppz != vdpz && vdpx == xmax && ppz == zmin) {
		if (ppx == xmax && ppz == zmin) {
			console.log("12");
			requestAnimationFrame(render);
			window[pawn].position.z += (Math.floor(0.01 * 100) / 100);
		} else {
			console.log("13");
			requestAnimationFrame(render);
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

	// L'opposer de la route de gauche ->  droit (case 19 -> case 31)
	} else if (ppx != vdpx && ((ppz != vdpz) || (ppz == vdpz)) && ppx == xmin && vdpx == xmax) {
		console.log("14");
		requestAnimationFrame(render);
			camera.zoom = 1.5;		

			if (counter2 <= 50 && (window[pawn].position.z > 1.67 && window[pawn].position.z < 3.85))
				camera.position.x -= 0.015;

			window[pawn].position.z -= (Math.floor(0.01 * 100) / 100);
			counter2++;

			if (counter2 >= 50 && (window[pawn].position.z > 1.67 && window[pawn].position.z < 3.85))
				camera.position.z -= 0.007;
			else if (window[pawn].position.z > 0.33 && window[pawn].position.z < 1.67)
				camera.position.z -= 0.007;

	// La route de droite vers une case de la route en bas
	} else if(ppx != vdpx && ppz != vdpz && ppx == xmax && vdpz == zmax) {
		console.log("15");
		requestAnimationFrame(render);
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

	// L'opposer de la route du haut ->  bas (case 29 -> case 1)
	} else if (((ppx == vdpx) || (ppx != vdpx)) && ppz != vdpz && ppz == zmin && vdpz == xmax) {
		console.log("16");
		requestAnimationFrame(render);
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

	// L'opposer de la route de droite ->  gauche (case 39 -> case 11)
	} else if (ppx != vdpx && ((ppz != vdpz) || (ppz == vdpz)) && ppx == xmax && vdpx == xmin) {
		console.log("17");
		requestAnimationFrame(render);
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

	// La route de gauche vers une case de la route en bas
	} else if (ppx != vdpx && ppz != vdpz && ppx == xmin && vdpz == zmax) {
		console.log("18");
		requestAnimationFrame(render);
			camera.zoom = 1.5;		

			if (counter2 <= 50 && (window[pawn].position.z > 1.67 && window[pawn].position.z < 3.85))
				camera.position.x -= 0.015;

			window[pawn].position.z -= (Math.floor(0.01 * 100) / 100);
			counter2++;

			if (counter2 >= 50 && (window[pawn].position.z > 1.67 && window[pawn].position.z < 3.85))
				camera.position.z -= 0.007;
			else if (window[pawn].position.z > 0.33 && window[pawn].position.z < 1.67)
				camera.position.z -= 0.007;

	// La route d'en haut vers une case de la route de gauche
	} else if((ppx != vdpx) && (ppz != vdpz) && (ppz == zmin) && (vdpx == xmin)) {
		console.log("19");
		requestAnimationFrame(render);
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

	// La route de droite vers une case de la route d'en haut
	} else if(ppx != vdpx && ppz != vdpz && ppx == xmax && vdpz == zmin) {
		console.log("20");
		requestAnimationFrame(render);
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

	// La route d'en bas vers une case de la route de droite
	} else if(ppx != vdpx && ppz != vdpz && ppz == vdpx) {
		console.log("21");
		requestAnimationFrame(render);
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
