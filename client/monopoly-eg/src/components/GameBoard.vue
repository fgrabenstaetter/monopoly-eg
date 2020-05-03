<template>
  <canvas id="c"></canvas>
</template>

<script>
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader';
import TWEEN from '@tweenjs/tween.js';

/**
 * @vuese
 * @group Components
 * Plateau du jeu (utilisé dans le jeu)
 */
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

        drapLight: { 
            'd1' : new THREE.Vector3(1.3514562845230103, -0.0018858909606933594, 1.6896905899047852), 
            'd2' : new THREE.Vector3(0.6791576743125916, -0.0018858909606933594, 1.6896905899047852), 
            'd3' : new THREE.Vector3(-0.03322577476501465, -0.0018858909606933594, 1.6896905899047852), 
            'd4' : new THREE.Vector3(-0.33810311555862427, -0.0018858909606933594, 1.6896905899047852), 
            'd5' : new THREE.Vector3(-1.010401725769043, -0.0018858909606933594, 1.6896905899047852), 
            'd6' : new THREE.Vector3(-1.3478100299835205, -0.0018858909606933594, 1.6896905899047852), 
            'd7' : new THREE.Vector3(-1.8835428953170776, -0.0018858909606933594, 1.3527071475982666), 
            'd8' : new THREE.Vector3(-1.8835428953170776, -0.0018858909606933594, 1.015750765800476), 
            'd9' : new THREE.Vector3(-1.8835428953170776, -0.0018858909606933594, 0.6755693554878235), 
            'd10' : new THREE.Vector3(-1.8835428953170776, -0.0018858909606933594, 0.335395872592926), 
            'd11' : new THREE.Vector3(-1.8835428953170776, -0.0018858909606933594, -0.014368116855621338), 
            'd12' : new THREE.Vector3(-1.8835428953170776, -0.0018858909606933594, -0.3273006081581116), 
            'd13' : new THREE.Vector3(-1.8835428953170776, -0.0018858909606933594, -1.001229166984558), 
            'd14' : new THREE.Vector3(-1.8835428953170776, -0.0018858909606933594, -1.3446118831634521), 
            'd15' : new THREE.Vector3(-1.3478100299835205, -0.0018858909606933594, -1.8752185106277466), 
            'd16' : new THREE.Vector3(-0.6823535561561584, -0.0018858909606933594, -1.8752185106277466), 
            'd17' : new THREE.Vector3(-0.3403828740119934, -0.0018858909606933594, -1.8752185106277466), 
            'd18' : new THREE.Vector3(0.011489272117614746, -0.0018858909606933594, -1.8752185106277466), 
            'd19' : new THREE.Vector3(0.33431607484817505, -0.0018858909606933594, -1.8752185106277466), 
            'd20' : new THREE.Vector3(0.6739761829376221, -0.0018858909606933594, -1.8752185106277466), 
            'd21' : new THREE.Vector3(1.0119102001190186, -0.0018858909606933594, -1.8752185106277466), 
            'd22' : new THREE.Vector3(1.3486751317977905, -0.0018858909606933594, -1.8752185106277466), 
            'd23' : new THREE.Vector3(1.6675397157669067, -0.0018858909606933594, -1.3483989238739014), 
            'd24' : new THREE.Vector3(1.6675397157669067, -0.0018858909606933594, -1.0041176080703735), 
            'd25' : new THREE.Vector3(1.6675397157669067, -0.0018858909606933594, -0.3317294120788574), 
            'd26' : new THREE.Vector3(1.6675397157669067, -0.0018858909606933594, 0.03394165635108948), 
            'd27' : new THREE.Vector3(1.6675397157669067, -0.0018858909606933594, 0.6849400997161865), 
            'd28' : new THREE.Vector3(1.6675397157669067, -0.0018858909606933594, 1.3527071475982666)
        },

        /**
         * Tableau de nom des maisons
         * @type {array} 
         */
        // tabHouseCoord: {
        //     'M1_1_1' : new THREE.Vector3(1.6812185049057007, -0.018597006797790527, -0.03439660370349884),
        //         'M1_1_2' : new THREE.Vector3(1.6012185049057007, -0.018597006797790527, -0.03439660370349884),
        // //      'M1_1_3' : new THREE.Vector3(1.6812185049057007, -0.018597006797790527, -0.03439660370349884),
        // //      'M1_1_4' : new THREE.Vector3(1.6812185049057007, -0.018597006797790527, -0.03439660370349884),
        // //     'M1_2' : new THREE.Vector3(, , ),
        // //     'M2_1' : new THREE.Vector3(, , ),
        // //     'M2_2' : new THREE.Vector3(, , ),
        // //     'M2_3' : new THREE.Vector3(, , ),
        // //     'M3_1' : new THREE.Vector3(, , ),
        // //     'M3_2' : new THREE.Vector3(, , ),
        // //     'M3_3' : new THREE.Vector3(, , ),
        // //     'M4_1' : new THREE.Vector3(, , ),
        // //     'M4_2' : new THREE.Vector3(, , ),
        // //     'M4_3' : new THREE.Vector3(, , ),
        // //     'M5_1' : new THREE.Vector3(, , ),
        // //     'M5_2' : new THREE.Vector3(, , ),
        // //     'M5_3' : new THREE.Vector3(, , ),
        // //     'M6_1' : new THREE.Vector3(, , ),
        // //     'M6_2' : new THREE.Vector3(, , ),
        // //     'M6_3' : new THREE.Vector3(, , ),
        // //     'M7_1' : new THREE.Vector3(, , ),
        // //     'M7_2' : new THREE.Vector3(, , ),
        // //     'M7_3' : new THREE.Vector3(, , ),
        // //     'M8_1' : new THREE.Vector3(, , ),
        // //     'M8_2' : new THREE.Vector3(, , )
        // },

        // Variables pour le rendu de la scène
        renderer: null,
        scene: null,
        camera: null,
        gltfLoader: null,

        // Variables pour le déplacement du pion
        varMovement: null,
        varCase: null,
        posPawn: null,

        // Zoom par défaut à 1 - activé
        zoomOn: 1,
        // Case d'arrivée du pion
        vdp: null,

        // Tableau qui contiendra les pions
        objs: []

      }
  },
    /**
     * @vuese
     * Paramètres pour le rendu de la scène, caméra, renderer, lumière
     */
  mounted() {
        const canvas = document.querySelector('#c');
        const HEIGHT = canvas.clientHeight;
        const WIDTH = canvas.clientWidth;
        const W_HEIGHT = window.innerHeight;
        const W_WIDTH = window.innerWidth;
        const aspectRatio = WIDTH / HEIGHT;
        
        const renderer = this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
        renderer.setViewport(0,0,W_WIDTH,W_HEIGHT);
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
                    this.loaderLightFlag(28);
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

        // On indique que le plateau est chargé
        this.$parent.gameReady();
  },
  methods: {
    /**
     * @vuese
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
     * @vuese
     * Adapte le zoom auto en fonction des paramètres utilisateur
     */
    refreshPlayerAutoZoom() {
        this.zoomOnOff(!!this.$parent.loggedUser.settings.autoZoom);
    },

    /**
     * @vuese
     * Supprime une maison
     * @arg {int} ncase: Numero de case (int), nhouse: Numero de maison (int)
     */
    deleteHouse(ncase, nhouse) {
        let concatS = "";
        this.deleteHouseD(concatS.concat(this.tabHouse[ncase], "_", nhouse));
    },

    /**
     * @vuese
     * Supprime une maison (Auxiliaire)
     * @arg {string} houseProperty de la maison
     */
    deleteHouseD(houseProperty) {
        this.scene.remove(this.objs[houseProperty]);
    },

    /**
     * @vuese
     * Supprime un hotel
     * @arg {int} ncase: Numero de case
     */
    deleteHotel(ncase) {
        this.scene.remove(this.objs[`h${ncase}`]);
        // let concatS = "";
        // this.deleteHotelD(concatS.concat(this.tabHotel[ncase]));
    },

    /**
     * @vuese
     * Supprime un hotel (Auxiliaire)
     * @arg {string} hotelProperty: Numero de l'hotel
     */
    deleteHotelD(hotelProperty) {
        this.scene.remove(this.objs[hotelProperty]);
    },

    /**
     * @vuese
     * Supprime un pion
     * @arg {string} pawn: nom du pion
     */
    deletePawn(pawn) {
        this.scene.remove(this.objs[pawn]);
    },


    /**
     * @vuese
     * Modifie la couleur du drapeau
     * @arg Numéro de la case ; Couleur du drapeau (hexadecimal, ex : '#FFFFFF')
     */
    changeColorFlag(cell, color) {
        this.deleteFlag(cell);
        this.loaderFlag(cell, color);
    },

    /**
     * @vuese
     * Supprime un drapeau
     * @arg Numéro de la case
     */
    deleteFlag(cell) {
        this.scene.remove(this.objs[`d${cell}`]);
    },

    /**
     * @vuese
     * Ajoute un drapeau de la couleur du joueur sur la propriété
     * @arg Numéro de la case ; Couleur du drapeau (hexadecimal, ex : '#FFFFFF')
     */
    loaderFlag(cell, color) {
        this.gltfLoader.load(`/assets/models/drapeaux/d${cell}.gltf`, (gltf) => {
            const root = gltf.scene;
            this.objs[`d${cell}`] = gltf.scene;
            this.objs[`d${cell}`].traverse((o) => {
                if (o.isMesh) {
                    //console.log(o.name);
                    if (o.name === this.drapPlane[`d${cell}`] || o.name === 'Plane11.001_0')
                        o.material.color = new THREE.Color(color);
                }
            });
            
            console.log(this.objs[`d${cell}`].children[0].position);
            // const colorLight = 0x404040;
            // const intensity = 0.1;
            // const light1 = new THREE.DirectionalLight( colorLight, intensity);
            // light1.position.set(this.drapLight[`d${cell}`].x, this.drapLight[`d${cell}`].y, this.drapLight[`d${cell}`].z);
            // this.scene.add(light1);
            this.scene.add(root);
        });
    },


    loaderLightFlag(cell) {
        for (this.i = 1; this.i <= cell; this.i++) {
            //console.log(this.i);
            const colorLight = 0x404040;
            const intensity = 0.1;
            const light1 = new THREE.DirectionalLight( colorLight, intensity);
            light1.position.set(this.drapLight[`d${this.i}`].x, this.drapLight[`d${this.i}`].y, this.drapLight[`d${this.i}`].z);
            this.scene.add(light1);
        }

    },

    /**
     * @vuese
     * Efface l'hypothèque de la propriété
     * @arg Numéro de la case
     */
    deleteHypotheque(cell) {
        this.scene.remove(this.objs[`hyp${cell}`]);
    },

    /**
     * @vuese
     * Charge l'hypothèque pour la propriété
     * @arg Numéro de la case
     */
    loaderHypotheque(cell) {
        this.gltfLoader.load(`/assets/models/hypotheque/hyp1.gltf`, (gltf) => {
            const root = gltf.scene;
            this.objs[`hyp${cell}`] = gltf.scene;
            if ((cell > 0 && cell < 10) || (cell > 20 && cell < 30)) 
                this.objs[`hyp${cell}`].children[0].position.set(this.tabCases[cell].x, this.tabCases[cell].y, this.tabCases[cell].z-0.17);
            else 
                this.objs[`hyp${cell}`].children[0].position.set(this.tabCases[cell].x-0.17, this.tabCases[cell].y, this.tabCases[cell].z);
            
            this.scene.add(root);
        });
    },

    /**
     * @vuese
     * Ajoute un pion à la case qu'on veut
     * @arg {string} pawn: Le nom du pion (Ex: 'moto'), {int} vdp: Un entier entre [0-39]
     */
    loaderPawn(pawn, vdp) {
        this.gltfLoader.load('/assets/models/pions/' + pawn + '.gltf', (gltf) => {
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
     * @vuese
     * Fonction auxiliaire - Charge une maison à la case spécifiée
     * @arg {int} ncase Chiffre de la case, {int} nhouse Entier entre [1-4]. 
     *  1 -> met la case en bas à droite de la case
     * 	2 -> met la case en bas à gauche de la case
     * 	3 -> met la case en haut à droite de la case
     *  4 -> met la case en haut à gauche de la case
     */
    loaderHouseProperty(ncase, nhouse) {
        let concatS = "";
        this.housePropertyL(concatS.concat(this.tabHouse[ncase], "_", nhouse));
    },

    // loaderHouseProperty(ncase, nhouse) {
    //     //let concatS = "";
    //     //console.log(nhouse);
    //     this.house = '_' + nhouse;
    //     //console.log(`${this.tabHouse[ncase]}${this.flo}`);
    //     this.housePropertyL(`${this.tabHouse[ncase]}${this.house}`);
    // },

    /**
     * @vuese
     * Fonction prinicpale - Charge une maison à la case spécifiée
     * @arg {string} houseProperty:  Nom de la maison (Ex: M3_1_2)
     */
    housePropertyL(houseProperty) {
        this.gltfLoader.load('/assets/models/maisonPro/' + houseProperty + '.gltf', (gltf) => {          
            const root = gltf.scene;
            this.objs[houseProperty] = gltf.scene;
            //console.log(root);
            this.scene.add(root);
        });
    },

    /**
     * @vuese
     * Fonction auxiliaire - Charge un hôtel à la case spécifiée
     * @arg {int} ncase: Chiffre de la case 
     */
    loaderHotelProperty(ncase) {
        //let concatS = "";
        //this.hotelPropertyL(concatS.concat(this.tabHotel[ncase]));
        this.hotelPropertyL(ncase);
    },

    /**
     * @vuese
     * Fonction principale - Charge un hôtel à la case spécifiée
     * @arg {string} hotelPropriete: Nom de l'hôtel (Ex: H1_2)
     */
    // hotelPropertyL(hotelPropriete) {
    //     this.gltfLoader.load('/assets/models/maisonPro/' + hotelPropriete + '.gltf', (gltf) => {
    //         const root = gltf.scene;
    //         this.objs[hotelPropriete] = gltf.scene;
    //         this.scene.add(root);
    //     });
    // },

     hotelPropertyL(cell) {
        this.gltfLoader.load('/assets/models/maisonPro/hotel.gltf', (gltf) => {
            const root = gltf.scene;
            console.log(root);
            this.objs[`h${cell}`] = gltf.scene;
            if ((cell > 0 && cell < 10) || (cell > 20 && cell < 30)) 
                this.objs[`h${cell}`].children[0].position.set(this.tabCases[cell].x, this.tabCases[cell].y, this.tabCases[cell].z-0.17);
            else {
                this.objs[`h${cell}`].children[0].rotateY(Math.PI / -2);
                this.objs[`h${cell}`].children[0].position.set(this.tabCases[cell].x-0.17, this.tabCases[cell].y, this.tabCases[cell].z);
            }

            this.scene.add(root);
        });
    },

    /**
     * @vuese
     * Active ou désactive le zoom sur le plateau
     * @arg {int} number: Entier entre [0-1]. 0 pour désactiver le zoom et 1 pour l'activer
     */
    zoomOnOff(number) {
        this.zoomOn = number;
    },

    /**
     * @vuese
     * Animation pour le déplacement des pions
     * @arg {int} pawn: Nom du pion, {int} vectorToAnimate: La position du pion,
     * {int} target: Les coordonnées de la case d'arrivée,
     * {int} options: Options - Callback
     */
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
                        if (_this.zoomOn == 1)
                            _this.tweenCamera(_this.tabCases[_this.vdp], 3140);
                    } else if (_this.vdp == 0 || _this.vdp == 1 || _this.vdp == 39 || _this.vdp == 24 || _this.vdp == 21) {
                        _this.animateVector3(pawn, vectorToAnimate, _this.tabCases[20], options);
                        if (_this.zoomOn == 1)
                            _this.tweenCamera(_this.tabCases[20], 3140);
                    }
                } else if ((pawn.position.x.toFixed(2) == 0.34 || (pawn.position.x.toFixed(2) == 0.33)) && 
                            (pawn.position.z.toFixed(2) == 0.33 || pawn.position.z.toFixed(2) == 0.34)) {
                    if (_this.vdp == 18) {
                        pawn.rotateY(Math.PI / 2);
                        _this.animateVector3(pawn, vectorToAnimate, _this.tabCases[_this.vdp], options);
                        if (_this.zoomOn == 1)
                            _this.tweenCamera(_this.tabCases[_this.vdp], 3140);
                    } 
                    if (_this.vdp != 18) {
                        pawn.rotateY(Math.PI / -2);
                        if (_this.vdp >= 21 && _this.vdp <= 30) {
                            _this.animateVector3(pawn, vectorToAnimate, _this.tabCases[_this.vdp], options);
                            if (_this.zoomOn == 1)	
                               _this.tweenCamera(_this.tabCases[_this.vdp], 3140);
                        } else if (_this.vdp == 0 || _this.vdp == 1 || _this.vdp == 39 || _this.vdp == 31) {
                            _this.animateVector3(pawn, vectorToAnimate, _this.tabCases[30], options);
                            if (_this.zoomOn == 1)
                                _this.tweenCamera(_this.tabCases[30], 3140);
                        }	
                    }
                } else if (pawn.position.x.toFixed(2) == 3.85 && pawn.position.z.toFixed(2) == 0.34) {
                    pawn.rotateY(Math.PI / -2);
                    if (_this.vdp >= 31 && _this.vdp <= 39) {
                        _this.animateVector3(pawn, vectorToAnimate, _this.tabCases[_this.vdp], options);	
                       if (_this.zoomOn == 1)
                           _this.tweenCamera(_this.tabCases[_this.vdp], 3140);
                    } else if (_this.vdp == 0 || _this.vdp == 1 || _this.vdp == 11 || _this.vdp == 15) {
                        _this.animateVector3(pawn, vectorToAnimate, _this.tabCases[0], options);
                        if (_this.zoomOn == 1)
                            _this.tweenCamera(_this.tabCases[0], 3140);				
                    }
                } else if (pawn.position.x.toFixed(2) == 3.85 && pawn.position.z.toFixed(2) == 3.85) {
                    pawn.rotateY(Math.PI / -2);
                    if (_this.vdp >= 1 && _this.vdp <= 10) {
                        _this.animateVector3(pawn, vectorToAnimate, _this.tabCases[_this.vdp], options);		
                        if (_this.zoomOn == 1)
                            _this.tweenCamera(_this.tabCases[_this.vdp], 3140);
                    } else if (_this.vdp == 24 || _this.vdp == 11 || _this.vdp == 15) {		
                        _this.animateVector3(pawn, vectorToAnimate, _this.tabCases[10], options);
                        if (_this.zoomOn == 1)
                            _this.tweenCamera(_this.tabCases[10], 3140);	
                    }
                }
                if (_this.tabCases[_this.vdp].x.toFixed(2) == to.x.toFixed(2) &&
                    _this.tabCases[_this.vdp].z.toFixed(2) == to.z.toFixed(2)) {
                    if (typeof options === 'function') options();	
                }
                    
            });

        // start the tween
        tweenVector3.start();
                
        // return the tween in case we want to manipulate it later on
        return tweenVector3;
    },

    /**
     * @vuese
     * Réplace la caméra au centre du plateau
     * @arg {string} position: Les coordonnées de la case d'arrivée,
     * {int} time: La durée du mouvement de la caméra
     */
    test(position, time) {
        new TWEEN.Tween(this.camera.position).to(position, time).easing(TWEEN.Easing.Quadratic.InOut)
        .start();
    },

    /**
     * @vuese
     * Déplace la caméra en suivant le pion et fait un zoom sur le pion
     * @arg {string} position: Les coordonnées de la case d'arrivée,
     * {int} time: La durée du mouvement de la caméra
     */
    tweenCamera(position, time){
        const _this = this;
        new TWEEN.Tween(_this.camera.position).to(position, time).easing(TWEEN.Easing.Quadratic.InOut)
        .onUpdate(function(){
            if (_this.zoomOn == 1) {
                _this.camera.near = -5;
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
     * @vuese
     * Déplace le pion sur le plateau
     * @arg {string} pawn: Le nom du pion (Ex: 'moto'), {int} vdp Un entier entre [0-39],
     * callback: Appel d'un callback()
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

        if (this.posPawn == 7 && this.vdp == 3) {
            // Reculez de 4 cases - carte chance
			console.log("Reculez de 4 cases");
			this.animateVector3(this.objs[pawn], this.objs[pawn].position, this.tabCases[3], callback);
			if (this.zoomOn == 1)
				this.tweenCamera(this.tabCases[this.vdp], 3140);
		} else if (this.posPawn == 22 && this.vdp == 18) {
            // Reculez de 4 cases - carte chance
			console.log("Reculez de 4 cases");
			this.animateVector3(this.objs[pawn], this.objs[pawn].position, this.tabCases[20], callback);
			if (this.zoomOn == 1)
                this.tweenCamera(this.tabCases[20], 3140);
        } else if (this.posPawn == 36 && this.vdp == 32) {
            // Reculez de 4 cases - carte chance
			console.log("Reculez de 4 cases");
			this.animateVector3(this.objs[pawn], this.objs[pawn].position, this.tabCases[32], callback);
			if (this.zoomOn == 1)
				this.tweenCamera(this.tabCases[this.vdp], 3140);
		} else if (this.vdp > this.posPawn && this.vdp < 10){
			// Déplacement sur la route d'en bas
			console.log("1");
			this.animateVector3(this.objs[pawn], this.objs[pawn].position, this.tabCases[this.vdp], callback);
			if (this.zoomOn == 1)
				this.tweenCamera(this.tabCases[this.vdp], 3140); 
		} else if (this.vdp == 10 && this.posPawn < 10) {
			// Pour aller dans le coin en bas à gauche
			console.log("2");
			this.animateVector3(this.objs[pawn], this.objs[pawn].position, this.tabCases[10], callback);
			if (this.zoomOn == 1)
				this.tweenCamera(this.tabCases[this.vdp], 3140);
		} else if (this.posPawn == 10 && this.vdp > 10 && this.vdp < 20) {
			// Du coin en bas à gauche vers la route gauche
			console.log("3");
			this.animateVector3(this.objs[pawn], this.objs[pawn].position, this.tabCases[this.vdp], callback);
			if (this.zoomOn == 1)
				this.tweenCamera(this.tabCases[this.vdp], 3140);
        } else if (this.posPawn >= 0 && this.posPawn < 10 && this.vdp > 10 && this.vdp < 22) {
			// De la route d'en bas à la route gauche
			console.log("4");
			this.animateVector3(this.objs[pawn], this.objs[pawn].position, this.tabCases[10], callback);
			if (this.zoomOn == 1)
				this.tweenCamera(this.tabCases[10], 3140);
		} else if (this.posPawn > 10 && this.posPawn < 20 && this.vdp > 10 && this.vdp < 20) {
			// Déplacement sur la route gauche
			console.log("5");
			this.animateVector3(this.objs[pawn], this.objs[pawn].position, this.tabCases[this.vdp], callback);
			if (this.zoomOn == 1)
				this.tweenCamera(this.tabCases[this.vdp], 3140);
		} else if (this.vdp == 20 && this.posPawn < 20) {
			// Aller dans le coin en haut à gauche
			console.log("6");
			this.animateVector3(this.objs[pawn], this.objs[pawn].position, this.tabCases[20], callback);
			if (this.zoomOn == 1)
				this.tweenCamera(this.tabCases[this.vdp], 3140);
		} else if (this.posPawn == 20 && this.vdp > 20 && this.vdp < 30) { 
			// Du coin en haut à gauche vers la route d'en haut
			console.log("7");
			this.animateVector3(this.objs[pawn], this.objs[pawn].position, this.tabCases[this.vdp], callback);
			if (this.zoomOn == 1)
				this.tweenCamera(this.tabCases[this.vdp], 3140);
		} else if (this.posPawn >= 10 && this.posPawn < 20 && this.vdp > 20 && this.vdp <= 31) { 
			// De la route gauche à la route d'en haut
			console.log("8");
			this.animateVector3(this.objs[pawn], this.objs[pawn].position, this.tabCases[20], callback);
			if (this.zoomOn == 1)
				this.tweenCamera(this.tabCases[20], 3140);
		} else if (this.posPawn > 20 && this.posPawn < 30 && this.vdp > 20 && this.vdp < 30) { 
			// Déplacement sur la route d'en haut
			console.log("9");
			this.animateVector3(this.objs[pawn], this.objs[pawn].position, this.tabCases[this.vdp], callback);
			if (this.zoomOn == 1)
				this.tweenCamera(this.tabCases[this.vdp], 3140);
		} else if (this.vdp == 30 && this.posPawn < 30) {
			// Aller dans le coin en haut à droite
			console.log("10");
			this.animateVector3(this.objs[pawn], this.objs[pawn].position, this.tabCases[30], callback);
			if (this.zoomOn == 1)
				this.tweenCamera(this.tabCases[this.vdp], 3140);
		} else if (this.posPawn == 30 && this.vdp > 30) {
			// Du coin en haut à droite vers la route de droite
			console.log("11");
			this.animateVector3(this.objs[pawn], this.objs[pawn].position, this.tabCases[this.vdp], callback);
			if (this.zoomOn == 1)
				this.tweenCamera(this.tabCases[this.vdp], 3140);
		} else if (this.posPawn >= 20 && this.posPawn < 30 && this.vdp > 30 && this.vdp <= 39) {
			// Route d'en haut à la route de droite
			console.log("12");
			this.animateVector3(this.objs[pawn], this.objs[pawn].position, this.tabCases[30], callback);
			if (this.zoomOn == 1)
				this.tweenCamera(this.tabCases[30], 3140);
		} else if (this.posPawn > 30 && this.posPawn < 39 && this.vdp >= 31 && this.vdp <= 39) { 
			// Déplacement sur la route de droite
			console.log("13");
			this.animateVector3(this.objs[pawn], this.objs[pawn].position, this.tabCases[this.vdp], callback);
			if (this.zoomOn == 1)
				this.tweenCamera(this.tabCases[this.vdp], 3140);
		} else if (this.posPawn >= 30 && this.posPawn <= 39 && this.vdp == 0) {
			// Aller dans le coin en bas à droite
			console.log("14");
			this.animateVector3(this.objs[pawn], this.objs[pawn].position, this.tabCases[0], callback);
			if (this.zoomOn == 1)
				this.tweenCamera(this.tabCases[this.vdp], 3140);
		} else if (this.posPawn == 0 && this.vdp > 0) {
			// Du coin en bas à droite vers la route d'en bas
			console.log("15");
			this.animateVector3(this.objs[pawn], this.objs[pawn].position, this.tabCases[this.vdp], callback);
			if (this.zoomOn == 1)
				this.tweenCamera(this.tabCases[this.vdp], 3140);
		} else if (this.posPawn >= 30 && this.posPawn <= 39 && this.vdp >= 0 && this.vdp <= 11) {
			// De la route de droite à la route d'en bas
			console.log("16");
			this.animateVector3(this.objs[pawn], this.objs[pawn].position, this.tabCases[0], callback);
			if (this.zoomOn == 1)
				this.tweenCamera(this.tabCases[0], 3140);
		} else if (this.posPawn >= 20 && this.posPawn <= 30 && this.vdp >= 0 && this.vdp <= 10) {
			// De la route en haut à la route d'en bas
			console.log("17");
			this.animateVector3(this.objs[pawn], this.objs[pawn].position, this.tabCases[30], callback);
			if (this.zoomOn == 1)
				this.tweenCamera(this.tabCases[30], 3140);
		} else if ((this.posPawn == 2 || this.posPawn == 7) && this.vdp == 39) {
			// De la route en bas à la route de droite - case 39
			console.log("18");
			this.animateVector3(this.objs[pawn], this.objs[pawn].position, this.tabCases[10], callback);
			if (this.zoomOn == 1)
				this.tweenCamera(this.tabCases[10], 3140);
		} else if ((this.posPawn == 2 || this.posPawn == 7) && this.vdp == 24) {
			// De la route en bas à la route d'en haut - case 24
			console.log("19");
			this.animateVector3(this.objs[pawn], this.objs[pawn].position, this.tabCases[10], callback);
			if (this.zoomOn == 1)
				this.tweenCamera(this.tabCases[10], 3140);
		} else if ((this.posPawn == 2 || this.posPawn == 7) && (this.vdp == 0 || this.vdp == 1)) {
			// De la route en bas à la case de départ
			console.log("20");
			this.animateVector3(this.objs[pawn], this.objs[pawn].position, this.tabCases[10], callback);
			if (this.zoomOn == 1)
				this.tweenCamera(this.tabCases[10], 3140);
		} else if (this.posPawn == 22 && (this.vdp == 15 || this.vdp == 11)) {
			// De la route en haut à la route de gauche - case 11 ou case 15
			console.log("21");
			this.animateVector3(this.objs[pawn], this.objs[pawn].position, this.tabCases[30], callback);
			if (this.zoomOn == 1)
				this.tweenCamera(this.tabCases[30], 3140);
		} else if ((this.posPawn == 36 || this.posPawn == 33) && (this.vdp == 24 || this.vdp == 15 || this.vdp == 11)) {
			// De la route a droite à la route d'en haut - case 24
			console.log("22");
			this.animateVector3(this.objs[pawn], this.objs[pawn].position, this.tabCases[0], callback);
			if (this.zoomOn == 1)
				this.tweenCamera(this.tabCases[0], 3140);
		} else if (this.posPawn == 17 && (this.vdp == 0) || this.vdp == 1) {
			// De la route à gauche à la case de départ
			console.log("23");
			this.animateVector3(this.objs[pawn], this.objs[pawn].position, this.tabCases[20], callback);
			if (this.zoomOn == 1)
				this.tweenCamera(this.tabCases[20], 3140);
		}
            
    }

  }
}
</script>