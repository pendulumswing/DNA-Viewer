import * as THREE from 'three';


// DNAOBJECT - BASE CLASS
export default class Light {     

    constructor(scene, options={}) {

        // Default Values
        const defaults = {
            type: "directional",
            color: 0xFFFFFF,
            intensity: 0.1,
            position: (-1, 2, 4),
            lookAt: (0,0,0),
            penumbra: 0.5,
        }

        console.log("Position: " + this.position);
        console.log("LookAt: " + this.lookAt);

        // Combine Defaults with Options Parameter
        options = Object.assign({}, defaults, options);   
        
        this.type = options.type;
        this.color = options.color;
        this.intensity = options.intensity;
        this.position = options.position;
        this.lookAt = options.lookAt;
        this.penumbra = options.penumbra;

        console.log("Position: " + this.position);
        console.log("LookAt: " + this.lookAt);
        
        this.light;
        this.createLight(this.color, this.intensity);
        // this.light = new THREE.DirectionalLight(this.color, this.intensity);
        console.log("Light is: " + this.light);
        // if("scene" in options) {
        //     console.log("Scene Found");
            this.addLightToScene(options.scene);
        // }
    }

    createLight(color, intensity) {

        // this.light = null;

        if(this.type === "directional") {
            this.light = new THREE.DirectionalLight(color, intensity);
            console.log("New Directional LIght");
        } else if (this.type === "ambient") {
            this.light = new THREE.AmbientLight(color, intensity);            
        } else if (this.type === "spotlight") {
            this.light = new THREE.SpotLight(color, intensity);
            this.light.penumbra = this.penumbra;            
        }

        this.light.lookAt(this.lookAt);        
        this.light.position.set(this.position)
    }

    addLightToScene(scene) {
        scene.add(this.light);
    }
}


/**********************************************************************************
     * 
     *      LIGHTS
     * 
     **********************************************************************************/

    // // LIGHT - Directional
    // {
    //     const color = 0xFFFFFF;
    //     const intensity = .8;
    //     const light = new THREE.DirectionalLight(color, intensity);
    //     light.position.set(-1, 2, 4);
    //     scene.add(light);
    //     // var helper = new THREE.DirectionalLightHelper(light, 1);
    //     // scene.add(helper);
    // }

    // // LIGHT - Ambient
    // {
    //     const color = 0xFFFFFF;
    //     const intensity = 0.6;
    //     const light = new THREE.AmbientLight(color, intensity);
    //     light.position.set(-1, 2, 4);
    //     scene.add(light);
    // }

    // // LIGHT - Spotlight  (backlight)
    // {
    //     const color = 0xAAFFFF;
    //     const intensity = 0.4;
    //     const light = new THREE.SpotLight(color, intensity);
    //     light.position.set(-1, -1, -5);
    //     light.penumbra = 0.5;
    //     light.lookAt(new THREE.Vector3(0,0,0));
    //     scene.add(light);
    //     // var helper = new THREE.SpotLightHelper(light);
    //     // scene.add(helper);
    // }