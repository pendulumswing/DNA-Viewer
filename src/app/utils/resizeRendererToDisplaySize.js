/*
 * Responsive Display
 */

export default function resizeRendererToDisplaySize(renderer) {
    let rend = renderer.domElement;
    let width = rend.clientWidth;
    let height = rend.clientHeight;
    let needResize = rend.width !== width || rend.height !== height;
    if (needResize) {
        renderer.setSize(width, height, false);   
    }
    return needResize;
}