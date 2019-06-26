import * as THREE from 'three';
import PrimitiveObject from './PrimitiveObject.js';
import degToRad from '../utils/degToRad.js';
// import BASE_DISTANCE_START from '../constants/BASE_DISTANCE_START';
import Constants from '../constants/Constants.js';

// BASE
export default class Base extends PrimitiveObject {       
    constructor(scene) {

        super(scene);        

        // Geometry Parameters
        // this.baseDistanceAtStart = 1.1;
        // this.bondDistanceStart = 2;
        this.baseRadius = 0.4;
        this.phosphateRadius = 0.4;
        this.widthSegments = 20;
        this.heightSegments = 20;
        // this.bondHeight = this.bondDistanceStart;
        this.bondHeight = Constants.BOND_DISTANCE_START;
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
        // this.setPosY(base.basePair_Loc.position.y - this.baseDistanceAtStart);
        this.setPosY(base.basePair_Loc.position.y - Constants.BASE_DISTANCE_START);
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