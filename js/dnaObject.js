/*********************************************************************************
DNA Bases - Creates an interactive 3D pair of Base Pairs.
*********************************************************************************/
// var THREE = require('three'); 

'use strict';

import {Base} from './dnaObjects.js';
import {Spring} from './dnaObjects.js';
// import {} from './dnaObjects.js';
// import { GeometryUtils } from "three";

// import * as THREE from 'three';

function distanceToObject(v1, v2)       // SOURCE: https://bit.ly/2KgqxYO
{
    var dx = v1.x - v2.x;
    var dy = v1.y - v2.y;
    var dz = v1.z - v2.z;

    return Math.sqrt(dx * dx + dy * dy + dz * dz);
}

function rgbToHex (rgb) { 
    var hex = Number(rgb).toString(16);
    if (hex.length < 2) {
            hex = "0" + hex;
    }
    return hex;
};

function fullColorHex (r,g,b) {   
    var red = rgbToHex(r);
    var green = rgbToHex(g);
    var blue = rgbToHex(b);
    return "0x" + red+green+blue;
};

function degToRad(degrees) {
  var pi = Math.PI;
  return degrees * (pi/180);
};

export function dnaObject(canvasSelector) {

    // CANVAS
    const canvas = document.querySelector(canvasSelector);
    let aspect = 2;

    // SQUARE ASPECT PROFILE
    // {   
    //     const parent = canvas.parentElement;
    //     const style = getComputedStyle(parent); 
    //     const num = parseFloat(style.width, 10);
    //     canvas.height = num;
    //     canvas.width = num;
    //     aspect = canvas.width / canvas.height;
    // }

    // 1.5 ASPECT PROFILE
    // {   
    //     const parent = canvas.parentElement;
    //     const style = getComputedStyle(parent); 
    //     const num = parseFloat(style.width, 10);
    //     canvas.height = num * .75;
    //     canvas.width = num;
    //     aspect = canvas.width / canvas.height;
    // }

    // WINDOW ASPECT PROFILE
    // {   
    //     canvas.height = window.innerHeight;
    //     canvas.width = window.innerWidth;
    //     aspect = canvas.width / canvas.height;
    // }

    // RENDERER    
    const renderer = new THREE.WebGLRenderer({canvas});

    // CAMERA
    const fov = 30;
    const near = 0.1;
    const far = 500;
    const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
    camera.position.set(10,3,15);
    camera.lookAt(0,-1,0);
    camera.up.set(0,1,0);  

    // GUI DOM
    const gui = new dat.GUI( { autoPlace: false } );        // SOURCE: https://jsfiddle.net/2pha/zka4qkt2/
    const guiContainer = document.getElementById('gui');
    guiContainer.appendChild(gui.domElement);
    
    // CONTROLS - ORBITAL
    var orbControls = new THREE.OrbitControls(camera, renderer.domElement);
    orbControls.update();

    // SCENE
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xAAAAAA);

    // GROUP
    const group = new THREE.Group();
    scene.add(group);

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

    // Array of objects
    const objects = [];
    const BASE_DISTANCE_START = 1.1;
    const BOND_DISTANCE_START = 2;

    // Geometry Parameters
    const baseRadius = 0.4;
    const phosphateRadius = 0.4;
    const widthSegments = 20;
    const heightSegments = 20;
    const bondHeight = BOND_DISTANCE_START;
    const bondRadius = 0.08;
    const bondRadSegments = 8;
    const bondHeightSegments = 1;
    const planeWidth = 8;
    const springRadius = 0.07;
    const springHeight = BASE_DISTANCE_START;
    const springRadSegments = 8;
    const springHeightSegments = 1;

    // Create Geometry
    const base_Geo = new THREE.SphereGeometry(baseRadius, widthSegments, heightSegments);
    const phos_Geo = new THREE.SphereGeometry(phosphateRadius, widthSegments, heightSegments);
    const bond_Geo = new THREE.CylinderGeometry(bondRadius, bondRadius, bondHeight, bondRadSegments, bondHeightSegments);    
    const spring_Geo = new THREE.CylinderGeometry(springRadius, springRadius, springHeight, springRadSegments, springHeightSegments);
    const groundPlane_Geo = new THREE.PlaneGeometry(planeWidth, planeWidth);

    // Colors
    const base_Color = 0x888888;
    const phos_Color = 0x1480e1;
    const bond_Color = 0x232323;
    const spring_Color = 0xEE8800;
    const groundPlane_Color = 0x99aa99;
        
    // Positions
    const base_Pos = {x:0, y:0, z:0};
    const leftArm_Pos = {x:0, y:0, z:0};
    const rightArm_Pos = {x:0, y:0, z:0};
    const phosLeft_Pos = {x:-2, y:0, z:0};
    const phosRight_Pos = {x:2, y:0, z:0};
    const spring_Pos = {x:0, y:0, z:0};

    // Make Object instance and Add to scene
    function makeInstance(geometry, color, pos={x:0,y:0,z:0} , rot={x:0,y:0,z:0}) {
        const material = new THREE.MeshPhongMaterial({color});
        material.shininess = 20;
        // material.flatShading = true;
        // material.wireframe = true;
        const object = new THREE.Mesh(geometry, material);
        scene.add(object);
        // group.add(object);
        object.position.x = pos.x;
        object.position.y = pos.y;
        object.position.z = pos.z;
        objects.push(object);
        return object;
    }
    
    // OBJECTS (Meshes)

    // Ground Plane
    // const groundPlane_Obj = makeInstance(groundPlane_Geo, groundPlane_Color);
    // groundPlane_Obj.rotation.x = -(degToRad(90));
    // groundPlane_Obj.position.y = -2;

    const baseObjects = [];

    class Base {
        constructor() {

            this.components = [];
            this.axesHelpers = [];

            // Left Arm
            this.bondLeft_Loc = new THREE.Object3D();
            scene.add(this.bondLeft_Loc);
            this.bondLeft_Obj = makeInstance(bond_Geo, bond_Color, leftArm_Pos);
            this.phosLeft_Obj = makeInstance(phos_Geo, phos_Color, phosLeft_Pos);

            // Base
            this.basePair_Loc = new THREE.Object3D();
            this.basePair_Loc.name = "basePair_Loc";
            scene.add(this.basePair_Loc);
            group.add(this.basePair_Loc);
            this.base_Obj = makeInstance(base_Geo, base_Color, base_Pos);
            this.base_Obj.name = "base_Obj";

            // Right Arm
            this.bondRight_Loc = new THREE.Object3D();
            scene.add(this.bondRight_Loc);
            this.bondRight_Obj = makeInstance(bond_Geo, bond_Color, rightArm_Pos);
            this.phosRight_Obj = makeInstance(phos_Geo, phos_Color, phosRight_Pos);

            this.rig();
            this.addComponents();
            this.addComponentsToBaseObjects();
        }

        rig() {
            // Rigging - Base
            this.basePair_Loc.add(this.base_Obj);
            this.basePair_Loc.add(this.bondLeft_Loc);
            this.basePair_Loc.add(this.bondRight_Loc);

            // Rigging - Left Arm
            this.bondLeft_Obj.rotation.z = degToRad(90);
            this.bondLeft_Obj.position.x = -1;
            this.bondLeft_Loc.add(this.bondLeft_Obj);
            this.bondLeft_Loc.add(this.phosLeft_Obj);

            // Rigging - Right Arm
            this.bondRight_Obj.rotation.z = degToRad(90);
            this.bondRight_Obj.position.x = 1;
            this.bondRight_Loc.add(this.bondRight_Obj);
            this.bondRight_Loc.add(this.phosRight_Obj);
        }

        addComponents() {
            this.components.push(this.bondLeft_Loc);
            this.components.push(this.bondLeft_Obj);
            this.components.push(this.phosLeft_Obj);
            this.components.push(this.bondRight_Loc);
            this.components.push(this.bondRight_Obj);
            this.components.push(this.phosRight_Obj);
            this.components.push(this.base_Obj);
            this.components.push(this.basePair_Loc);
        }

        addComponentsToBaseObjects() {
            this.components.forEach((obj) => {
                baseObjects.push(obj);
            });
        }

        addAxesHelper() {
            this.components.forEach((node) => {
                const axes = new THREE.AxesHelper();
                axes.material.depthTest = false;
                axes.renderOrder = 1;
                this.axesHelpers.push(axes);
                node.add(axes);
            });
        }

        hideAxesHelper() {
            this.axesHelpers.forEach((node) => {
                node.visible = false;
            });
        }
    };

    class Spring {
        constructor(top, bot) {

            this.components = [];
            this.axesHelpers = [];
            // Make Spring Objects   (2 Empty, 1 Cylinder)
            this.topAtom_Loc = new THREE.Object3D();
            scene.add(this.topAtom_Loc);
            this.botAtom_Loc = new THREE.Object3D();
            scene.add(this.botAtom_Loc);
            this.spring_Obj = makeInstance(spring_Geo, spring_Color, spring_Pos);
            this.spring_Obj.material.transparent = true;
            this.spring_Obj.material.opacity = 0.5;
            // this.baseDistance = BASE_DISTANCE_START;
            this.baseDistance = BASE_DISTANCE_START;

            // this.botAtom_Loc.position.set(bot);
            this.botAtom_Loc.add(this.spring_Obj);
            this.spring_Obj.position.z = this.baseDistance / 2.0;
            // this.spring_Obj.position.z = 20;
            this.spring_Obj.rotation.x = degToRad(90);
            this.botAtom_Loc.rotation.x = degToRad(90);

            this.rig(top, bot);
            this.addComponents();
        }

        rig(top, bot) {
            top.add(this.topAtom_Loc);
            bot.add(this.botAtom_Loc);

            this.topAtom_Loc.position.set(0,0,0);       // Local Position
            this.botAtom_Loc.position.set(0,0,0);
        }

        update() {
            this.vector1 = new THREE.Vector3();                                 // Necessary Target Vector for 'getWorldPosition()' methods
            this.vector2 = new THREE.Vector3();
            this.botPos = this.botAtom_Loc.getWorldPosition(this.vector1);
            this.topPos = this.topAtom_Loc.getWorldPosition(this.vector2);                
            this.distance = this.botPos.distanceTo(this.topPos);                // Distance between Atoms
            // console.log("Distance: " + this.distance);

            this.spring_Obj.scale.y = this.distance / (this.baseDistance );        // Length
            this.spring_Obj.position.z = this.distance / 2;     // Center Position
            this.botAtom_Loc.lookAt(this.topPos);                               // Orientation
        }

        addComponents() {
            this.components.push(this.botAtom_Loc);
            this.components.push(this.topAtom_Loc);
            this.components.push(this.spring_Obj);
        }

        addAxesHelper() {
            this.components.forEach((node) => {
                const axes = new THREE.AxesHelper();
                axes.material.depthTest = false;
                axes.renderOrder = 1;
                this.axesHelpers.push(axes);
                node.add(axes);
            });
        }

        hideAxesHelper() {
            this.axesHelpers.forEach((node) => {
                node.visible = false;
            });
        }
    };

    // class PickHelper {
    //     constructor() {
    //         this.raycaster = new THREE.Raycaster();
    //         this.pickedObject = null;
    //         this.pickedObjectSavedColor = 0;
    //     }
    //     pick(normalizedPosition, scene, camera, time) {
    //         // restore the color if there is a picked object
    //         if (this.pickedObject) {
    //         this.pickedObject.material.emissive.setHex(this.pickedObjectSavedColor);
    //         this.pickedObject = undefined;
    //         }
        
    //         // cast a ray through the frustum
    //         this.raycaster.setFromCamera(normalizedPosition, camera);
    //         // get the list of objects the ray intersected
    //         const intersectedObjects = this.raycaster.intersectObjects(scene.children);
    //         if (intersectedObjects.length) {
    //         // pick the first object. It's the closest one
    //         this.pickedObject = intersectedObjects[0].object;
    //         // save its color
    //         this.pickedObjectSavedColor = this.pickedObject.material.emissive.getHex();
    //         // set its emissive color to flashing red/yellow
    //         this.pickedObject.material.emissive.setHex((time * 8) % 2 > 1 ? 0xFFFF00 : 0xFF0000);
    //         }
    //     }
    // }
    
    // window.addEventListener('mousemove', setPickPosition);
    // window.addEventListener('mouseout', clearPickPosition);
    // window.addEventListener('mouseout', clearPickPosition);
    // window.addEventListener('mouseleave', clearPickPosition);

    // const pickPosition = {x: 0, y: 0};
    // clearPickPosition();    
    
    // function setPickPosition(event) {
    // pickPosition.x = (event.clientX / canvas.clientWidth ) *  2 - 1;
    // pickPosition.y = (event.clientY / canvas.clientHeight) * -2 + 1;  // note we flip Y
    // }
    
    // function clearPickPosition() {
    // // unlike the mouse which always has a position
    // // if the user stops touching the screen we want
    // // to stop picking. For now we just pick a value
    // // unlikely to pick something
    // pickPosition.x = -100000;
    // pickPosition.y = -100000;
    // }

    // RAYCASTING
    // window.addEventListener( 'resize', onWindowResize, false );
    // window.addEventListener( "mousemove", onDocumentMouseMove, false );
    

    // let selectedObject = null;
    // let origColor = new THREE.Color(0x000000);
    // let selectedColor = new THREE.Color(0xcc3311)

    

    // var raycaster = new THREE.Raycaster();
    // var mouseVector = new THREE.Vector3();

    // // Select objects
    // function onDocumentMouseMove( event ) {
    //     event.preventDefault();
    //     if ( selectedObject ) {
    //         selectedObject.material.color.set(origColor);
    //         selectedObject = null;
    //     }

    //     var intersects = getIntersects( event.layerX, event.layerY );

    //     if ( intersects.length > 0 ) {
    //         var res = intersects.filter( function ( res ) {
    //             return res && res.object;
    //         } )[ 0 ];
            
    //         if ( res && res.object ) {
    //             selectedObject = res.object;
    //             if(selectedObject.material.color.getHexString() !== selectedColor.getHexString()) {
    //                 origColor.copy(selectedObject.material.color);
    //             }
    //             selectedObject.material.color.set(selectedColor);
    //         }
    //     }
    // }

    // // Responsive Display
    // function onWindowResize() {
    //     const canvas = renderer.domElement;
    //     const width = canvas.clientWidth;
    //     const height = canvas.clientHeight;
    //     const needResize = canvas.width !== width || canvas.height !== height;
    //     if (needResize) {
    //         renderer.setSize(width, height, false);
    //         camera.aspect = width / height;
    //         camera.updateProjectionMatrix();
    //     }
    // } 

    // function getIntersects( x, y ) {
    //     // x = ( x / window.innerWidth ) * 2 - 1;
    //     // y = - ( y / window.innerHeight ) * 2 + 1;
    //     x = ( x / canvas.width ) * 2 - 1;
    //     y = - ( y / canvas.height ) * 2 + 1;
    //     mouseVector.set( x, y, 0.5 );
    //     raycaster.setFromCamera( mouseVector, camera );
    //     return raycaster.intersectObject( group, true );
    // }


    /*****************************************
     * 
     *                 OBJECTS
     * 
     *****************************************/

    // BASES
    const bases = [];

    const base1 = new Base();
    const base2 = new Base();
    const base3 = new Base();
    const base4 = new Base();
    base1.basePair_Loc.position.y = 1;
    base2.basePair_Loc.position.y = base1.basePair_Loc.position.y - BASE_DISTANCE_START;    
    base3.basePair_Loc.position.y = base2.basePair_Loc.position.y - BASE_DISTANCE_START;  
    base4.basePair_Loc.position.y = base3.basePair_Loc.position.y - BASE_DISTANCE_START;    
    bases.push(base1);
    bases.push(base2);
    bases.push(base3);
    bases.push(base4);

    // SPRINGS
    const springs = [];

    // 1st Group
    const springL1 = new Spring(base1.phosLeft_Obj, base2.phosLeft_Obj);
    const springC1 = new Spring(base1.base_Obj, base2.base_Obj);
    const springR1 = new Spring(base1.phosRight_Obj, base2.phosRight_Obj);
    springs.push(springL1);
    springs.push(springC1);
    springs.push(springR1);

    // 2nd Group
    const springL2 = new Spring(base2.phosLeft_Obj, base3.phosLeft_Obj);
    const springC2 = new Spring(base2.base_Obj, base3.base_Obj);
    const springR2 = new Spring(base2.phosRight_Obj, base3.phosRight_Obj);
    springs.push(springL2);
    springs.push(springC2);
    springs.push(springR2);

    // 2nd Group
    const springL3 = new Spring(base3.phosLeft_Obj, base4.phosLeft_Obj);
    const springC3 = new Spring(base3.base_Obj, base4.base_Obj);
    const springR3 = new Spring(base3.phosRight_Obj, base4.phosRight_Obj);
    springs.push(springL3);
    springs.push(springC3);
    springs.push(springR3);

    
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
    


    // // SPRING SIM                                                                       SOURCE: https://bit.ly/2WsQA5z
    // const framerate = 1/60;                                                             // Framerate to calculate how much to move each update
    // let stiffness = {k: -75};                                                           // Spring stiffness, in kg / s^2
    // let spring_length = BASE_DISTANCE_START;                                            // Spring Equilibrium distance
    // let damping = {b: -3.0};                                                            // Damping constant, in kg / s

    // var topBase = {y: 1, v: 0, mass: 1};                                                // Object to hold Top Base Spring Data
    // var botBase = {y: -1, ly: -1, v: 0, mass: 1, frequency: 0, t: 0};                   // Object to hold Bottom Base Spring Data

    // var springLoop = function(top, bot, firstInChain=true) {
        
    //     topBase.y = top.basePair_Loc.position.y;                                      // Grab Current Position
    //     botBase.y = bot.basePair_Loc.position.y;

    //     if(topBase.y - botBase.y != spring_length)                                      // If not in Equilibrium
    //     {
    //         let F_spring = stiffness.k * ((topBase.y - botBase.y) - spring_length);     // Springiness
    //         let F_damper = damping.b * (topBase.v - botBase.v);                         // Damper Force

    //         let a = (F_spring + F_damper) / topBase.mass;                               // Top Calc
    //         topBase.v += a * framerate;
    //         topBase.y += topBase.v * framerate;
            
    //         let c = (F_spring + F_damper) / botBase.mass;                               // Bottom Calc
    //         botBase.v -= c * framerate;
    //         botBase.y += botBase.v * framerate;
    //     }

    //     top.basePair_Loc.position.y = topBase.y;                                      // Update Position of Bases
    //     bot.basePair_Loc.position.y = botBase.y;
    // };




    // SPRING SIM                                                                       SOURCE: https://bit.ly/2WsQA5z
    const framerate = 1/60;                                                             // Framerate to calculate how much to move each update
    let stiffness = {k: -75};                                                           // Spring stiffness, in kg / s^2
    let spring_length = BASE_DISTANCE_START;                                            // Spring Equilibrium distance
    let damping = {b: -4.0};                                                            // Damping constant, in kg / s
    let speed = 2.5;

    var topBase = {y: 1, ly: -1, v: 0, mass: 1, frequency: 0, t: 0};                    // Object to hold Top Base Spring Data
    var botBase = {y: -1, ly: -1, v: 0, mass: 1, frequency: 0, t: 0};                   // Object to hold Bottom Base Spring Data

    var springLoop = function(top, bot, lastInChain=false) {
        
        topBase.y = top.basePair_Loc.position.y;                                        // Grab Current Position
        botBase.y = bot.basePair_Loc.position.y;

        if(topBase.y - botBase.y != spring_length)                                      // If not in Equilibrium
        {
            let F_spring = stiffness.k * ((topBase.y - botBase.y) - spring_length);     // Springiness
            let F_damper = damping.b * (topBase.v - botBase.v);                         // Damper Force

            let a = (F_spring + F_damper) / topBase.mass;                               // Top Calc
            topBase.v += a * framerate;
            topBase.y += topBase.v * framerate;

            let c;
            if(lastInChain) {
                c = (F_spring + F_damper) / (botBase.mass * 2);                               // Bottom Calc    
            } else {
                c = (F_spring + F_damper) / botBase.mass;                               // Bottom Calc
            }
            botBase.v -= c * framerate;
            botBase.y += botBase.v * framerate * speed;                                 // Speed Multiplier added to smooth it out
        }

        top.basePair_Loc.position.y = topBase.y;                                        // Update Position of Bases
        bot.basePair_Loc.position.y = botBase.y;
    };
    




    // GUI 
    const orbitToggle = {enabled: true};
    const trans = {x:0, y:0, z:0};
    const harmonicRot = {x:0, y:0, z:0}; 
    const dihedralRot = {x:0, y:0, z:0};  
    let showSprings = {visible: true};
    let showAxes = {visible: false};

    gui.add(orbitToggle, "enabled").name('Orbital Controls').onChange( function(value) {     // SOURCE: https://bit.ly/2I4pqbM
        orbControls.enabled = value;
    });

    gui.add(harmonicRot, "y", -1.000, 1.000).name('Angle').onChange( function(value) {     // SOURCE: https://bit.ly/2I4pqbM
        bases.forEach((base) => {
            base.bondLeft_Loc.rotation.y = value;
            base.bondRight_Loc.rotation.y = -value;
        })
    });
    
    gui.add(dihedralRot, "y", -1.000, 1.000).name('Dihedral').onChange( function(value) {  
        base1.basePair_Loc.rotation.y = value;
        for(let i = 0; i < Object.keys(bases).length; i++) {
            if(i === 0) {
                bases[i].basePair_Loc.rotation.y = value;
            }
            if(i > 1) {
                if(value !== 0) {
                    let angle = (i - 1) * -value;
                    bases[i].basePair_Loc.rotation.y = angle;
                }
            }
        }
    });

    gui.add(trans, "y", -2.0, 2.0).name('Move').onChange( function(value) {    
        const basePair_LocPosY = 1;
        base1.basePair_Loc.position.y = value * 1 + basePair_LocPosY;
    });
    
    let springOptionsGuiFolder = gui.addFolder('Spring Options');

    springOptionsGuiFolder.add(damping, "b", -8.000, 0.000).name('Damping').onChange( function(value) {  
        damping.b = value;
    });

    springOptionsGuiFolder.add(stiffness, "k", -100, 0).name('Stiffness').onChange( function(value) {    
        stiffness.k = value;
    });

    springOptionsGuiFolder.add(showSprings, "visible").name('Show Springs').onChange( function(value) {  
        springs.forEach((node) => {
            node.spring_Obj.visible = value;
        })
    });

    let debugGuiFolder = gui.addFolder('Debug');

    debugGuiFolder.add(showAxes, "visible").name('Show Axes').onChange( function(value) {  
        checkAxesHelpers(value);
    });

    // gui.close();     // Start GUI closed
    
    



    // DRAGGING CONTROL
    var dragControls = new THREE.DragControls( baseObjects, camera, renderer.domElement);
    
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



    // RENDER
    renderer.render(scene, camera);
    // const pickHelper = new PickHelper();

    base1.basePair_Loc.position.y = 1.5;    // Start with a little springiness on load

    // RENDER UPDATE LOOP
    function render(time) {
        time *= 0.001;                      // converts time to seconds

        resizeRendererToDisplaySize(renderer);
        
        // SPRINGS
        springs.forEach((node) => {         // Update render of spring element
            node.update();
        })
        springLoop(base1, base2);           // Springs physics       
        springLoop(base2, base3);
        springLoop(base3, base4, true);
        
        // pickHelper.pick(pickPosition, scene, camera, time);
        orbControls.update();
        requestAnimationFrame(render);
        renderer.render(scene, camera);
    }
    requestAnimationFrame(render);
    
    // Responsive Display
    function resizeRendererToDisplaySize(renderer) {
        const canvas = renderer.domElement;
        const width = canvas.clientWidth;
        const height = canvas.clientHeight;
        const needResize = canvas.width !== width || canvas.height !== height;
        if (needResize) {
            renderer.setSize(width, height, false);
            camera.aspect = width / height;
            camera.updateProjectionMatrix();
        }
        return needResize;
    } 
}


// PAUSE RENDER - https://stackoverflow.com/questions/38034787/three-js-and-buttons-for-start-and-pause-animation


