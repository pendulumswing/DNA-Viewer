import * as THREE from '../build/three.js';
import degToRad from '../utils/degToRad';
import makeInstance from '../utils/makeInstance';
import BASE_DISTANCE_START from '../constants/BASE_DISTANCE_START';

// export default class Spring {
//     constructor(top, bot, params) {
//         const { spring_Geo, spring_Color, spring_Pos } = params;

//         this.components = [];
//         this.axesHelpers = [];
//         // Make Spring Objects   (2 Empty, 1 Cylinder)
//         this.topAtom_Loc = new THREE.Object3D();
//         scene.add(this.topAtom_Loc);
//         this.botAtom_Loc = new THREE.Object3D();
//         scene.add(this.botAtom_Loc);
//         this.spring_Obj = makeInstance(spring_Geo, spring_Color, spring_Pos);
//         this.spring_Obj.material.transparent = true;
//         this.spring_Obj.material.opacity = 0.5;
//         this.baseDistance = BASE_DISTANCE_START;

//         // this.botAtom_Loc.position.set(bot);
//         this.botAtom_Loc.add(this.spring_Obj);
//         this.spring_Obj.position.z = this.baseDistance / 2;
//         this.spring_Obj.rotation.x = degToRad(90);
//         this.botAtom_Loc.rotation.x = degToRad(90);

//         this.rig(top, bot);
//         this.addComponents();
//     }

//     rig(top, bot) {
//         top.add(this.topAtom_Loc);
//         bot.add(this.botAtom_Loc);

//         this.topAtom_Loc.position.set(0,0,0);       // Local Position
//         this.botAtom_Loc.position.set(0,0,0);
//     }

//     update() {
//         this.vector1 = new THREE.Vector3();                                 // Necessary Target Vector for 'getWorldPosition()' methods
//         this.vector2 = new THREE.Vector3();
//         this.botPos = this.botAtom_Loc.getWorldPosition(this.vector1);
//         this.topPos = this.topAtom_Loc.getWorldPosition(this.vector2);
//         this.distance = this.botPos.distanceTo(this.topPos);                // Distance between Atoms

//         this.spring_Obj.scale.y = this.distance / this.baseDistance;        // Length
//         this.spring_Obj.position.z = this.distance / this.baseDistance;     // Center Position
//         this.botAtom_Loc.lookAt(this.topPos);                               // Orientation
//     }

//     addComponents() {
//         this.components.push(this.botAtom_Loc);
//         this.components.push(this.topAtom_Loc);
//         this.components.push(this.spring_Obj);
//     }

//     addAxesHelper() {
//         this.components.forEach((node) => {
//             const axes = new THREE.AxesHelper();
//             axes.material.depthTest = false;
//             axes.renderOrder = 1;
//             this.axesHelpers.push(axes);
//             node.add(axes);
//         });
//     }

//     hideAxesHelper() {
//         this.axesHelpers.forEach((node) => {
//             node.visible = false;
//         });
//     }
// }


export default class Spring {
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
        // this.baseDistance = BASE_DISTANCE_START;
        this.baseDistance = BASE_DISTANCE_START;

        // this.botAtom_Loc.position.set(bot);
        this.botAtom_Loc.add(this.spring_Obj);
        this.spring_Obj.position.z = this.baseDistance / 2.0;
        // this.spring_Obj.position.z = 20;
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
        // console.log("Distance: " + this.distance);

        this.spring_Obj.scale.y = this.distance / (this.baseDistance );        // Length
        this.spring_Obj.position.z = this.distance / 2;     // Center Position
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