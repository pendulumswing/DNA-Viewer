


// Array of objects
const objects = [];
const BASE_DISTANCE_START = 2;

// Geometry Parameters
const baseRadius = 0.4;
const phosphateRadius = 0.4;
const widthSegments = 20;
const heightSegments = 20;
const cylHeight = 2;
const cylRadius = 0.08;
const cylRadSegments = 8;
const cylHeighSegments = 1;
const planeWidth = 8;
const springRadius = 0.07;
const springHeight = 2;
const springRadSegments = 8;
const springHeightSegments = 1;

// Create Geometry
const base_Geo = new THREE.SphereGeometry(baseRadius, widthSegments, heightSegments);
const phos_Geo = new THREE.SphereGeometry(phosphateRadius, widthSegments, heightSegments);
const bond_Geo = new THREE.CylinderGeometry(cylRadius, cylRadius, cylHeight, cylRadSegments, cylHeighSegments);    
const spring_Geo = new THREE.CylinderGeometry(springRadius, springRadius, springHeight, springRadSegments, springHeightSegments);
const groundPlane_Geo = new THREE.PlaneGeometry(planeWidth, planeWidth);

// Colors
const base_Color = 0x888888;
const phos_Color = 0x1480e1;
const bond_Color = 0x232323;
const spring_Color = 0xEE8800;
const groundPlane_Color = 0x99aa99;
    
// Positions
const base_Pos = {x:0, y:0, z:0};
const leftArm_Pos = {x:0, y:0, z:0};
const rightArm_Pos = {x:0, y:0, z:0};
const phosLeft_Pos = {x:-2, y:0, z:0};
const phosRight_Pos = {x:2, y:0, z:0};
const spring_Pos = {x:0, y:0, z:0};

// Make Object instance and Add to scene
function makeInstance(geometry, color, pos={x:0,y:0,z:0} , rot={x:0,y:0,z:0}) {
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

export class Base {
    constructor(scene) {

        this.components = [];
        this.axesHelpers = [];

        // Left Arm
        this.bondLeft_Loc = new THREE.Object3D();
        scene.add(this.bondLeft_Loc);
        this.bondLeft_Obj = makeInstance(bond_Geo, bond_Color, leftArm_Pos);
        this.phosLeft_Obj = makeInstance(phos_Geo, phos_Color, phosLeft_Pos);

        // Base
        this.basePair_Loc = new THREE.Object3D();
        scene.add(this.basePair_Loc);
        this.base_Obj = makeInstance(base_Geo, base_Color, base_Pos);

        // Right Arm
        this.bondRight_Loc = new THREE.Object3D();
        scene.add(this.bondRight_Loc);
        this.bondRight_Obj = makeInstance(bond_Geo, bond_Color, rightArm_Pos);
        this.phosRight_Obj = makeInstance(phos_Geo, phos_Color, phosRight_Pos);

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

        this.addComponents();
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

export class Spring {
    constructor(scene, top, bot) {

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
        this.baseDistance = BASE_DISTANCE_START;

        // this.botAtom_Loc.position.set(bot);
        this.botAtom_Loc.add(this.spring_Obj);
        this.spring_Obj.position.z = this.baseDistance / 2;
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

        this.spring_Obj.scale.y = this.distance / this.baseDistance;        // Length
        this.spring_Obj.position.z = this.distance / this.baseDistance;     // Center Position
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