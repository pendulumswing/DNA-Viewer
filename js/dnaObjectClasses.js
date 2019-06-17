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

// DNAOBJECT - BASE CLASS
export class DNAObject {       
    constructor(scene) {

        // Lists
        this.components = [];
        this.axesHelpers = [];
        this.scene = scene;
    }

    dispose() {                             // Dispose of assets not collected by GC
        console.log("Dispose called")
        this.components.forEach(node => {
            if(node.geometry) {
                // console.log("Node: Geo: " + node.name + ", " + node.geometry);
                node.geometry.dispose();
                // console.log("Node: Geo: " + node.name + ", " + node.geometry);
            }
            if(node.material) {
                // console.log("Node: Mat: " + node.name + ", " + node.material);
                node.material.dispose();
                // console.log("Node: Mat: " + node.name + ", " + node.material);
            }        
        });
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

// BASE
export class Base extends DNAObject {       
    constructor(scene) {

        super(scene);        

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

        // return {getYPos: this.basePair_Loc.y};
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

    moveToPosRelativeToBaseAbove(base) {
        this.setPosY(base.basePair_Loc.position.y - this.baseDistanceAtStart);
    }

    setPosY(value) {
        this.basePair_Loc.position.y = value;
    }

    getPosY() {
        return this.basePair_Loc.position.y;
    }

    setRotY(value) {
        this.basePair_Loc.rotation.y = value;
    }

    getRotY() {
        return this.basePair_Loc.rotation.y;
    }
};

// SPRING
export class Spring extends DNAObject {
    constructor(scene, top, bot) {

        super(scene);

        // Spring Properties
        this.framerate = 1/60;                                                             // Framerate to calculate how much to move each update
        this.stiffness = {k: -175};                                                           // Spring stiffness, in kg / s^2
        this.springLength = 1.1;                                   // Spring Equilibrium distance
        this.damping = {b: -25.0};                                                            // Damping constant, in kg / s
        this.speed = 2.5;

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

    springSimulate(topObject, botObject, lastInChain=false) {
        

        this.top = {y: 1, ly: -1, v: 0, mass: 1, frequency: 0, t: 0};                    // Object to hold Top Base Spring Data
        this.bot = {y: -1, ly: -1, v: 0, mass: 1, frequency: 0, t: 0};                   // Object to hold Bottom Base Spring Data

        this.top.y = topObject.getPosY();                                        // Grab Current Position
        this.bot.y = botObject.getPosY();

        if(this.top.y - this.bot.y != this.springLength)                                      // If not in Equilibrium
        {
            this.F_spring = this.stiffness.k * ((this.top.y - this.bot.y) - this.springLength);     // Springiness
            this.F_damper = this.damping.b * (this.top.v - this.bot.v);                         // Damper Force

            this.a = (this.F_spring + this.F_damper) / this.top.mass;                               // Top Calc
            this.top.v += this.a * this.framerate;
            this.top.y += this.top.v * this.framerate;

            this.c;
            if(lastInChain) {
                this.c = (this.F_spring + this.F_damper) / (this.bot.mass );                               // Bottom Calc    
            } else {
                this.c = (this.F_spring + this.F_damper) / this.bot.mass;                               // Bottom Calc
            }
            this.bot.v -= this.c * this.framerate;
            this.bot.y += this.bot.v * this.framerate * this.speed;                                 // Speed Multiplier added to smooth it out
        }

        topObject.setPosY(this.top.y);                                        // Update Position of Bases
        botObject.setPosY(this.bot.y);
    }

    setStiffness(value) {
        this.stiffness.k = value;
    }

    setDamping(value) {
        this.damping.b = value;
    }

    setSpringLength(value) {
        this.springLength = value;
    }
};


