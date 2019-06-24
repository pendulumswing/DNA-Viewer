/*
 * Import styles
 * They will be dynamically injected into the index.html file
 */

import '../assets/css/style.css';

/*
 * Do the WebGL check if desired
 */

import WebGL from './utils/webGL';

// if (!WebGL.isWebGLAvailable()) {
//     const node = document.getElementById("canvas");
//     node.appendChild(WebGL.getWebGLErrorMessage());
// }

/*
 * Render the application!
 */

import './main';
