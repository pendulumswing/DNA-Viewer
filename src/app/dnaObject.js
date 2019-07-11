/*********************************************************************************
DNA Bases - Creates an interactive 3D pair of Base Pairs.
*********************************************************************************/
// var THREE = require('three'); 

'use strict';

// import {Canvas, Base, Spring} from './dnaObjectClasses.js';
import * as THREE from 'three';
import * as dat from 'dat.gui';
import OrbitControls from 'three-orbitcontrols';
import DragControls from 'three-dragcontrols';

import Spring from './classes/Spring.js';
import BasePair from './classes/BasePair.js';
import Canvas from './classes/Canvas.js';
import Constants from './constants/Constants.js';
import Light from './classes/Light.js';
import resizeRendererToDisplaySize from './utils/resizeRendererToDisplaySize.js';


export default class dnaObject {

    constructor(canvasID, guiID, options={}) {

        // Default Values
        const defaults = {
            aspect: 2,
            basesCount: 5,
        }

        // Combine Defaults with Options Parameter
        options = Object.assign({}, defaults, options);   

        // Parameters
        this.scene = options.scene;
        this.bases = [];
        this.baseObjects = [];
        this.baseCount = options.basesCount;
        this.springs = [];
        this.springGroupsCount = this.baseCount - 1;
        
        this.createBases(this.baseCount);     
        this.createSprings(this.baseCount);
    }

    createBases(numBases) {
        for(var i = 0; i < numBases; i++) {
                    
            this.bases[i] = new BasePair({scene: this.scene});                                     // Create new Bases
                    
            if(i === 0) {                                                   // Set Positions
                this.bases[i].setPosY(1);
            } else {
                this.bases[i].moveToPosRelativeToBaseAbove(this.bases[i - 1]);
            }
            
            this.bases[i].pushComponentsToList(this.baseObjects);                     // Push Components to baseObjects List
        }
    }

    createSprings(numBases) {
        for(var i = 0; i < this.baseCount - 1; i++) {
            
            // Create new Springs
            this.springGroup = [];
            this.springGroup[0] = new Spring({scene: this.scene, top: this.bases[i].phosLeft_Obj, bottom: this.bases[i+1].phosLeft_Obj});
            this.springGroup[1] = new Spring({scene: this.scene, top: this.bases[i].base_Obj, bottom: this.bases[i+1].base_Obj});
            this.springGroup[2] = new Spring({scene: this.scene, top: this.bases[i].phosRight_Obj, bottom: this.bases[i+1].phosRight_Obj});

            // Push Springs to Spring list
            this.springGroup.forEach(node => {
                this.springs.push(node);
            });
        }
    }

    updateSprings() {
        this.springs.forEach((node) => {             // Springs - Appearance
            node.update();
        })
                                                // Springs - Physics
        for(var i = 0; i < this.springGroupsCount; i++) {
            if(i !== this.springGroupsCount - 1) {             
                this.springs[i].springSimulate(this.bases[i], this.bases[i + 1]);
            } else {
                this.springs[i].springSimulate(this.bases[i], this.bases[i + 1], true);
            }
        }
    }
}




export function dnaObjectScene(canvasID, guiID, aspect, basesCount=5, options={}) {


    // Combine Defaults with Options Parameter
    // options = Object.assign({}, defaults, options);   


    const c = new Canvas(canvasID, {aspect: aspect});        // Arguments: Canvas HTML Element, Aspect Ratio
    const canvas = c.canvas;

    // const canvas = document.querySelector(canvasID);
    

    // RENDERER    
    const renderer = new THREE.WebGLRenderer({canvas});

    console.log("CANVAS: " + canvas.width + ", " + canvas.height);

    // CAMERA
    const fov = 30;
    const near = 0.1;
    const far = 500;
    const camera = new THREE.PerspectiveCamera(fov, c.aspect, near, far);
    const cameraPosXStart = 10;
    const cameraPosYStart = 3;
    const cameraPosZStart = 15;
    camera.position.set(cameraPosXStart, cameraPosYStart, cameraPosZStart);
    camera.lookAt(0,-1,0);
    camera.up.set(0,1,0);  

    // GUI DOM
    const gui = new dat.GUI( { autoPlace: false } );        // SOURCE: https://jsfiddle.net/2pha/zka4qkt2/
    const guiContainer = document.querySelector(guiID);
    guiContainer.appendChild(gui.domElement);
    
    // SCENE
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xAAAAAA);

    /**********************************************************************************
     * 
     *      LIGHTS
     * 
     **********************************************************************************/

    const lightDirectional = new Light(scene, {type: "directional", color: 0xFFFFFF, intensity: 0.8, position: [-1, 2, 4]});
    const lightAmbient = new Light(scene, {type: "ambient", color: 0xFFFFFF, intensity: 0.6, position: [-1, 2, 4]});
    const lightSpot = new Light(scene, {type: "spot", color: 0xAAFFFF, intensity: 0.4, position: [-1, -1, -5], penumbra: 0.5});


    /**********************************************************************************
     * 
     *      OBJECTS
     * 
     **********************************************************************************/

    const dna = new dnaObject(canvasID, guiID, {scene:scene,basesCount: basesCount});

     /**********************************************************************************
     * 
     *      GUI
     * 
     **********************************************************************************/
    const orbitToggle = {enabled: true};
    const trans = {x:0, y:0, z:0};
    const harmonicRot = {x:0, y:0, z:0}; 
    const dihedralRot = {x:0, y:0, z:0};  
    let showSprings = {visible: true};
    let showAxes = {visible: false};
    let stiffness = {k: -175};                                                           // Spring stiffness, in kg / s^2
    let damping = {b: -25.0};
    let springLength = {l: 1.1};
    const baseDispose = {dispose: false};
    const springDispose = {dispose: false};

    // GUI - ORBITAL CONTROLS
    gui.add(orbitToggle, "enabled").name('Orbital Controls').onChange( function(value) {     // SOURCE: https://bit.ly/2I4pqbM
        orbControls.enabled = value;
    });

    // GUI - ANGLE
    gui.add(harmonicRot, "y", -1.000, 1.000).name('Angle').onChange( function(value) {     // SOURCE: https://bit.ly/2I4pqbM
        bases.forEach((base) => {
            base.bondLeft_Loc.rotation.y = value;
            base.bondRight_Loc.rotation.y = -value;
        })
    });
    
    //GUI - DIHEDRAL
    gui.add(dihedralRot, "y", -1.000, 1.000).name('Dihedral').onChange( function(value) {  
        bases[0].setRotY(value);
        for(let i = 0; i < Object.keys(bases).length; i++) {
            if(i === 0) {
                bases[i].setRotY(value);
            }
            if(i > 1) {
                if(value !== 0) {
                    let angle = (i - 1) * -value;
                    bases[i].setRotY(angle);
                }
            }
        }
    });

    // GUI - MOVE
    gui.add(trans, "y", -2.0, 5.0).name('Move').onChange( function(value) {    
        const basePair_LocPosY = 1;
        bases[0].setPosY(value * 1 + basePair_LocPosY);
    });
    
    // GUI - FOLDER - SPRING OPTIONS
    let springOptionsGuiFolder = gui.addFolder('Spring Options');
    springOptionsGuiFolder.open();

    // GUI - DAMPING
    springOptionsGuiFolder.add(damping, "b", -30.000, 0.000).name('Damping').onChange( function(value) {  
        springs.forEach(node => {
            node.setDamping(value);
        });
    });

    // GUI - STIFFNESS
    springOptionsGuiFolder.add(stiffness, "k", -200, 0).name('Stiffness').onChange( function(value) {    
        springs.forEach(node => {
            node.setStiffness(value);
        });
    });

    // GUI - ERUILIBRIUM LENGTH
    springOptionsGuiFolder.add(springLength, "l", 0.1, 2.5).name('Spring Length').onChange( function(value) {    
        springs.forEach(node => {
            node.setSpringLength(value);
        });
    });

    // GUI - VISIBLE
    springOptionsGuiFolder.add(showSprings, "visible").name('Show Springs').onChange( function(value) {  
        springs.forEach((node) => {
            node.spring_Obj.visible = value;
        })
    });

    // GUI - FOLDER - DEBUG
    let debugGuiFolder = gui.addFolder('Debug');
    debugGuiFolder.open();

    // GUI - SHOW AXES
    debugGuiFolder.add(showAxes, "visible").name('Show Axes').onChange( function(value) {  
        // AXIS HELPER
        function checkAxesHelpers(val) {
            if(val) {
                springs.forEach((node) => {
                    node.addAxesHelper();
                })
        
                bases.forEach((node) => {
                    node.addAxesHelper();
                })
            } else {
                springs.forEach((node) => {
                    node.hideAxesHelper();
                })
        
                bases.forEach((node) => {
                    node.hideAxesHelper();
                })
            }
        }
        checkAxesHelpers(value);
    });

    // GUI - DISPOSE BASES
    debugGuiFolder.add(baseDispose, "dispose").name('Dispose of Bases').onChange( function(value) {  
        if(value) {
            bases.forEach((node) => {
                node.dispose();
                console.log("Base Node Disposed");
            })
        }
    });

    // GUI - DISPOSE SPRINGS
    debugGuiFolder.add(springDispose, "dispose").name('Dispose of Springs').onChange( function(value) {  
        if(value) {
            springs.forEach((node) => {
                node.dispose();
                console.log("Spring Node Disposed");
            })
        }
    });

    gui.close();     // Start GUI closed
    

     /**********************************************************************************
     * 
     *      CONTROLS
     * 
     **********************************************************************************/

    // DRAGGING CONTROL
    var dragControls = new DragControls(dna.baseObjects, camera, renderer.domElement);
    
    // DRAGGING COLOR MANAGEMENT
    var startColor;
    dragControls.addEventListener( 'dragstart', dragStartCallback );
    dragControls.addEventListener( 'dragend', dragEndCallback );    
    function dragStartCallback(event) {                         // Changes Color to Selected
        startColor = event.object.material.color.getHex();
        event.object.material.color.setHex(0xff3311);    }

    function dragEndCallback(event) {                           // Changes Color back to Original
        event.object.material.color.setHex(startColor);
    }


     /**********************************************************************************
     * 
     *      CAMERA FRAME
     * 
     **********************************************************************************/
    // Update Camera Focus to center of Chain

    function cameraFocusFrame(baseList) {

        const baseToLookAt = parseInt(baseList.length / 2);
        const cameraZoomFactor = 2.5;
        let basePosInCenterOfChain = new THREE.Vector3();
        baseList[baseToLookAt].basePair_Loc.getWorldPosition(basePosInCenterOfChain);
        camera.lookAt(basePosInCenterOfChain);
        // console.log("ZOOM: " + camera.zoom);
        camera.zoom = 1;
        // console.log("ZOOM: " + camera.zoom);
        camera.position.setX(cameraPosXStart + cameraZoomFactor * baseToLookAt); // + cameraZoomFactor * baseToLookAt;
        camera.position.setY(cameraPosYStart + cameraZoomFactor * baseToLookAt * 0.25); // + cameraZoomFactor * baseToLookAt;
        camera.position.setZ(cameraPosZStart + cameraZoomFactor * baseToLookAt); // + cameraZoomFactor * baseToLookAt;

        return basePosInCenterOfChain;
    }



    const centerBase = cameraFocusFrame(dna.bases);
    // const pickHelper = new PickHelper();

    dna.bases[0].setPosY(1.5);    // Start with a little springiness on load

    // CONTROLS - ORBITAL
    var orbControls = new OrbitControls(camera, renderer.domElement);
    orbControls.target = centerBase;
    orbControls.update();



     /**********************************************************************************
     * 
     *      RENDER
     * 
     **********************************************************************************/
    
    
    renderer.render(scene, camera);

    // RENDER UPDATE LOOP
    function render(time) {
        time *= 0.001;                          // Convert Time to seconds
        // resizeRendererToDisplaySize(renderer);  // Responsive Display   

        if (resizeRendererToDisplaySize(renderer)) {
            const rend = renderer.domElement;
            camera.aspect = rend.clientWidth / rend.clientHeight;
            camera.updateProjectionMatrix();
          }

        // cameraFocusFrame(bases);

        dna.updateSprings();

        orbControls.update();                   // Orbit Controls
        requestAnimationFrame(render);          // Animation frame
        renderer.render(scene, camera);         // Render
    }
    requestAnimationFrame(render);   

    return this;
}


// PAUSE RENDER - https://stackoverflow.com/questions/38034787/three-js-and-buttons-for-start-and-pause-animation


