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
import Canvas from './classes/Canvas.js';
import DnaObject from './classes/DnaObject.js'
import CameraPerspective from './classes/CameraPerspective.js';
import Light from './classes/Light.js';
import resizeRendererToDisplaySize from './utils/resizeRendererToDisplaySize.js';
import Constants from './constants/Constants.js';


export function dnaObjectScene(canvasID, guiID, aspect, basesCount=5, options={}) {

/**********************************************************************************
* 
*      CANVAS
* 
**********************************************************************************/

    const c = new Canvas(canvasID, {aspect: aspect});        // Arguments: Canvas HTML Element, Aspect Ratio
    const canvas = c.canvas;    

/**********************************************************************************
* 
*      RENDERER
* 
**********************************************************************************/ 

    const renderer = new THREE.WebGLRenderer({canvas});
    
/**********************************************************************************
* 
*      CAMERA
* 
**********************************************************************************/
    const camera = new CameraPerspective({fov: 30, near: 0.1, far: 500, aspect: c.aspect, position: [10, 3, 15], lookAt: [0,-1,0], up: [0,1,0]});
    
/**********************************************************************************
* 
*      SCENE
* 
**********************************************************************************/

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

    const dna = new DnaObject(canvasID, guiID, {scene:scene,basesCount: basesCount});

/**********************************************************************************
* 
*       GUI
* 
**********************************************************************************/

    // GUI DOM
    const gui = new dat.GUI( { autoPlace: false } );        // SOURCE: https://jsfiddle.net/2pha/zka4qkt2/
    const guiContainer = document.querySelector(guiID);
    guiContainer.appendChild(gui.domElement);

    // PARAMETERS
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
        dna.bases.forEach((base) => {
            base.bondLeft_Loc.rotation.y = value;
            base.bondRight_Loc.rotation.y = -value;
        })
    });
    
    //GUI - DIHEDRAL
    gui.add(dihedralRot, "y", -1.000, 1.000).name('Dihedral').onChange( function(value) {  
        dna.bases[0].setRotY(value);
        for(let i = 0; i < Object.keys(dna.bases).length; i++) {
            if(i === 0) {
                dna.bases[i].setRotY(value);
            }
            if(i > 1) {
                if(value !== 0) {
                    let angle = (i - 1) * -value;
                    dna.bases[i].setRotY(angle);
                }
            }
        }
    });

    // GUI - MOVE
    gui.add(trans, "y", -2.0, 5.0).name('Move').onChange( function(value) {    
        const basePair_LocPosY = 1;
        dna.bases[0].setPosY(value * 1 + basePair_LocPosY);
    });
    
    // GUI - FOLDER - SPRING OPTIONS
    let springOptionsGuiFolder = gui.addFolder('Spring Options');
    springOptionsGuiFolder.open();

    // GUI - DAMPING
    springOptionsGuiFolder.add(damping, "b", -30.000, 0.000).name('Damping').onChange( function(value) {  
        dna.springs.forEach(node => {
            node.setDamping(value);
        });
    });

    // GUI - STIFFNESS
    springOptionsGuiFolder.add(stiffness, "k", -200, 0).name('Stiffness').onChange( function(value) {    
        dna.springs.forEach(node => {
            node.setStiffness(value);
        });
    });

    // GUI - ERUILIBRIUM LENGTH
    springOptionsGuiFolder.add(springLength, "l", 0.1, 2.5).name('Spring Length').onChange( function(value) {    
        dna.springs.forEach(node => {
            node.setSpringLength(value);
        });
    });

    // GUI - VISIBLE
    springOptionsGuiFolder.add(showSprings, "visible").name('Show Springs').onChange( function(value) {  
        dna.springs.forEach((node) => {
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
                dna.springs.forEach((node) => {
                    node.addAxesHelper();
                })
        
                dna.bases.forEach((node) => {
                    node.addAxesHelper();
                })
            } else {
                dna.springs.forEach((node) => {
                    node.hideAxesHelper();
                })
        
                dna.bases.forEach((node) => {
                    node.hideAxesHelper();
                })
            }
        }
        checkAxesHelpers(value);
    });

    // GUI - DISPOSE BASES
    debugGuiFolder.add(baseDispose, "dispose").name('Dispose of Bases').onChange( function(value) {  
        if(value) {
            dna.bases.forEach((node) => {
                node.dispose();
                console.log("Base Node Disposed");
            })
        }
    });

    // GUI - DISPOSE SPRINGS
    debugGuiFolder.add(springDispose, "dispose").name('Dispose of Springs').onChange( function(value) {  
        if(value) {
            dna.springs.forEach((node) => {
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
    var dragControls = new DragControls(dna.baseObjects, camera.camera, renderer.domElement);
    
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

    // function cameraFocusFrame(baseList) {

    //     const baseToLookAt = parseInt(baseList.length / 2);
    //     const cameraZoomFactor = 2.5;
    //     let basePosInCenterOfChain = new THREE.Vector3();
    //     baseList[baseToLookAt].basePair_Loc.getWorldPosition(basePosInCenterOfChain);
    //     camera.camera.lookAt(basePosInCenterOfChain);
    //     camera.camera.zoom = 1;
    //     camera.camera.position.setX(cameraPosXStart + cameraZoomFactor * baseToLookAt); // + cameraZoomFactor * baseToLookAt;
    //     camera.camera.position.setY(cameraPosYStart + cameraZoomFactor * baseToLookAt * 0.25); // + cameraZoomFactor * baseToLookAt;
    //     camera.camera.position.setZ(cameraPosZStart + cameraZoomFactor * baseToLookAt); // + cameraZoomFactor * baseToLookAt;

    //     return basePosInCenterOfChain;
    // }



    // const centerBase = cameraFocusFrame(dna.bases);
    // const pickHelper = new PickHelper();

    dna.bases[0].setPosY(1.5);    // Start with a little springiness on load

    // CONTROLS - ORBITAL
    var orbControls = new OrbitControls(camera.camera, renderer.domElement);
    // orbControls.target = centerBase;
    orbControls.target = new THREE.Vector3(0,0,0);
    orbControls.update();

/**********************************************************************************
* 
*      RENDER
* 
**********************************************************************************/
    
    renderer.render(scene, camera.camera);

    // RENDER UPDATE LOOP
    function render(time) {
        time *= 0.001;                          // Convert Time to seconds
        // resizeRendererToDisplaySize(renderer);  // Responsive Display   

        if (resizeRendererToDisplaySize(renderer)) {
            const rend = renderer.domElement;
            camera.camera.aspect = rend.clientWidth / rend.clientHeight;
            camera.camera.updateProjectionMatrix();
          }

        // cameraFocusFrame(dna.bases);

        dna.updateSprings();

        orbControls.update();                   // Orbit Controls
        requestAnimationFrame(render);          // Animation frame
        renderer.render(scene, camera.camera);         // Render
    }
    requestAnimationFrame(render);   

    return this;
}


// PAUSE RENDER - https://stackoverflow.com/questions/38034787/three-js-and-buttons-for-start-and-pause-animation


