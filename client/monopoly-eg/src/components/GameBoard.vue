<template>
  <canvas id="c"></canvas>
</template>

<script>
import * as THREE from 'three';
// import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader';
import TWEEN from '@tweenjs/tween.js';

export default {
  name: 'GameBoard',
  data() {
      return {
          /**
         * Tableau de Pion
         * @type {array} 
         */
        pawn: [
            'moto', 'citroen C4', 
            'boat', 'montgolfiere', 
            'overboard', 'tracteur', 
            'schoolbus', 'camion'
        ],

        /**
         * Tableau de position des cases
         * @type {array} 
         */
        tabCases: {
            0 : new THREE.Vector3(0.335*11.5, 2, 0.335*11.5),      

            1  : new THREE.Vector3(0.335*10, 2, 0.335*11.5),
            2  : new THREE.Vector3(0.335*9, 2, 0.335*11.5), 
            3  : new THREE.Vector3(0.335*8, 2, 0.335*11.5), 
            4  : new THREE.Vector3(0.335*7, 2, 0.335*11.5), 
            5  : new THREE.Vector3(0.335*6, 2, 0.335*11.5),
            6  : new THREE.Vector3(0.335*5, 2, 0.335*11.5), 
            7  : new THREE.Vector3(0.335*4, 2, 0.335*11.5), 
            8  : new THREE.Vector3(0.335*3, 2, 0.335*11.5), 
            9  : new THREE.Vector3(0.335*2, 2, 0.335*11.5), 
            
            10  : new THREE.Vector3(0.335*1,2,0.335*11.5),
            
            11  : new THREE.Vector3(0.335*1,2,0.335*10), 
            12  : new THREE.Vector3(0.335*1,2,0.335*9),
            13  : new THREE.Vector3(0.335*1,2,0.335*8), 
            14  : new THREE.Vector3(0.335*1,2,0.335*7), 
            15  : new THREE.Vector3(0.335*1,2,0.335*6), 
            16  : new THREE.Vector3(0.335*1,2,0.335*5), 
            17  : new THREE.Vector3(0.335*1,2,0.335*4), 
            18  : new THREE.Vector3(0.335*1,2,0.335*3),
            19  : new THREE.Vector3(0.335*1,2,0.335*2), 
            
            20  : new THREE.Vector3(0.335*1,2,0.335*1), 
            
            21  : new THREE.Vector3(0.335*2,2,0.335*1), 
            22  : new THREE.Vector3(0.335*3,2,0.335*1), 
            23  : new THREE.Vector3(0.335*4,2,0.335*1), 
            24  : new THREE.Vector3(0.335*5,2,0.335*1), 
            25  : new THREE.Vector3(0.335*6,2,0.335*1), 
            26  : new THREE.Vector3(0.335*7,2,0.335*1), 
            27  : new THREE.Vector3(0.335*8,2,0.335*1), 
            28  : new THREE.Vector3(0.335*9,2,0.335*1), 
            29  : new THREE.Vector3(0.335*10,2,0.335*1), 
            
            30  : new THREE.Vector3(0.335*11.5,2,0.335*1), 
            
            31  : new THREE.Vector3(0.335*11.5,2,0.335*2), 
            32  : new THREE.Vector3(0.335*11.5,2,0.335*3), 
            33  : new THREE.Vector3(0.335*11.5,2,0.335*4), 
            34  : new THREE.Vector3(0.335*11.5,2,0.335*5), 
            35  : new THREE.Vector3(0.335*11.5,2,0.335*6), 
            36  : new THREE.Vector3(0.335*11.5,2,0.335*7), 
            37  : new THREE.Vector3(0.335*11.5,2,0.335*8), 
            38  : new THREE.Vector3(0.335*11.5,2,0.335*9), 
            39  : new THREE.Vector3(0.335*11.5,2,0.335*10) 
        },

        /**
         * Tableau de nom des drapeaux
         * @type {array} 
         */
        plateauDrapeaux: [
            'd1', 'd3', 'd5', 'd6', 'd8', 'd9',
            'd11', 'd12', 'd13', 'd14', 'd15', 'd16', 'd18',
            'd19', 'd21', 'd23', 'd24', 'd25', 'd26', 'd27',
            'd28', 'd29', 'd31', 'd32', 'd34', 'd35', 'd37',
            'd39'
        ],

        /**
         * Tableau de nom des maisons
         * @type {array} 
         */
        tabHouse: {
            1 : 'M1_1',
            3 : 'M1_2',
            6 : 'M2_1',
            8 : 'M2_2',
            9 : 'M2_3',
            11 : 'M3_1',
            13 : 'M3_2',
            14 : 'M3_3',
            16 : 'M4_1',
            18 : 'M4_2',
            19 : 'M4_3',
            21 : 'M5_1',
            23 : 'M5_2',
            24 : 'M5_3',
            26 : 'M6_1',
            27 : 'M6_2',
            29 : 'M6_3',
            31 : 'M7_1',
            32 : 'M7_2',
            34 : 'M7_3',
            37 : 'M8_1',
            39 : 'M8_2'
        },

        /**
         * Tableau de nom des hotels
         * @type {array} 
         */
        tabHotel: {
            1 : 'H1_1',
            3 : 'H1_2',
            6 : 'H2_1',
            8 : 'H2_2',
            9 : 'H2_3',
            11 : 'H3_1',
            13 : 'H3_2',
            14 : 'H3_3',
            16 : 'H4_1',
            18 : 'H4_2',
            19 : 'H4_3',
            21 : 'H5_1',
            23 : 'H5_2',
            24 : 'H5_3',
            26 : 'H6_1',
            27 : 'H6_2',
            29 : 'H6_3',
            31 : 'H7_1',
            32 : 'H7_2',
            34 : 'H7_3',
            37 : 'H8_1',
            39 : 'H8_2'
        },

        /**
         * Tableau de nom des drapeaux
         * @type {array} 
         */
        drapPlane: { 
            'd1' : 'Plane1_0',
            'd3' : 'Plane3_0',
            'd5' : 'Plane5_0',
            'd6' : 'Plane6_0',
            'd8' : 'Plane8_0',
            'd9' : 'Plane9_0',
            'd11' : 'Plane11_0',
            'd12' : 'Plane12_0',
            'd13' : 'Plane13_0',
            'd14' : 'Plane14_0',
            'd15' : 'Plane15_0',
            'd16' : 'Plane16_0',
            'd18' : 'Plane18_0',
            'd19' : 'Plane19_0',
            'd21' : 'Plane21_0',
            'd23' : 'Plane23_0',
            'd24' : 'Plane24_0',
            'd25' : 'Plane25_0',
            'd26' : 'Plane26_0',
            'd27' : 'Plane27_0',
            'd28' : 'Plane28_0',
            'd29' : 'Plane29_0',
            'd31' : 'Plane31_0',
            'd32' : 'Plane32_0',
            'd34' : 'Plane34_0',
            'd35' : 'Plane35_0',
            'd37' : 'Plane37_0',
            'd39' : 'Plane39_0'
        },

        renderer: null,
        scene: null,
        camera: null,
        gltfLoader: null,

        varMovement: null,
        varCase: null,
        posPawn: null,

        zoomOn: 1,
        vdp: null,

        objs: []

      }
  },
  mounted() {
        const canvas = document.querySelector('#c');
        const HEIGHT = canvas.clientHeight;
        const WIDTH = canvas.clientWidth;
        const W_HEIGHT = window.innerHeight;
        const W_WIDTH = window.innerWidth;
        const aspectRatio = WIDTH / HEIGHT;
        
        const renderer = this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
        renderer.setViewport(0,0,W_WIDTH,W_HEIGHT);
        // renderer.setPixelRatio(pixelRatio);
        renderer.setSize(WIDTH, HEIGHT);

        /**
         * USER SETTINGS
         */
        this.refreshPlayerGraphicsQuality();
        this.refreshPlayerAutoZoom();

        this.gltfLoader = new GLTFLoader();
        const dracoLoader = new DRACOLoader();
        dracoLoader.setDecoderPath('/assets/draco/');
        this.gltfLoader.setDRACOLoader(dracoLoader);

        /**
         * RENDERER
         */
        renderer.outputEncoding = THREE.sRGBEncoding;
        renderer.gammaOutput = true;
        renderer.gammaFactor = 2.2;
        renderer.shadowMap.enabled = true;
        window.addEventListener('resize', handleWindowResize, false);

        /**
         * SCENE
         */
        this.scene = new THREE.Scene();
        const scene = this.scene;

        /**
         * CAMERA
         */
        const d = 2;
        this.camera = new THREE.OrthographicCamera(-d * aspectRatio, d * aspectRatio, d, -d, 1, 1000);
        this.camera.position.set(20, 20, 20);
        this.camera.lookAt(this.scene.position);
        const camera = this.camera;

        /**
         * OBJETS glTF PLATEAU
         */
        {
            const plateauObjects = ['plateau']; // Plateau texture UV
            
            for (const i in plateauObjects) {
                this.gltfLoader.load('/assets/models/plateau/' + plateauObjects[i] + '.gltf', (gltf) => {
                    const root = gltf.scene;
                    this.scene.add(root);
                }, function(prog) {
                    console.log(prog);
                }, function ( error ) {

                    console.error( error );

                });
            }
        }

        /**
         * LUMIERE
         */
        {
            const color = 0xFFFFFF;
            const intensity = 1;
            const light = new THREE.DirectionalLight(color, intensity);
            light.position.set(5, 10, 2);
            this.scene.add(light);
            this.scene.add(light.target);
        }

        function handleWindowResize() {
            const canvas = renderer.domElement;
            const width = canvas.clientWidth;
            const height = canvas.clientHeight;
            renderer.setSize(width, height);
            camera.aspect = width / height;
            camera.updateProjectionMatrix();
        }
        
        /**
         * Génère le rendu de la scène 
         * @return {needSize} Booléen 
         */
        function render(time) {
            TWEEN.update(time);

            renderer.render(scene, camera);
            requestAnimationFrame(render);
        }
        requestAnimationFrame(render);
  },
  methods: {
    /**
     * Adapte la qualité des graphismes en fonctions des paramètres utilisateur
     */
    refreshPlayerGraphicsQuality() {
        if (this.$parent.loggedUser.settings.graphicsQuality == 0)
            this.renderer.setPixelRatio(0.5);
        else if (this.$parent.loggedUser.settings.graphicsQuality == 2)
            this.renderer.setPixelRatio(window.devicePixelRatio);
        else
            this.renderer.setPixelRatio(1);
    },

    /**
     * Adapte le zoom auto en fonction des paramètres utilisateur
     */
    refreshPlayerAutoZoom() {
        this.zoomOnOff(!!this.$parent.loggedUser.settings.autoZoom);
    },

    /**
     * Supprime une maison
     * @param {int} Numero de case
     * @param {int} Numero de maison
     */
    deleteHouse(ncase, nhouse) {
        let concatS = "";
        this.deleteHouseD(concatS.concat(this.tabHouse[ncase], "_", nhouse));
    },

    /**
     * Supprime une maison (Auxiliaire)
     * @param {string} Numero de la maison
     */
    deleteHouseD(houseProperty) {
        this.scene.remove(this.objs[houseProperty]);
    },

    /**
     * Supprime un hotel
     * @param {int} Numero de case
     */
    deleteHotel(ncase) {
        let concatS = "";
        this.deleteHotelD(concatS.concat(this.tabHotel[ncase]));
    },

    /**
     * Supprime un hotel (Auxiliaire)
     * @param {string} Numero de l'hotel
     */
    deleteHotelD(hotelProperty) {
        // requestAnimationFrame(render);
        this.scene.remove(this.objs[hotelProperty]);
    },

    /**
     * Supprime un pion
     * @param {string} nom du pion
     */
    deletePawn(pawn) {
        // requestAnimationFrame(render);
        this.scene.remove(this.objs[pawn]);
    },


    /**
     * Modifie la couleur du drapeau
     * @param {string} Nom du drapeau
     * @param {string} Nom de la couleur
     */
    changeColorFlag(flag, colore) {
        this.deleteFlag(flag);
        this.loaderFlag(flag, colore);
    },

    /**
     * Supprime un drapeau
     * @param {string} Nom du drapeau
     */
    deleteFlag(flag) {
        this.scene.remove(this.objs[flag]);
    },

    /**
     * Ajoute un drapeau de la couleur du joueur sur la propriété
     * @param {string} Nom du drapeau
     * @param {string} Nom de la couleur
     */
    loaderFlag(flag, colore) {
        this.gltfLoader.load('/assets/models/drapeaux/' + flag + '.gltf', (gltf) => {
            // requestAnimationFrame(render);
            const root = gltf.scene;
            this.objs[flag] = gltf.scene;
            this.objs[flag].traverse((o) => {
                if (o.isMesh) {
                    if (o.name === this.drapPlane[flag])
                        o.material.color = new THREE.Color(colore);
                }
            });
            this.scene.add(root);
        });
    },

    /**
     * Ajoute un pion à la case qu'on veut
     * @param {string} pawn Le nom du pion (Ex: 'moto')
     * @param {int} vdp Un entier entre [0-39]
     */
    loaderPawn(pawn, vdp) {
        this.gltfLoader.load('/assets/models/pions/' + pawn + '.gltf', (gltf) => {
            // requestAnimationFrame(render);
            const root = gltf.scene;
            this.objs[pawn] = gltf.scene;

            this.varMovement = vdp;
            this.varCase = this.tabCases[this.varMovement];

            let vdpx = this.varCase.x;
            //vdpx = (Math.floor(vdpx * 100) / 100);
            let vdpz = this.varCase.z;
            //vdpz = (Math.floor(vdpz * 100) / 100);
            root.position.set(vdpx, 2, vdpz);

            if (vdp >= 0 && vdp <= 9) {
                root.rotateY(Math.PI / -2);
                //this.objs[pawn].position.x -= (Math.floor(0.01 * 100) / 100);
                //console.log(this.objs[pawn].position.x );
            } else if (vdp >= 10 && vdp <= 19) {
                root.rotateY(Math.PI);
                //this.objs[pawn].position.z -= (Math.floor(0.01 * 100) / 100);
            } else if (vdp >= 20 && vdp <= 29) {
                root.rotateY(Math.PI / 2);
                //this.objs[pawn].position.x += (Math.floor(0.01 * 100) / 100);
            } else {
                root.rotateY(Math.PI * 2);
                //this.objs[pawn].position.z += (Math.floor(0.01 * 100) / 100);
            }

            this.scene.add(root);
        });
    },

    /**
     * Fonction auxiliaire - Charge une maison à la case spécifiée
     * @param {int} ncase Chiffre de la case
     * @param {int} nhouse Entier entre [1-4]. 1 -> met la case en bas à droite de la case
     * 					 					 2 -> met la case en bas à gauche de la case
     * 										 3 -> met la case en haut à droite de la case
     * 										 4 -> met la case en haut à gauche de la case
     */
    loaderHouseProperty(ncase, nhouse) {
        let concatS = "";
        this.housePropertyL(concatS.concat(this.tabHouse[ncase], "_", nhouse));
    },

    /**
     * Fonction prinicpale - Charge une maison à la case spécifiée
     * @param {string} houseProperty  Nom de la maison (Ex: M3_1_2)
     */
    housePropertyL(houseProperty) {
        this.gltfLoader.load('models/maisonPro/' + houseProperty + '.gltf', (gltf) => {
            const root = gltf.scene;
            this.objs[houseProperty] = gltf.scene;
            this.scene.add(root);
        });
    },

    /**
     * Fonction auxiliaire - Charge un hôtel à la case spécifiée
     * @param {int} ncase Chiffre de la case 
     */
    loaderHotelProperty(ncase) {
        let concatS = "";
        this.hotelPropertyL(concatS.concat(this.tabHotel[ncase]));
    },

    /**
     * Fonction principale - Charge un hôtel à la case spécifiée
     * @param {string} hotelPropriete Nom de l'hôtel (Ex: H1_2)
     */
    hotelPropertyL(hotelPropriete) {
        this.gltfLoader.load('models/maisonPro/' + hotelPropriete + '.gltf', (gltf) => {
            const root = gltf.scene;
            this.objs[hotelPropriete] = gltf.scene;
            this.scene.add(root);
        });
    },

    /**
     * Active ou désactive le zoom sur le plateau
     * @param {int} number Entier entre [0-1]. 0 pour désactiver le zoom et 1 pour l'activer
     */
    zoomOnOff(number) {
        this.zoomOn = number;
    },

    /* Animates a Vector3 to the target */
    animateVector3(pawn, vectorToAnimate, target, options){
        options = options || {};
        // get targets from options or set to defaults
        var to = target || THREE.Vector3(),
            easing = options.easing || TWEEN.Easing.Quadratic.InOut,
            duration = options.duration || 3140;
        // create the tween
        const _this = this;
        var tweenVector3 = new TWEEN.Tween(vectorToAnimate)
            .to({ x: to.x, y: to.y, z: to.z, }, duration)
            .easing(easing)
            .onUpdate(function () {
                
            })
            .onComplete(function () {
                if ((pawn.position.x.toFixed(2) == 0.33 || pawn.position.x.toFixed(2) == 0.34) && 
                        pawn.position.z.toFixed(2) == 3.85) {
                    pawn.rotateY(Math.PI / -2);
                    if (_this.vdp >= 11 && _this.vdp <= 20) {
                        _this.animateVector3(pawn, vectorToAnimate, _this.tabCases[_this.vdp], options);
                        _this.tweenCamera(_this.tabCases[_this.vdp], 3140);
                    } else if (_this.vdp == 0 || _this.vdp == 1 || _this.vdp == 39 || _this.vdp == 24 || _this.vdp == 21) {
                        _this.animateVector3(pawn, vectorToAnimate, _this.tabCases[20], options);
                        _this.tweenCamera(_this.tabCases[20], 3140);
                    }
                } else if (pawn.position.x.toFixed(2) == 0.34 && (pawn.position.z.toFixed(2) == 0.33 || 
                            pawn.position.z.toFixed(2) == 0.34)) {
                    pawn.rotateY(Math.PI / -2);
                    if (_this.vdp >= 21 && _this.vdp <= 30) {
                        _this.animateVector3(pawn, vectorToAnimate, _this.tabCases[_this.vdp], options);	
                        _this.tweenCamera(_this.tabCases[_this.vdp], 3140);
                    } else if (_this.vdp == 0 || _this.vdp == 1 || _this.vdp == 39 || _this.vdp == 31) {
                        _this.animateVector3(pawn, vectorToAnimate, _this.tabCases[30], options);
                        _this.tweenCamera(_this.tabCases[30], 3140);
                    }
                } else if (pawn.position.x.toFixed(2) == 3.85 && pawn.position.z.toFixed(2) == 0.34) {
                    pawn.rotateY(Math.PI / -2);
                    if (_this.vdp >= 31 && _this.vdp <= 39) {
                        _this.animateVector3(pawn, vectorToAnimate, _this.tabCases[_this.vdp], options);	
                        _this.tweenCamera(_this.tabCases[_this.vdp], 3140);
                    } else if (_this.vdp == 0 || _this.vdp == 1 || _this.vdp == 11 || _this.vdp == 15) {
                        _this.animateVector3(pawn, vectorToAnimate, _this.tabCases[0], options);
                        _this.tweenCamera(_this.tabCases[0], 3140);				
                    }
                } else if (pawn.position.x.toFixed(2) == 3.85 && pawn.position.z.toFixed(2) == 3.85) {
                    pawn.rotateY(Math.PI / -2);
                    if (_this.vdp >= 1 && _this.vdp <= 10) {
                        _this.animateVector3(pawn, vectorToAnimate, _this.tabCases[_this.vdp], options);		
                        _this.tweenCamera(_this.tabCases[_this.vdp], 3140);
                    } else if (_this.vdp == 24 || _this.vdp == 11 || _this.vdp == 15) {		
                        _this.animateVector3(pawn, vectorToAnimate, _this.tabCases[10], options);
                        _this.tweenCamera(_this.tabCases[10], 3140);	
                    }
                }
                if (_this.tabCases[_this.vdp].x.toFixed(2) == to.x.toFixed(2) && _this.tabCases[_this.vdp].z.toFixed(2) == to.z.toFixed(2)) {
                    if (typeof options === 'function') options();	
                }
                    
            });

        // start the tween

        tweenVector3.start();
        //console.log(pawn.position.x.toFixed(2));
        // console.log(pawn.position.z.toFixed(2));
        // console.log(tabCases[vdp].x.toFixed(2));
        // console.log(to.x.toFixed(2));
        // console.log("coin");
        // console.log(coin);
                
        // return the tween in case we want to manipulate it later on
        return tweenVector3;
    },

    test(position, time) {
        new TWEEN.Tween(this.camera.position).to(position, time).easing(TWEEN.Easing.Quadratic.InOut)
        .start();
    },

    tweenCamera(position, time){
        const _this = this;
        new TWEEN.Tween(_this.camera.position).to(position, time).easing(TWEEN.Easing.Quadratic.InOut)
        .onUpdate(function(){
            if (_this.zoomOn == 1) {
                _this.camera.near = -0.5;
                _this.camera.zoom = 1.5;
                _this.camera.updateProjectionMatrix();
            }
        })
        .onComplete(function() {
            if (position == _this.tabCases[_this.vdp]) {
                let target = new THREE.Vector3(20, 20, 20);
                _this.test(target, 1500);
                _this.camera.zoom = 1;
            }
            _this.camera.updateProjectionMatrix();
        })
    .start();
    },

    /**
     * Déplace le pion sur le plateau
     * @param {string} pawn Le nom du pion (Ex: 'moto')
     * @param {int} vdp Un entier entre [0-39] 
     * @callback callback Appel d'un callback()
     */
    movement (pawn, caseArr, callback) {
        let i;
        this.vdp = caseArr;

        for (i = 0; i < 40; i++){
            if ((Math.floor(this.objs[pawn].position.x *100)/ 100) == (Math.floor(this.tabCases[i].x * 100) / 100) && 
                    (Math.floor(this.objs[pawn].position.z * 100)/100) == (Math.floor(this.tabCases[i].z * 100) / 100)) {
                this.posPawn = i;
            }
        }

            if(this.vdp > this.posPawn && this.vdp < 10){
                // route en bas
                console.log("1");
                //movementAux(0, pawn, vdp, callback);
                this.animateVector3(this.objs[pawn], this.objs[pawn].position, this.tabCases[this.vdp], callback);
                if (this.zoomOn == 1)
                    this.tweenCamera(this.tabCases[this.vdp], 3140); 

            } else if (this.vdp == 10 && this.posPawn < 10) {
                // pour aller dans le coins en bas a gauche
                console.log("2");
                //movementAux(1, pawn, 10, callback);
                this.animateVector3(this.objs[pawn], this.objs[pawn].position, this.tabCases[10], callback);
                if (this.zoomOn == 1)
                    this.tweenCamera(this.tabCases[this.vdp], 3140);
            } else if (this.posPawn == 10 && this.vdp > 10 && this.vdp < 20) {
                // aller du coin en bas a gauche vers la route de gauche
                console.log("3");
                //movementAux(0, pawn, vdp, callback);
                this.animateVector3(this.objs[pawn], this.objs[pawn].position, this.tabCases[this.vdp], callback);
                if (this.zoomOn == 1)
                    this.tweenCamera(this.tabCases[this.vdp], 3140);
            } else if (this.posPawn >= 0 && this.posPawn < 10 && this.vdp > 10 && this.vdp < 22) {
                // de la route en bas à la route à gauche
                console.log("4");
                //movementAux(1, pawn, 10, callback);
                this.animateVector3(this.objs[pawn], this.objs[pawn].position, this.tabCases[10], callback);
                if (this.zoomOn == 1)
                    this.tweenCamera(this.tabCases[10], 3140);
            } else if (this.posPawn > 10 && this.posPawn < 20 && this.vdp > 10 && this.vdp < 20) {
                // route de gauche vers la route à gauche
                console.log("5");
                //movementAux(0, pawn, vdp, callback);
                this.animateVector3(this.objs[pawn], this.objs[pawn].position, this.tabCases[this.vdp], callback);
                if (this.zoomOn == 1)
                    this.tweenCamera(this.tabCases[this.vdp], 3140);
            } else if (this.vdp == 20 && this.posPawn < 20) {
                // pour aller dans le coin en haut a gauche
                console.log("6");
                //movementAux(1, pawn, 20, callback);
                this.animateVector3(this.objs[pawn], this.objs[pawn].position, this.tabCases[20], callback);
                if (this.zoomOn == 1)
                    this.tweenCamera(this.tabCases[this.vdp], 3140);
            } else if (this.posPawn == 20 && this.vdp > 20 && this.vdp < 30) { 
                // aller du coin en haut a gauche vers la route d'en haut
                console.log("7");
                //movementAux(0, pawn, vdp, callback);
                this.animateVector3(this.objs[pawn], this.objs[pawn].position, this.tabCases[this.vdp], callback);
                if (this.zoomOn == 1)
                    this.tweenCamera(this.tabCases[this.vdp], 3140);
                // changer en <= 31 avant c'était < 30
            } else if (this.posPawn >= 10 && this.posPawn < 20 && this.vdp > 20 && this.vdp <= 31) { 
                // de la route gauche à la route d'en haut
                console.log("8");
                //movementAux(1, pawn, 20, callback);
                this.animateVector3(this.objs[pawn], this.objs[pawn].position, this.tabCases[20], callback);
                if (this.zoomOn == 1)
                    this.tweenCamera(this.tabCases[20], 3140);
            } else if (this.posPawn > 20 && this.posPawn < 30 && this.vdp > 20 && this.vdp < 30) { 
                // route d'en haut vers la route d'en haut
                console.log("9");
                //movementAux(0, pawn, vdp, callback);
                this.animateVector3(this.objs[pawn], this.objs[pawn].position, this.tabCases[this.vdp], callback);
                if (this.zoomOn == 1)
                    this.tweenCamera(this.tabCases[this.vdp], 3140);
            } else if (this.vdp == 30 && this.posPawn < 30) {
                // pour aller dans le coin en haut a droite
                console.log("10");
                //movementAux(1, pawn, 30, callback);
                this.animateVector3(this.objs[pawn], this.objs[pawn].position, this.tabCases[30], callback);
                if (this.zoomOn == 1)
                    this.tweenCamera(this.tabCases[this.vdp], 3140);
            } else if (this.posPawn == 30 && this.vdp > 30) {
                // aller du coin en haut a droite vers la route a droite
                console.log("11");
                //movementAux(0, pawn, vdp, callback);
                this.animateVector3(this.objs[pawn], this.objs[pawn].position, this.tabCases[this.vdp], callback);
                if (this.zoomOn == 1)
                    this.tweenCamera(this.tabCases[this.vdp], 3140);
            } else if (this.posPawn >= 20 && this.posPawn < 30 && this.vdp > 30 && this.vdp <= 39) {
                // de la route d'en haut à la route de droite
                console.log("12");
                //movementAux(1, pawn, 30, callback);
                this.animateVector3(this.objs[pawn], this.objs[pawn].position, this.tabCases[30], callback);
                if (this.zoomOn == 1)
                    this.tweenCamera(this.tabCases[30], 3140);
            } else if (this.posPawn > 30 && this.posPawn < 39 && this.vdp >= 31 && this.vdp <= 39) { 
                // route de droite vers la route de droite
                console.log("13");
                //movementAux(0, pawn, vdp, callback);
                this.animateVector3(this.objs[pawn], this.objs[pawn].position, this.tabCases[this.vdp], callback);
                if (this.zoomOn == 1)
                    this.tweenCamera(this.tabCases[this.vdp], 3140);
            } else if (this.posPawn >= 30 && this.posPawn <= 39 && this.vdp == 0) {
                // pour aller dans le coin en bas à droite
                console.log("14");
                //movementAux(0, pawn, 0, callback);
                this.animateVector3(this.objs[pawn], this.objs[pawn].position, this.tabCases[0], callback);
                if (this.zoomOn == 1)
                    this.tweenCamera(this.tabCases[this.vdp], 3140);
            } else if (this.posPawn == 0 && this.vdp > 0) {
                // aller du coin en bas a droite vers la route d'en bas
                console.log("15");
                //movementAux(0, pawn, vdp, callback);
                this.animateVector3(this.objs[pawn], this.objs[pawn].position, this.tabCases[this.vdp], callback);
                if (this.zoomOn == 1)
                    this.tweenCamera(this.tabCases[this.vdp], 3140);
            } else if (this.posPawn >= 30 && this.posPawn <= 39 && this.vdp >= 0 && this.vdp <= 11) {
                // de la route de droite à la route d'en bas
                console.log("16");
                //movementAux(1, pawn, 0, callback);
                this.animateVector3(this.objs[pawn], this.objs[pawn].position, this.tabCases[0], callback);
                if (this.zoomOn == 1)
                    this.tweenCamera(this.tabCases[0], 3140);
            } else if (this.posPawn >= 20 && this.posPawn <= 30 && this.vdp >= 0 && this.vdp <= 10) {
                // de la route en haut à la route d'en bas
                console.log("17");
                //movementAux(1, pawn, 30, callback);
                this.animateVector3(this.objs[pawn], this.objs[pawn].position, this.tabCases[30], callback);
                if (this.zoomOn == 1)
                    this.tweenCamera(this.tabCases[30], 3140);
            } else if ((this.posPawn == 2 || this.posPawn == 7) && this.vdp == 39) {
                // de la route en bas à la route de droite case 39
                console.log("18");
                //movementAux(1, pawn, 10, callback);
                this.animateVector3(this.objs[pawn], this.objs[pawn].position, this.tabCases[10], callback);
                if (this.zoomOn == 1)
                    this.tweenCamera(this.tabCases[10], 3140);
            } else if ((this.posPawn == 2 || this.posPawn == 7) && this.vdp == 24) {
                // de la route en bas à la route d'en haut case 24
                console.log("19");
                //movementAux(1, pawn, 10, callback);
                this.animateVector3(this.objs[pawn], this.objs[pawn].position, this.tabCases[10], callback);
                if (this.zoomOn == 1)
                    this.tweenCamera(this.tabCases[10], 3140);
            } else if ((this.posPawn == 2 || this.posPawn == 7) && (this.vdp == 0 || this.vdp == 1)) {
                // de la route en bas à la case de départ
                console.log("20");
                //movementAux(1, pawn, 10, callback);
                this.animateVector3(this.objs[pawn], this.objs[pawn].position, this.tabCases[10], callback);
                if (this.zoomOn == 1)
                    this.tweenCamera(this.tabCases[10], 3140);
            } else if (this.posPawn == 22 && (this.vdp == 15 || this.vdp == 11)) {
                // de la route en haut à la route de gauche case 11 ou case 15
                console.log("21");
                //movementAux(1, pawn, 30, callback);
                this.animateVector3(this.objs[pawn], this.objs[pawn].position, this.tabCases[30], callback);
                if (this.zoomOn == 1)
                    this.tweenCamera(this.tabCases[30], 3140);
            } else if ((this.posPawn == 36 || this.posPawn == 33) && (this.vdp == 24 || this.vdp == 15 || this.vdp == 11)) {
                // de la route a droite à la route d'en haut case 24
                console.log("22");
                //movementAux(1, pawn, 0, callback);
                this.animateVector3(this.objs[pawn], this.objs[pawn].position, this.tabCases[0], callback);
                if (this.zoomOn == 1)
                    this.tweenCamera(this.tabCases[0], 3140);
            } else if (this.posPawn == 17 && (this.vdp == 0) || this.vdp == 1) {
                // de la route a gauche à la case de départ
                console.log("23");
                //movementAux(1, pawn, 20, callback);
                this.animateVector3(this.objs[pawn], this.objs[pawn].position, this.tabCases[20], callback);
                if (this.zoomOn == 1)
                    this.tweenCamera(this.tabCases[20], 3140);
            }
    }

  }
}
</script>