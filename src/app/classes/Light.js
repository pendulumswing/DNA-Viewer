import * as THREE from 'three';


// DNAOBJECT - BASE CLASS
export default class Light {     

    constructor(scene, options={}) {

        // Default Values
        this.defaults = {
            type: "directional",
            color: 0xFFFFFF,
            intensity: 0.1,
            position: [-1, 2, 4],
            lookAt: [0,0,0],
            penumbra: 0.5,
            skyColor: 0xFFFFFF,
            groundColor: 0xFFFFFF,
            distance: 0,            // 0 = 'no limit'
            decay: 2,               // Default in THREEjs is 1; physically accurate is 2
            width: 10,
            height: 10,
            angle: Math.PI/3,
        }

        // Combine Defaults with Options Parameter
        options = Object.assign({}, this.defaults, options);   
        
        // Parameters
        this.scene = scene;
        this.type = options.type;
        this.color = options.color;
        this.intensity = options.intensity;
        this.position = options.position;
        this.lookAt = options.lookAt;
        this.penumbra = options.penumbra;        
        this.skyColor = options.skyColor;
        this.groundColor = options.groundColor;
        this.distance = options.distance;
        this.decay = options.decay;
        this.width = options.width;
        this.height = options.height;
        this.angle = options.angle;
        this.light;
        this.helper;

        this.createLight(this.color, this.intensity);        
    }

    createLight(color, intensity) {

        if(this.type === "directional") {
            this.light = new THREE.DirectionalLight(color, intensity);       
        } else if (this.type === "hemisphere") {
            this.light = new THREE.HemisphereLight(this.skyColor, this.groundColor, intensity);   
        } else if (this.type === "point") {
            this.light = new THREE.PointLight(color, intensity, this.distance, this.decay);  
        } else if (this.type === "area") {
            this.light = new THREE.RectAreaLight(color, intensity, this.width, this.height);            
        } else if (this.type === "spot") {
            this.light = new THREE.SpotLight(color, intensity, this.distance, this.angle, this.penumbra, this.decay);
            // this.light.penumbra = this.penumbra;            
        } else if (this.type === "ambient") {
            this.light = new THREE.AmbientLight(color, intensity);   
        }

        this.light.lookAt(this.lookAt[0], this.lookAt[1], this.lookAt[2]);        
        this.light.position.set(this.position[0], this.position[1], this.position[2])

        this.scene.add(this.light);
    }

    addHelper(size=1, color=this.color) {

        if(this.type === "directional") {
            this.helper = new THREE.DirectionalLightHelper(this.light, size, color);
        } else if (this.type === "hemisphere") {
            this.helper = new THREE.HemisphereLightHelper(this.light, size, color);   
        } else if (this.type === "point") {
            this.helper = new THREE.PointLightHelper(this.light, size, color);  
        } else if (this.type === "area") {
            this.helper = new THREE.RectAreaLightHelper(this.light, color);       
        } else if (this.type === "spot") {
            this.helper = new THREE.SpotLightHelper(this.light);        
        }

        this.scene.add(this.helper);
    }

    removeHelper() {
        this.helper.dispose();
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