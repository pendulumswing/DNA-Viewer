

'use strict';

import {dnaObject} from './dnaObject.js';
// import {Canvas} from './dnaObjectClasses';
// import {Canvas} from './dnaObject.js';

function main() {
    
    {
        let anim1 = dnaObject('#c1', '#gui1', 1.5, 5);     // ARGUMENTS: Canvas HTML Element, GUI HTML Element ID, Aspect Ratio, Number of Bases     
    }

    {
        let anim2 = dnaObject('#c2', '#gui2', 1.5, 10);     // ARGUMENTS: Canvas HTML Element, GUI HTML Element ID, Aspect Ratio, Number of Bases     
    }
}

main();