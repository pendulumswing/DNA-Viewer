/*********************************************************************************
DNA Bases - Creates a DNA Object
*********************************************************************************/

'use strict';

import * as THREE from 'three';
import Spring from './Spring.js';
import BasePair from './BasePair.js';
import Constants from '../constants/Constants.js';


export default class dnaObject {

    constructor(canvasID, guiID, options={}) {

        // Default Values
        const defaults = {
            aspect: 2,
            basesCount: 5,
        }

        // Combine Defaults with Options Parameter
        options = Object.assign({}, defaults, options);   

        // Parameters
        this.scene = options.scene;
        this.bases = [];
        this.baseObjects = [];
        this.baseCount = options.basesCount;
        this.springs = [];
        this.springGroupsCount = this.baseCount - 1;
        
        this.createBases(this.baseCount);     
        this.createSprings(this.baseCount);
    }

    createBases(numBases) {
        for(var i = 0; i < numBases; i++) {
                    
            this.bases[i] = new BasePair({scene: this.scene});                                     // Create new Bases
                    
            if(i === 0) {                                                   // Set Positions
                this.bases[i].setPosY(1);
            } else {
                this.bases[i].moveToPosRelativeToBaseAbove(this.bases[i - 1]);
            }
            
            this.bases[i].pushComponentsToList(this.baseObjects);                     // Push Components to baseObjects List
        }
    }

    createSprings(numBases) {
        for(var i = 0; i < this.baseCount - 1; i++) {
            
            // Create new Springs
            this.springGroup = [];
            this.springGroup[0] = new Spring({scene: this.scene, top: this.bases[i].phosLeft_Obj, bottom: this.bases[i+1].phosLeft_Obj});
            this.springGroup[1] = new Spring({scene: this.scene, top: this.bases[i].base_Obj, bottom: this.bases[i+1].base_Obj});
            this.springGroup[2] = new Spring({scene: this.scene, top: this.bases[i].phosRight_Obj, bottom: this.bases[i+1].phosRight_Obj});

            // Push Springs to Spring list
            this.springGroup.forEach(node => {
                this.springs.push(node);
            });
        }
    }

    updateSprings() {
        this.springs.forEach((node) => {             // Springs - Appearance
            node.update();
        })
                                                // Springs - Physics
        for(var i = 0; i < this.springGroupsCount; i++) {
            if(i !== this.springGroupsCount - 1) {             
                this.springs[i].springSimulate(this.bases[i], this.bases[i + 1]);
            } else {
                this.springs[i].springSimulate(this.bases[i], this.bases[i + 1], true);
            }
        }
    }
}

