/*********************************************************************************
DNA Bases - Creates an interactive 3D pair of Base Pairs.
*********************************************************************************/
// var THREE = require('three'); 

'use strict';

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

function main() {
    
     

    // CANVAS
    let canvas = document.querySelector('#c');
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
        // const parent = canvas.parentElement;
        // const style = getComputedStyle(parent); 
        // const num = parseFloat(style.width, 10);
        // canvas.height = num * .75;
        // canvas.width = num;
        // aspect = canvas.width / canvas.height;
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
    camera.position.set(10,5,10);
    camera.lookAt(0,-1,0);
    camera.up.set(0,1,0);  

    // GUI DOM
    const gui = new dat.GUI( { autoPlace: false } );        // SOURCE: https://jsfiddle.net/2pha/zka4qkt2/
    const guiContainer = document.getElementById('gui');
    guiContainer.appendChild(gui.domElement);
    
    

    // CONTROLS - ORBITAL
    var controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.update();

    // SCENE
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xAAAAAA);

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
    const BASE_DISTANCE_START = 2;

    // Geometry Parameters
    const baseRadius = 0.4;
    const phosphateRadius = 0.4;
    const widthSegments = 20;
    const heightSegments = 20;
    const cylHeight = 2;
    const cylRadius = 0.08;
    const cylRadSegments = 8;
    const cylHeighSegments = 1;
    const planeWidth = 8;
    const springRadius = 0.07;
    const springHeight = 2;
    const springRadSegments = 8;
    const springHeightSegments = 1;

    // Create Geometry
    const base_Geo = new THREE.SphereGeometry(baseRadius, widthSegments, heightSegments);
    const phos_Geo = new THREE.SphereGeometry(phosphateRadius, widthSegments, heightSegments);
    const bond_Geo = new THREE.CylinderGeometry(cylRadius, cylRadius, cylHeight, cylRadSegments, cylHeighSegments);    
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
            scene.add(this.basePair_Loc);
            this.base_Obj = makeInstance(base_Geo, base_Color, base_Pos);

            // Right Arm
            this.bondRight_Loc = new THREE.Object3D();
            scene.add(this.bondRight_Loc);
            this.bondRight_Obj = makeInstance(bond_Geo, bond_Color, rightArm_Pos);
            this.phosRight_Obj = makeInstance(phos_Geo, phos_Color, phosRight_Pos);

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

            this.addComponents();
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
            this.baseDistance = BASE_DISTANCE_START;

            // this.botAtom_Loc.position.set(bot);
            this.botAtom_Loc.add(this.spring_Obj);
            this.spring_Obj.position.z = this.baseDistance / 2;
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

            this.spring_Obj.scale.y = this.distance / this.baseDistance;        // Length
            this.spring_Obj.position.z = this.distance / this.baseDistance;     // Center Position
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

    // BASES
    const bases = [];
    const base1 = new Base();
    const base2 = new Base();
    base1.basePair_Loc.position.y = 1;
    base2.basePair_Loc.position.y = base1.basePair_Loc.position.y - BASE_DISTANCE_START;    
    bases.push(base1);
    bases.push(base2);

    // SPRINGS
    const springs = [];
    const springL = new Spring(base1.phosLeft_Obj, base2.phosLeft_Obj);
    const springC = new Spring(base1.base_Obj, base2.base_Obj);
    const springR = new Spring(base1.phosRight_Obj, base2.phosRight_Obj);
    springs.push(springL);
    springs.push(springC);
    springs.push(springR);

    
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
            console.log("Turn off");
            springs.forEach((node) => {
                node.hideAxesHelper();
            })
    
            bases.forEach((node) => {
                node.hideAxesHelper();
            })
        }
    }
    
    // SPRING SIM                                                                       SOURCE: https://bit.ly/2WsQA5z
    const framerate = 1/60;                                                             // Framerate to calculate how much to move each update
    let stiffness = {k: -20};                                                           // Spring stiffness, in kg / s^2
    let spring_length = BASE_DISTANCE_START;                                            // Spring Equilibrium distance
    let damping = {b: -0.5};                                                            // Damping constant, in kg / s

    var topBase = {y: 1, v: 0, mass: 1};                                                // Object to hold Top Base Spring Data
    var botBase = {y: -1, ly: -1, v: 0, mass: 1, frequency: 0, t: 0};                   // Object to hold Bottom Base Spring Data

    var springLoop = function() {
        
        topBase.y = base1.basePair_Loc.position.y;                                      // Grab Current Position
        botBase.y = base2.basePair_Loc.position.y;

        if(topBase.y - botBase.y != spring_length)                                      // If not at Equilibrium
        {
            let F_spring = stiffness.k * ((topBase.y - botBase.y) - spring_length);     // Springiness
            let F_damper = damping.b * (topBase.v - botBase.v);                         // Damper Force

            let a = (F_spring + F_damper) / topBase.mass;                               // Top Calc
            topBase.v += a * framerate;
            topBase.y += topBase.v * framerate;
            
            let c = (F_spring + F_damper) / botBase.mass;                               // Bottom Calc
            botBase.v -= c * framerate;
            botBase.y += botBase.v * framerate;
        }

        base1.basePair_Loc.position.y = topBase.y;                                      // Update Position of Bases
        base2.basePair_Loc.position.y = botBase.y;
    };


    

    // GUI 
    const trans = {x:0, y:0, z:0};
    const harmonicRot = {x:0, y:0, z:0}; 
    const dihedralRot = {x:0, y:0, z:0};  
    let showSprings = {visible: true};
    let showAxes = {visible: false};

    gui.add(harmonicRot, "y", -1.000, 1.000).name('Angle').onChange( function(value) {     // SOURCE: https://bit.ly/2I4pqbM
        base1.bondLeft_Loc.rotation.y = value;
        base1.bondRight_Loc.rotation.y = -value;
        base2.bondLeft_Loc.rotation.y = value;
        base2.bondRight_Loc.rotation.y = -value;
    });
    
    gui.add(dihedralRot, "y", -1.000, 1.000).name('Dihedral').onChange( function(value) {  
        base1.basePair_Loc.rotation.y = value;
    });

    gui.add(trans, "y", -2.0, 2.0).name('Distance').onChange( function(value) {    
        const basePair_LocPosY = 1;
        base1.basePair_Loc.position.y = value * 1 + basePair_LocPosY;
    });
    
    let springOptionsGuiFolder = gui.addFolder('Spring Options');

    springOptionsGuiFolder.add(damping, "b", -5.000, 0.000).name('Damping').onChange( function(value) {  
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

    gui.close();
    



    // PAUSE RENDER - https://stackoverflow.com/questions/38034787/three-js-and-buttons-for-start-and-pause-animation



    // RENDER
    renderer.render(scene, camera);

    base1.basePair_Loc.position.y = 1.5;    // Start with a little springiness on load

    // RENDER UPDATE LOOP
    function render(time) {
        time *= 0.001;  // converts time to seconds

        // Responisve Aspect Ratio
        // if(resizeRendererToDisplaySize(renderer)) {
        //     const canvas = renderer.domElement;
        //     camera.aspect = canvas.clientWidth / canvas.clientHeight;
        //     camera.updateProjectionMatrix();
        // }

        resizeRendererToDisplaySize(renderer);
        
        // SPRINGS
        springLoop();
        springs.forEach((node) => {
            node.update();
        })
        
        controls.update();
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

main();

// Split(['#view', '#controls'], {  // eslint-disable-line new-cap
//     sizes: [75, 25],
//     minSize: 100,
//     elementStyle: (dimension, size, gutterSize) => {
//       return {
//         'flex-basis': `calc(${size}% - ${gutterSize}px)`,
//       };
//     },
//     gutterStyle: (dimension, gutterSize) => {
//       return {
//         'flex-basis': `${gutterSize}px`,
//       };
//     },
//   });
                
                


// Animate Objects
// objects.forEach((obj, index) => {
//     const speed = 1 + index * 0.1;
//     const rot = time * speed;
//     const pos = (((1 + index) + time) % 3) /0.5 -3;
//     obj.rotation.x = rot;
//     obj.rotation.y = rot; 
//     obj.position.x = pos;
// });  