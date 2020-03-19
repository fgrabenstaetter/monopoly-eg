let varMovement, vdp, varPawn, counter = 0; 
var pawn, window;


function getScene () {
	let scene = new THREE.Scene();
	scene.background = new THREE.Color(0x78e9f8);

	return scene;
}


function getCamera () {
	let aspectRatio = window.innerWidth / window.innerHeight;
	let d = 2;
	let camera = new THREE.OrthographicCamera(-d * aspectRatio, d * aspectRatio, d, -d, 1, 1000); 

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
	let renderer = new THREE.WebGLRenderer({ antialiasing: true });
	renderer.setClearColor(0xffffff, 1);
	renderer.setPixelRatio(window.devicePixelRatio);
	renderer.setSize(window.innerWidth, window.innerHeight);

	renderer.outputEncoding = THREE.sRGBEncoding;
	renderer.gammaOutput = true;
	renderer.gammaFactor = 2.2;

	//On ajoute l'objet à la page html
	var element = document.getElementsByClassName('board-container');
	element.appendChild(renderer.domElement);
	return renderer;
}


function render () {	
	requestAnimationFrame(render);
	if (counter!=0)
		movement(varPawn,varMovement);

	renderer.render(scene, camera);
}


function deleteHouse (houseProperty) {
	scene.remove(window[houseProperty]);
}


function deleteHotel (hotelProperty) {
	scene.remove(window[hotelProperty]);
}


function loaderPlateau (load, test) {
  load.load('models/plateau/'+test+'.gltf', (gltf) => {
    const root = gltf.scene;
    scene.add(root);
  });
}

var plateauObjects = [
				'collections', 'eau', 'egout', 'orangerie',
				'maison', 'parlement', 'pont', 'rail',
				'route', 'tram', 'campus', 'cascade'
]

for(var i = 0; i < 12; i++){
  var objVar = plateauObjects[i];
  var loader = new THREE.GLTFLoader();
  loaderPlateau(loader, objVar);
}


function loaderCases (cases) {
	var load = new THREE.GLTFLoader();
	load.load('models/plateau/'+cases+'.gltf', (gltf) => {
		const root = gltf.scene;
		window[cases] = gltf.scene;
		scene.add(root);
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
  loaderCases(objVar);
};


function loaderPawn (pawn) {
	var load = new THREE.GLTFLoader();
	load.load('models/pions/'+pawn+'.gltf', (gltf) => {
		const root = gltf.scene;
		window[pawn] = gltf.scene;
		root.position.set(0.335*11.5,2,0.335*11.5);
		root.rotateY(-1.6);
		scene.add(root);
	});
}


function loaderHouseProperty (houseProperty) {
	var load = new THREE.GLTFLoader();
	load.load('models/maisonPro/'+houseProperty+'.gltf', (gltf) => {
		const root = gltf.scene;
		window[houseProperty] = gltf.scene;
		scene.add(root);
	});
}


function loaderHotelProperty (hotelPropriete) {
	var load = new THREE.GLTFLoader();
	load.load('models/maisonPro/'+hotelPropriete+'.gltf', (gltf) => {
		const root = gltf.scene;
		window[hotelPropriete] = gltf.scene;
		scene.add(root);
	});
}


function movement (pawn, vdp) {
	varMovement = vdp;
	varPawn = pawn;
	
	
	var ppx = window[pawn].position.x;
	ppx = (Math.floor(ppx * 100) / 100);
	
	var ppz = window[pawn].position.z;
	ppz = (Math.floor(ppz * 100) / 100);

	var vdpx = vdp.x;
	vdpx = (Math.floor(vdpx * 100) / 100);
	
	var vdpz = vdp.z;
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
	

	if (ppx == vdpx && ppz == vdpz)
		counter = 0;

	// La route d'en bas - Du coin droit vers le coin gauche
	if (ppx != vdpx && ((ppz == vdpz) || (ppz != vdpz)) && ppz == zmax && vdpz == zmax) {
		// Pour revenir sur la même route (un tour du plateau)
		if (ppx == xmin && ppz == zmax)
			window[pawn].position.z -= (Math.floor(0.01 * 100) / 100);
		else
			window[pawn].position.x -= (Math.floor(0.01 * 100) / 100);

	// La route d'en bas vers une case de la route à gauche
	} else if (ppx != vdpx && ppz != vdpz && vdpx == xmin && ppz == zmax)
		window[pawn].position.x -= (Math.floor(0.01 * 100) / 100);

	// La route d'en bas - Du coin gauche vers le coin gauche d'en haut
	else if (ppx == xmin && vdpx == xmin && ppx == vdpx && ppz != vdpz) {
		// Pour revenir sur la même route (un tour du plateau)
		if (ppx == xmin && ppz == zmin)
			window[pawn].position.x += (Math.floor(0.01 * 100) / 100);
		else 
			window[pawn].position.z -= (Math.floor(0.01 * 100) / 100);

	// La route gauche vers une case de la route en haut
	} else if (ppx != vdpx && ppz != vdpz && ppx == xmin && vdpz == zmin)
		window[pawn].position.z -= (Math.floor(0.01 * 100) / 100);

	// La route d'en haut - Le coin haut gauche vers le coin haut droite
	else if (ppx != vdpx && ppz == vdpz && ppz == zmin && vdpz == zmin) {
		// Pour revenir sur la même route (un tour du plateau)
		if (ppx == xmax && ppz == zmin)
			window[pawn].position.z += (Math.floor(0.01 * 100) / 100);
		else
			window[pawn].position.x += (Math.floor(0.01 * 100) / 100);

	// L'opposer de la route d'en bas ->  haut (case 9 -> case 21)
	} else if (((ppx == vdpx) || (ppx != vdpx)) && ppz != vdpx && ppz == zmax && vdpz == zmin)
		window[pawn].position.x -= (Math.floor(0.01 * 100) / 100);

	// La route d'en haut - Le coin haut droite vers le coin bas droite
	else if (ppx == xmax && vdpx == xmax && ppx == vdpx && ppz != vdpz) {
		// Pour revenir sur la même route (un tour du plateau)
		if (ppx == xmax && ppz == zmax)
			window[pawn].position.x -= (Math.floor(0.01 * 100) / 100);
		else
			window[pawn].position.z += (Math.floor(0.01 * 100) / 100);

	// La route d'en haut vers une case de la route à droite
	} else if (ppx != vdpx && ppz != vdpz && vdpx == xmax && ppz == zmin)
		window[pawn].position.x += (Math.floor(0.01 * 100) / 100);

	// L'opposer de la route de gauche ->  droit (case 19 -> case 31)
	else if (ppx != vdpx && ((ppz != vdpz) || (ppz == vdpz)) && ppx == xmin && vdpx == xmax)
		window[pawn].position.z -= (Math.floor(0.01 * 100) / 100);

	// La route de droite vers une case de la route en bas
	else if(ppx != vdpx && ppz != vdpz && ppx == xmax && vdpz == zmax)
		window[pawn].position.z += (Math.floor(0.01 * 100) / 100);

	// L'opposer de la route du haut ->  bas (case 29 -> case 1)
	else if (((ppx == vdpx) || (ppx != vdpx)) && ppz != vdpz && ppz == zmin && vdpz == xmax)
		window[pawn].position.x += (Math.floor(0.01 * 100) / 100);

	// L'opposer de la route de droite ->  gauche (case 39 -> case 11)
	else if (ppx != vdpx && ((ppz != vdpz) || (ppz == vdpz)) && ppx == xmax && vdpx == xmin)
		window[pawn].position.z += (Math.floor(0.01 * 100) / 100);

	// La route de gauche vers une case de la route en bas
	else if (ppx != vdpx && ppz != vdpz && ppx == xmin && vdpz == zmax)
		window[pawn].position.z -= (Math.floor(0.01 * 100) / 100);

	// La route d'en haut vers une case de la route de gauche
	else if((ppx != vdpx) && (ppz != vdpz) && (ppz == zmin) && (vdpx == xmin))
		window[pawn].position.x += (Math.floor(0.01 * 100) / 100);

	// La route de droite vers une case de la route d'en haut
	else if(ppx != vdpx && ppz != vdpz && ppx == xmax && vdpz == zmin)
		window[pawn].position.z += (Math.floor(0.01 * 100) / 100);

	// La route d'en bas vers une case de la route de droite
	else if(ppx != vdpx && ppz != vdpz && ppz == vdpx)
		window[pawn].position.x -= (Math.floor(0.01 * 100) / 100);
}
