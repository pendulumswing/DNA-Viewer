

'use strict';

import {dnaObject, Canvas, DNAObject, Base, Spring} from './dnaObject.js';
// import {Canvas} from './dnaObject.js';

function main() {
    
    let c = new Canvas('#c', 1);
    let canvas = c.canvas;
    let aspect = c.aspect;
    
    let renderer = new THREE.WebGLRenderer({canvas});

    // let val = dnaObject('#c', 1);   
    // console.log(c.canvas + ", " + c.aspect);
    let val = dnaObject(c, renderer);        
}

main();