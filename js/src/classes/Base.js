import * as THREE from '../build/three.js';
import degToRad from '../utils/degToRad';
import makeInstance from '../utils/makeInstance';

export default class Base {
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
        this.basePair_Loc.name = "basePair_Loc";
        scene.add(this.basePair_Loc);
        group.add(this.basePair_Loc);
        this.base_Obj = makeInstance(base_Geo, base_Color, base_Pos);
        this.base_Obj.name = "base_Obj";

        // Right Arm
        this.bondRight_Loc = new THREE.Object3D();
        scene.add(this.bondRight_Loc);
        this.bondRight_Obj = makeInstance(bond_Geo, bond_Color, rightArm_Pos);
        this.phosRight_Obj = makeInstance(phos_Geo, phos_Color, phosRight_Pos);

        this.rig();
        this.addComponents();
        this.addComponentsToBaseObjects();
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

    addComponentsToBaseObjects() {
        this.components.forEach((obj) => {
            baseObjects.push(obj);
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
