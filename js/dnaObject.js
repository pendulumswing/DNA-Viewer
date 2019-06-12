/*********************************************************************************
DNA Bases - Creates an interactive 3D pair of Base Pairs.
*********************************************************************************/
// var THREE = require('three'); 

'use strict';

// import {Base} from './dnaObjects.js';
// import {Spring} from './dnaObjects.js';
// import Base from './Base.js';

// import Spring from './Spring.js';
// import {} from './dnaObjects.js';
// import { GeometryUtils } from "three";
import utils from './utils.js';
// import { Vector2 } from 'three';

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



// CANVAS
export class Canvas {
    constructor(canvasSelector, aspect=2) {
        // CANVAS
        this.aspect = aspect;
        this.canvas = document.querySelector(canvasSelector);
        console.log("Aspect: " + this.canvas.aspect);
        this.parent = this.canvas.parentElement;
        this.style = getComputedStyle(this.parent); 
        this.num = parseFloat(this.style.width, 10);

        this.setAspect(aspect);
    }

    setAspect(aspect) {

        switch(aspect) {
            
            case 1:     // SQUARE ASPECT PROFILE
                {       
                    this.canvas.height = this.num;
                    this.canvas.width = this.num;
                    this.aspect = this.canvas.width / this.canvas.height;
                    this.canvas.aspect = this.canvas / this.canvas.height;
                }
                break;

            case 1.5:   // 1.5 ASPECT PROFILE
                {   
                    this.canvas.height = this.num * .75;
                    this.canvas.width = this.num;
                    this.aspect = this.canvas.width / this.canvas.height;
                    this.canvas.aspect = this.canvas / this.canvas.height;
                }
                break;

            case 0:     // WINDOW ASPECT PROFILE
                {   
                    this.canvas.height = window.innerHeight;
                    this.canvas.width = window.innerWidth;
                    this.aspect = this.canvas.width / this.canvas.height;
                    this.canvas.aspect = this.canvas / this.canvas.height;
                }
                break;

            default:
                break;
        };   
    }
}

export class BaseParameters {
    constructor() {
        // Geometry Parameters
        this.bondDistanceStart = 2;
        this.baseRadius = 0.4;
        this.phosphateRadius = 0.4;
        this.widthSegments = 20;
        this.heightSegments = 20;
        this.bondHeight = this.bondDistanceStart;
        this.bondRadius = 0.08;
        this.bondRadSegments = 8;
        this.bondHeightSegments = 1;

        // Create Geometry
        this.base_Geo = new THREE.SphereGeometry(this.baseRadius, this.widthSegments, this.heightSegments);
        this.phos_Geo = new THREE.SphereGeometry(this.phosphateRadius, this.widthSegments, this.heightSegments);
        this.bond_Geo = new THREE.CylinderGeometry(this.bondRadius, this.bondRadius, this.bondHeight, this.bondRadSegments, this.bondHeightSegments); 

        // Colors
        this.base_Color = 0x888888;
        this.phos_Color = 0x1480e1;
        this.bond_Color = 0x232323;

        // Positions
        this.base_Pos = {x:0, y:0, z:0};
        this.leftArm_Pos = {x:0, y:0, z:0};
        this.rightArm_Pos = {x:0, y:0, z:0};
        this.phosLeft_Pos = {x:-2, y:0, z:0};
        this.phosRight_Pos = {x:2, y:0, z:0};
    }
};

export class Base {       
    constructor(scene) {

        this.params = new BaseParameters();

        // Lists
        this.components = [];
        this.axesHelpers = [];

        // Left Arm
        this.bondLeft_Loc = new THREE.Object3D();
        this.bondLeft_Obj = this.makeInstance(params.bond_Geo, params.bond_Color, params.leftArm_Pos);
        this.phosLeft_Obj = this.makeInstance(params.phos_Geo, params.phos_Color, params.phosLeft_Pos);

        // Base
        this.basePair_Loc = new THREE.Object3D();
        this.basePair_Loc.name = "basePair_Loc";
        this.base_Obj = this.makeInstance(params.base_Geo, params.base_Color, params.base_Pos);
        this.base_Obj.name = "base_Obj";

        // Right Arm
        this.bondRight_Loc = new THREE.Object3D();
        this.bondRight_Obj = this.makeInstance(params.bond_Geo, params.bond_Color, params.rightArm_Pos);
        this.phosRight_Obj = this.makeInstance(params.phos_Geo, params.phos_Color, params.phosRight_Pos);

        this.addComponents();
        this.addObjectsToScene(scene);
        this.rig();
    }

    makeInstance(geometry, color, pos={x:0,y:0,z:0} , rot={x:0,y:0,z:0}) {
        const material = new THREE.MeshPhongMaterial({color});
        material.shininess = 20;
        // material.flatShading = true;
        // material.wireframe = true;
        const object = new THREE.Mesh(geometry, material);
        object.position.x = pos.x;
        object.position.y = pos.y;
        object.position.z = pos.z;
        return object;
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

    pushComponentsToList(list) {
        this.components.forEach((obj) => {
            list.push(obj);
        });
    }

    addObjectsToScene(scene) {
        this.components.forEach((obj) => {
            scene.add(obj);
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


export class Spring {
    constructor(scene, top, bot) {

        // Lists
        this.components = [];
        this.axesHelpers = [];

        // Parameters
        this.baseDistanceAtStart = 1.1;
        this.springRadius = 0.07;
        this.springHeight = this.baseDistanceAtStart;
        this.springRadSegments = 8;
        this.springHeightSegments = 1;
        this.spring_Geo = new THREE.CylinderGeometry(this.springRadius, this.springRadius, this.springHeight, this.springRadSegments, this.springHeightSegments);
        this.spring_Color = 0xEE8800;
        this.spring_Pos = {x:0, y:0, z:0};

        // Meshes
        this.topAtom_Loc = new THREE.Object3D();
        this.botAtom_Loc = new THREE.Object3D();
        this.spring_Obj = this.makeInstance(this.spring_Geo, this.spring_Color, this.spring_Pos);
        this.spring_Obj.material.transparent = true;
        this.spring_Obj.material.opacity = 0.5;

        this.addComponents();
        this.addObjectsToScene(scene);
        this.rig(top, bot);
    }

    makeInstance(geometry, color, pos={x:0,y:0,z:0} , rot={x:0,y:0,z:0}) {
        const material = new THREE.MeshPhongMaterial({color});
        material.shininess = 20;
        // material.flatShading = true;
        // material.wireframe = true;
        const object = new THREE.Mesh(geometry, material);
        object.position.x = pos.x;
        object.position.y = pos.y;
        object.position.z = pos.z;
        return object;
    }

    rig(top, bot) {

        this.baseDistance = this.baseDistanceAtStart;
        this.botAtom_Loc.add(this.spring_Obj);
        this.spring_Obj.position.z = this.baseDistance / 2.0;
        this.spring_Obj.rotation.x = degToRad(90);
        this.botAtom_Loc.rotation.x = degToRad(90);

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

        this.spring_Obj.scale.y = this.distance / (this.baseDistance );     // Length
        this.spring_Obj.position.z = this.distance / 2;                     // Center Position
        this.botAtom_Loc.lookAt(this.topPos);                               // Orientation
    }

    addComponents() {
        this.components.push(this.botAtom_Loc);
        this.components.push(this.topAtom_Loc);
        this.components.push(this.spring_Obj);
    }

    pushComponentsToList(list) {
        this.components.forEach((obj) => {
            list.push(obj);
        });
    }

    addObjectsToScene(scene) {
        this.components.forEach((obj) => {
            scene.add(obj);
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



export function dnaObject(canvas, renderer) {

    // // CANVAS
    // const canvas = document.querySelector(canvasSelector);
    // const parent = canvas.parentElement;
    // const style = getComputedStyle(parent); 
    // const num = parseFloat(style.width, 10);

    // // ASPECT RATIO
    // switch(aspect) {
    //     // case 2:
    //     //     break;
        
    //     case 1:     // SQUARE ASPECT PROFILE
    //         {       
    //             canvas.height = num;
    //             canvas.width = num;
    //             aspect = canvas.width / canvas.height;
    //         }
    //         break;
    //     case 1.5:   // 1.5 ASPECT PROFILE
    //         {   
    //             canvas.height = num * .75;
    //             canvas.width = num;
    //             aspect = canvas.width / canvas.height;
    //         }
    //         break;
    //     case 0:     // WINDOW ASPECT PROFILE
    //         {   
    //             canvas.height = window.innerHeight;
    //             canvas.width = window.innerWidth;
    //             aspect = canvas.width / canvas.height;
    //         }
    //         break;
    //     default:
    //         break;
    // };       

    // RENDERER    
    // const renderer = new THREE.WebGLRenderer(canvas);
    // const renderer = new THREE.WebGLRenderer({canvas});

    // CAMERA
    const fov = 30;
    const near = 0.1;
    const far = 500;
    const camera = new THREE.PerspectiveCamera(fov, canvas.aspect, near, far);
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
    // const group = new THREE.Group();
    // scene.add(group);

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
    // const objects = [];
    // const baseDistanceAtStart = 1.1;

    

    class BaseParameters {
        constructor() {
            // Geometry Parameters
            this.baseDistanceAtStart = 1.1;
            this.bondDistanceStart = 2;
            this.baseRadius = 0.4;
            this.phosphateRadius = 0.4;
            this.widthSegments = 20;
            this.heightSegments = 20;
            this.bondHeight = this.bondDistanceStart;
            this.bondRadius = 0.08;
            this.bondRadSegments = 8;
            this.bondHeightSegments = 1;

            // Create Geometry
            this.base_Geo = new THREE.SphereGeometry(this.baseRadius, this.widthSegments, this.heightSegments);
            this.phos_Geo = new THREE.SphereGeometry(this.phosphateRadius, this.widthSegments, this.heightSegments);
            this.bond_Geo = new THREE.CylinderGeometry(this.bondRadius, this.bondRadius, this.bondHeight, this.bondRadSegments, this.bondHeightSegments); 

            // Colors
            this.base_Color = 0x888888;
            this.phos_Color = 0x1480e1;
            this.bond_Color = 0x232323;

            // Positions
            this.base_Pos = {x:0, y:0, z:0};
            this.leftArm_Pos = {x:0, y:0, z:0};
            this.rightArm_Pos = {x:0, y:0, z:0};
            this.phosLeft_Pos = {x:-2, y:0, z:0};
            this.phosRight_Pos = {x:2, y:0, z:0};
        }
    };

    class Base {       
        constructor(scene) {

            this.params = new BaseParameters();

            // Lists
            this.components = [];
            this.axesHelpers = [];

            // Geometry Parameters
            this.baseDistanceAtStart = 1.1;
            this.bondDistanceStart = 2;
            this.baseRadius = 0.4;
            this.phosphateRadius = 0.4;
            this.widthSegments = 20;
            this.heightSegments = 20;
            this.bondHeight = this.bondDistanceStart;
            this.bondRadius = 0.08;
            this.bondRadSegments = 8;
            this.bondHeightSegments = 1;

            // Create Geometry
            this.base_Geo = new THREE.SphereGeometry(this.baseRadius, this.widthSegments, this.heightSegments);
            this.phos_Geo = new THREE.SphereGeometry(this.phosphateRadius, this.widthSegments, this.heightSegments);
            this.bond_Geo = new THREE.CylinderGeometry(this.bondRadius, this.bondRadius, this.bondHeight, this.bondRadSegments, this.bondHeightSegments); 

            // Colors
            this.base_Color = 0x888888;
            this.phos_Color = 0x1480e1;
            this.bond_Color = 0x232323;

            // Positions
            this.base_Pos = {x:0, y:0, z:0};
            this.leftArm_Pos = {x:0, y:0, z:0};
            this.rightArm_Pos = {x:0, y:0, z:0};
            this.phosLeft_Pos = {x:-2, y:0, z:0};
            this.phosRight_Pos = {x:2, y:0, z:0};
    
            // Left Arm
            this.bondLeft_Loc = new THREE.Object3D();
            this.bondLeft_Obj = this.makeInstance(this.bond_Geo, this.bond_Color, this.leftArm_Pos);
            this.phosLeft_Obj = this.makeInstance(this.phos_Geo, this.phos_Color, this.phosLeft_Pos);
    
            // Base
            this.basePair_Loc = new THREE.Object3D();
            this.basePair_Loc.name = "basePair_Loc";
            this.base_Obj = this.makeInstance(this.base_Geo, this.base_Color, this.base_Pos);
            this.base_Obj.name = "base_Obj";
    
            // Right Arm
            this.bondRight_Loc = new THREE.Object3D();
            this.bondRight_Obj = this.makeInstance(this.bond_Geo, this.bond_Color, this.rightArm_Pos);
            this.phosRight_Obj = this.makeInstance(this.phos_Geo, this.phos_Color, this.phosRight_Pos);
    
            this.addComponents();
            this.addObjectsToScene(scene);
            this.rig();
        }
    
        makeInstance(geometry, color, pos={x:0,y:0,z:0} , rot={x:0,y:0,z:0}) {
            const material = new THREE.MeshPhongMaterial({color});
            material.shininess = 20;
            // material.flatShading = true;
            // material.wireframe = true;
            const object = new THREE.Mesh(geometry, material);
            object.position.x = pos.x;
            object.position.y = pos.y;
            object.position.z = pos.z;
            return object;
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
    
        pushComponentsToList(list) {
            this.components.forEach((obj) => {
                list.push(obj);
            });
        }
    
        addObjectsToScene(scene) {
            this.components.forEach((obj) => {
                scene.add(obj);
            });
        }

        moveToPosRelativeToBaseAbove(base) {
            this.setPosY(base.basePair_Loc.position.y - this.baseDistanceAtStart);
        }

        setPosY(value) {
            this.basePair_Loc.position.y = value;
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
        constructor(scene, top, bot) {

            // Lists
            this.components = [];
            this.axesHelpers = [];

            // Parameters
            this.baseDistanceAtStart = 1.1;
            this.springRadius = 0.07;
            this.springHeight = this.baseDistanceAtStart;
            this.springRadSegments = 8;
            this.springHeightSegments = 1;
            this.spring_Geo = new THREE.CylinderGeometry(this.springRadius, this.springRadius, this.springHeight, this.springRadSegments, this.springHeightSegments);
            this.spring_Color = 0xEE8800;
            this.spring_Pos = {x:0, y:0, z:0};

            // Meshes
            this.topAtom_Loc = new THREE.Object3D();
            this.botAtom_Loc = new THREE.Object3D();
            this.spring_Obj = this.makeInstance(this.spring_Geo, this.spring_Color, this.spring_Pos);
            this.spring_Obj.material.transparent = true;
            this.spring_Obj.material.opacity = 0.5;

            this.addComponents();
            this.addObjectsToScene(scene);
            this.rig(top, bot);
        }

        makeInstance(geometry, color, pos={x:0,y:0,z:0} , rot={x:0,y:0,z:0}) {
            const material = new THREE.MeshPhongMaterial({color});
            material.shininess = 20;
            // material.flatShading = true;
            // material.wireframe = true;
            const object = new THREE.Mesh(geometry, material);
            object.position.x = pos.x;
            object.position.y = pos.y;
            object.position.z = pos.z;
            return object;
        }

        rig(top, bot) {

            this.baseDistance = this.baseDistanceAtStart;
            this.botAtom_Loc.add(this.spring_Obj);
            this.spring_Obj.position.z = this.baseDistance / 2.0;
            this.spring_Obj.rotation.x = degToRad(90);
            this.botAtom_Loc.rotation.x = degToRad(90);

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

            this.spring_Obj.scale.y = this.distance / (this.baseDistance );     // Length
            this.spring_Obj.position.z = this.distance / 2;                     // Center Position
            this.botAtom_Loc.lookAt(this.topPos);                               // Orientation
        }

        addComponents() {
            this.components.push(this.botAtom_Loc);
            this.components.push(this.topAtom_Loc);
            this.components.push(this.spring_Obj);
        }

        pushComponentsToList(list) {
            this.components.forEach((obj) => {
                list.push(obj);
            });
        }

        addObjectsToScene(scene) {
            this.components.forEach((obj) => {
                scene.add(obj);
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


    /**********************************************************************************
     * 
     *                 OBJECTS
     * 
     **********************************************************************************/

    // BASES
    const bases = [];
    const baseObjects = [];
    
    // const params = new BaseParameters();
    const base1 = new Base(scene);
    const base2 = new Base(scene);
    const base3 = new Base(scene);
    const base4 = new Base(scene);
    bases.push(base1);
    bases.push(base2);
    bases.push(base3);
    bases.push(base4);
    base1.basePair_Loc.position.y = 1;   
    base2.moveToPosRelativeToBaseAbove(base1);
    base3.moveToPosRelativeToBaseAbove(base2);
    base4.moveToPosRelativeToBaseAbove(base3);
    base1.pushComponentsToList(baseObjects);
    base2.pushComponentsToList(baseObjects);
    base3.pushComponentsToList(baseObjects);
    base4.pushComponentsToList(baseObjects);
    
    // SPRINGS
    const springs = [];

    // 1st Group
    const springL1 = new Spring(scene, base1.phosLeft_Obj, base2.phosLeft_Obj);
    const springC1 = new Spring(scene, base1.base_Obj, base2.base_Obj);
    const springR1 = new Spring(scene, base1.phosRight_Obj, base2.phosRight_Obj);
    springs.push(springL1);
    springs.push(springC1);
    springs.push(springR1);

    // 2nd Group
    const springL2 = new Spring(scene, base2.phosLeft_Obj, base3.phosLeft_Obj);
    const springC2 = new Spring(scene, base2.base_Obj, base3.base_Obj);
    const springR2 = new Spring(scene, base2.phosRight_Obj, base3.phosRight_Obj);
    springs.push(springL2);
    springs.push(springC2);
    springs.push(springR2);

    // 2nd Group
    const springL3 = new Spring(scene, base3.phosLeft_Obj, base4.phosLeft_Obj);
    const springC3 = new Spring(scene, base3.base_Obj, base4.base_Obj);
    const springR3 = new Spring(scene, base3.phosRight_Obj, base4.phosRight_Obj);
    springs.push(springL3);
    springs.push(springC3);
    springs.push(springR3);

    /**********************************************************************************/
    
    


    // // SPRING SIM                                                                       SOURCE: https://bit.ly/2WsQA5z
    // const framerate = 1/60;                                                             // Framerate to calculate how much to move each update
    // let stiffness = {k: -75};                                                           // Spring stiffness, in kg / s^2
    // let spring_length = baseDistanceAtStart;                                            // Spring Equilibrium distance
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
    let spring_length = base1.baseDistanceAtStart;                                            // Spring Equilibrium distance
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

    // GUI - MOVE
    gui.add(trans, "y", -2.0, 2.0).name('Move').onChange( function(value) {    
        const basePair_LocPosY = 1;
        base1.setPosY(value * 1 + basePair_LocPosY);
    });
    
    // GUI - FOLDER - SPRING OPTIONS
    let springOptionsGuiFolder = gui.addFolder('Spring Options');

    // GUI - DAMPING
    springOptionsGuiFolder.add(damping, "b", -8.000, 0.000).name('Damping').onChange( function(value) {  
        damping.b = value;
    });

    // GUI - STIFFNESS
    springOptionsGuiFolder.add(stiffness, "k", -100, 0).name('Stiffness').onChange( function(value) {    
        stiffness.k = value;
    });

    // GUI - VISIBLE
    springOptionsGuiFolder.add(showSprings, "visible").name('Show Springs').onChange( function(value) {  
        springs.forEach((node) => {
            node.spring_Obj.visible = value;
        })
    });

    // GUI - FOLDER - DEBUG
    let debugGuiFolder = gui.addFolder('Debug');

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
        
        // let size = new THREE.Vector2();
        // renderer.getSize(size);
        // console.log("Resized Render: " + size.y);
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
        let canvas = renderer.domElement;
        // console.log("Canvas: " + canvas.clientHeight);
        let width = canvas.clientWidth;
        let height = canvas.clientHeight;
        // console.log("Height: " + height);
        // console.log("Width: " + width);
        let needResize = canvas.width !== width || canvas.height !== height;
        if (needResize) {
            renderer.setSize(width, height, false);
            camera.aspect = width / height;
            camera.updateProjectionMatrix();
        }
        return needResize;
    } 
}


// PAUSE RENDER - https://stackoverflow.com/questions/38034787/three-js-and-buttons-for-start-and-pause-animation


