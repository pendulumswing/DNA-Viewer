/*********************************************************************************
 DNA Bases - Creates an interactive 3D pair of Base Pairs.
 *********************************************************************************/

/*
 * Import ThreeJS. Must expose on Window for OrbitControls to work.
 */

// var THREE = require('three');
// window.THREE = THREE;
// require('./js/controls/OrbitControls');

/*
 * Alternative approach is to use the three-orbitcontrols package,
 * but with this approach you can't access it via THREE.OrbitControls.
 */

// import * as THREE from 'three';
import * as THREE from '/build/three.js';
// import OrbitControls from 'three-orbitcontrols';
import OrbitControls from '/controls/OrbitControls.js';

import * as dat from '/libs/dat.gui.min.js';

/*
 * Import helper functions
 */

import resizeRendererToDisplaySize from './utils/resizeRendererToDisplaySize.js';
import checkAxesHelpers from './utils/checkAxesHelpers.js';

/*
 * Import constants
 */

import BASE_DISTANCE_START from './constants/BASE_DISTANCE_START.js';


import Spring from './classes/Spring.js';
import Base from './classes/Base.js';

/*
 * Render the application
 */

// RENDERER
const canvas = document.querySelector('#canvas');
const renderer = new THREE.WebGLRenderer({canvas});
const gui = new dat.GUI();

// CAMERA
const fov = 30;
const aspect = 2;
const near = 0.1;
const far = 500;
const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
camera.position.set(10,5,10);
camera.lookAt(0,-1,0);
camera.up.set(0,1,0);

// CONTROLS - ORBITAL
// var controls = new THREE.OrbitControls( camera, renderer.domElement );
var controls = new OrbitControls( camera, renderer.domElement );
controls.update();

// SCENE
const scene = new THREE.Scene();
window.scene = scene;
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
window.objects =objects;

// const BASE_DISTANCE_START = 2;

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

// OBJECTS (Meshes)

// Ground Plane
// const groundPlane_Obj = makeInstance(groundPlane_Geo, groundPlane_Color);
// groundPlane_Obj.rotation.x = -(degToRad(90));
// groundPlane_Obj.position.y = -2;

// BASES
const bases = [];
const base1 = new Base({
    scene,
    bond_Geo,
    bond_Color,
    leftArm_Pos,
    phos_Geo,
    phos_Color,
    phosLeft_Pos,
    rightArm_Pos,
    phosRight_Pos,
    base_Geo,
    base_Color,
    base_Pos
});
const base2 = new Base({
    scene,
    bond_Geo,
    bond_Color,
    leftArm_Pos,
    phos_Geo,
    phos_Color,
    phosLeft_Pos,
    rightArm_Pos,
    phosRight_Pos,
    base_Geo,
    base_Color,
    base_Pos
});
base1.basePair_Loc.position.y = 1;
base2.basePair_Loc.position.y = base1.basePair_Loc.position.y - BASE_DISTANCE_START;
bases.push(base1);
bases.push(base2);

// SPRINGS
const springs = [];
const springL = new Spring(base1.phosLeft_Obj, base2.phosLeft_Obj, { spring_Geo, spring_Color, spring_Pos });
const springC = new Spring(base1.base_Obj, base2.base_Obj, { spring_Geo, spring_Color, spring_Pos });
const springR = new Spring(base1.phosRight_Obj, base2.phosRight_Obj, { spring_Geo, spring_Color, spring_Pos });
springs.push(springL);
springs.push(springC);
springs.push(springR);


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

    if((topBase.y - botBase.y) !== spring_length)                                      // If not at Equilibrium
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

gui.add(damping, "b", -5.000, 0.000).name('Bond Damping').onChange( function(value) {
    damping.b = value;
});

gui.add(stiffness, "k", -100, 0).name('Bond Stiffness').onChange( function(value) {
    stiffness.k = value;
});

gui.add(showSprings, "visible").name('Show Springs').onChange( function(value) {
    springs.forEach((node) => {
        node.spring_Obj.visible = value;
    })
});

gui.add(showAxes, "visible").name('Show Axes').onChange( function(value) {
    checkAxesHelpers(value, springs, bases);
});



// RENDER
renderer.render(scene, camera);

// RENDER UPDATE LOOP
function render(time) {
    time *= 0.001;  // converts time to seconds

    // Responisve Aspect Ratio
    if(resizeRendererToDisplaySize(renderer)) {
        const canvas = renderer.domElement;
        camera.aspect = canvas.clientWidth / canvas.clientHeight;
        camera.updateProjectionMatrix();
    }

    // Animate Objects
    // objects.forEach((obj, index) => {
    //     const speed = 1 + index * 0.1;
    //     const rot = time * speed;
    //     const pos = (((1 + index) + time) % 3) /0.5 -3;
    //     obj.rotation.x = rot;
    //     obj.rotation.y = rot;
    //     obj.position.x = pos;
    // });

    // add an AxesHelper to each node
    // objects.forEach((node) => {
    //     const axes = new THREE.AxesHelper();
    //     axes.material.depthTest = false;
    //     axes.renderOrder = 1;
    //     node.add(axes);
    // });

    // SPRINGS
    springLoop();
    springs.forEach((node) => {
        node.update();
    });

    controls.update();
    requestAnimationFrame(render);
    renderer.render(scene, camera);
}
requestAnimationFrame(render);
