/*
 * Make Object instance and Add to scene
 */

import * as THREE from 'three';

export default function makeInstance(geometry, color, pos={x:0,y:0,z:0} , rot={x:0,y:0,z:0}) {
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
