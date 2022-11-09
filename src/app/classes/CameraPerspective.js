/*********************************************************************************
Camera - Creates a Camera Object
*********************************************************************************/

'use strict';

// import {Canvas, Base, Spring} from './dnaObjectClasses.js';
import * as THREE from 'three';

export default class CameraPerspective {    
    
    constructor(options={}) {

        // Default Values
        this.defaults = {
            aspect: 2,
            fov: 30,
            near: 0.1,
            far: 500,        
            position: [10,3,15],
            lookAt: [0,-1,0],
            up: [0,1,0],
        }

        // Combine Defaults with Options Parameter
        options = Object.assign({}, this.defaults, options); 

        console.log("Position: " + options.position);
        console.log(this);

        this.aspect = options.aspect;
        this.fov = options.fov;
        this.near = options.near;
        this.far = options.far;
        this.position = options.position;
        this.lookAt = options.lookAt;
        this.up = options.up;     
        this.camera;

        this.createCamera();
    }  
    
    createCamera() {
        this.camera = new THREE.PerspectiveCamera(this.fov, this.aspect, this.near, this.far);
        this.camera.position.set(this.position[0], this.position[1], this.position[2]);
        this.camera.lookAt(this.lookAt[0], this.lookAt[1], this.lookAt[2]);
        this.camera.up.set(this.up[0], this.up[1], this.up[2]);  
    }
}