import * as THREE from 'three';
import DNAObject from './DNAObject.js';
import degToRad from '../utils/degToRad.js';
// import BASE_DISTANCE_START from '../constants/BASE_DISTANCE_START';
import Constants from '../constants/Constants.js';

// SPRING
export default class Spring extends DNAObject {
    constructor(scene, top, bot) {

        super(scene);

        // Spring Properties
        this.framerate = 1/60;                                                             // Framerate to calculate how much to move each update
        this.stiffness = {k: -175};                                                           // Spring stiffness, in kg / s^2
        this.springLength = 1.1;                                   // Spring Equilibrium distance
        this.damping = {b: -25.0};                                                            // Damping constant, in kg / s
        this.speed = 2.5;

        // Parameters
        // this.baseDistanceAtStart = 1.1;
        this.springRadius = 0.07;
        // this.springHeight = BASE_DISTANCE_START;
        this.springHeight = Constants.BASE_DISTANCE_START;
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

        // this.baseDistance = this.baseDistanceAtStart;
        this.baseDistance = Constants.BASE_DISTANCE_START;
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