
import * as THREE from 'three';

// DNAOBJECT - BASE CLASS
export default class PrimitiveObject {     

    constructor(options={}) {
        
        this.components = [];
        this.axesHelpers = [];
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