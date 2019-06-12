/*********************************************************************************
Utility functions 
*********************************************************************************/
// var THREE = require('three'); 

'use strict';

export default class Utils {

    static distanceToObject(v1, v2)       // SOURCE: https://bit.ly/2KgqxYO
    {
        var dx = v1.x - v2.x;
        var dy = v1.y - v2.y;
        var dz = v1.z - v2.z;
    
        return Math.sqrt(dx * dx + dy * dy + dz * dz);
    }
    
    static rgbToHex (rgb) { 
        var hex = Number(rgb).toString(16);
        if (hex.length < 2) {
                hex = "0" + hex;
        }
        return hex;
    };
    
    static fullColorHex (r,g,b) {   
        var red = rgbToHex(r);
        var green = rgbToHex(g);
        var blue = rgbToHex(b);
        return "0x" + red+green+blue;
    };
    
    static degToRad(degrees) {
      var pi = Math.PI;
      return degrees * (pi/180);
    };
}

