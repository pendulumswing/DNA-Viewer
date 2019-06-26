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
import Base from './classes/Base.js';
import Canvas from './classes/Canvas.js';
import Constants from './constants/Constants.js';
import resizeRendererToDisplaySize from './utils/resizeRendererToDisplaySize.js';


export function dnaObject(canvasID, guiID, aspect, basesCount=5) {

    const c = new Canvas(canvasID, aspect);        // Arguments: Canvas HTML Element, Aspect Ratio
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

    // LIGHT - Directional
    {
        const color = 0xFFFFFF;
        const intensity = .8;
        const light = new THREE.DirectionalLight(color, intensity);
        light.position.set(-1, 2, 4);
        scene.add(light);
        // var helper = new THREE.DirectionalLightHelper(light, 1);
        // scene.add(helper);
    }

    // LIGHT - Ambient
    {
        const color = 0xFFFFFF;
        const intensity = 0.6;
        const light = new THREE.AmbientLight(color, intensity);
        light.position.set(-1, 2, 4);
        scene.add(light);
    }

    // LIGHT - Spotlight  (backlight)
    {
        const color = 0xAAFFFF;
        const intensity = 0.4;
        const light = new THREE.SpotLight(color, intensity);
        light.position.set(-1, -1, -5);
        light.penumbra = 0.5;
        light.lookAt(new THREE.Vector3(0,0,0));
        scene.add(light);
        // var helper = new THREE.SpotLightHelper(light);
        // scene.add(helper);
    }


    /**********************************************************************************
     * 
     *      OBJECTS
     * 
     **********************************************************************************/

    // BASES
    const bases = [];
    const baseObjects = [];
    const baseCount = basesCount;
    
    function createBases(numBases) {
        for(var i = 0; i < numBases; i++) {
                    
            bases[i] = new Base(scene);                                     // Create new Bases
                    
            if(i === 0) {                                                   // Set Positions
                bases[i].setPosY(1);
            } else {
                bases[i].moveToPosRelativeToBaseAbove(bases[i - 1]);
            }
            
            bases[i].pushComponentsToList(baseObjects);                     // Push Components to baseObjects List
        }
    }

    createBases(baseCount);
    

    // SPRINGS
    const springs = [];
    var springGroupsCount = baseCount - 1;

    function createSprings(numBases) {
        for(var i = 0; i < baseCount - 1; i++) {
            
            // Create new Springs
            let springGroup = [];
            springGroup[0] = new Spring(scene, bases[i].phosLeft_Obj, bases[i+1].phosLeft_Obj);
            springGroup[1] = new Spring(scene, bases[i].base_Obj, bases[i+1].base_Obj);
            springGroup[2] = new Spring(scene, bases[i].phosRight_Obj, bases[i+1].phosRight_Obj);

            // Push Springs to Spring list
            springGroup.forEach(node => {
                springs.push(node);
            });
        }
    }

    createSprings(baseCount);



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
    var dragControls = new DragControls( baseObjects, camera, renderer.domElement);
    
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

    const centerBase = cameraFocusFrame(bases);
    // const pickHelper = new PickHelper();

    bases[0].setPosY(1.5);    // Start with a little springiness on load

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
        
        springs.forEach((node) => {             // Springs - Appearance
            node.update();
        })
                                                // Springs - Physics
        for(var i = 0; i < springGroupsCount; i++) {
            if(i !== springGroupsCount - 1) {             
                springs[i].springSimulate(bases[i], bases[i + 1]);
            } else {
                springs[i].springSimulate(bases[i], bases[i + 1], true);
            }
        }

        orbControls.update();                   // Orbit Controls
        requestAnimationFrame(render);          // Animation frame
        renderer.render(scene, camera);         // Render
    }
    requestAnimationFrame(render);   

    return this;
}


// PAUSE RENDER - https://stackoverflow.com/questions/38034787/three-js-and-buttons-for-start-and-pause-animation


