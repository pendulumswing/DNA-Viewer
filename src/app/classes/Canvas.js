

// CANVAS
export default class Canvas {
    constructor(canvasSelector, options={}) {

        // Default Values
        this.defaults = {
            aspect: 2,
        }

        // Combine Defaults with Options Parameter
        options = Object.assign({}, this.defaults, options); 

        this.aspect = options.aspect;
        this.canvas = document.querySelector(canvasSelector);

        if(this.canvas === null) {
            alert("Canvas is null");
        }

        this.parent = this.canvas.parentElement;
        this.style = getComputedStyle(this.parent); 
        this.num = parseFloat(this.style.width, 10);

        this.setAspect(options.aspect);
    }

    setAspect(aspect) {

        switch(aspect) {
            
            case 1:     // SQUARE ASPECT PROFILE
                {       
                    this.canvas.height = this.num;
                    this.canvas.width = this.num;
                    this.aspect = this.canvas.width / this.canvas.height;
                    // this.canvas.aspect = this.canvas / this.canvas.height;
                }
                break;

            case 1.5:   // 1.5 ASPECT PROFILE
                {   
                    this.canvas.height = this.num * .75;
                    this.canvas.width = this.num;
                    this.aspect = this.canvas.width / this.canvas.height;
                    // this.canvas.aspect = this.canvas / this.canvas.height;
                }
                break;

            case 0:     // WINDOW ASPECT PROFILE
                {   
                    this.canvas.height = window.innerHeight;
                    this.canvas.width = window.innerWidth;
                    this.aspect = this.canvas.width / this.canvas.height;
                    // this.canvas.aspect = this.canvas / this.canvas.height;
                }
                break;

            default:
                break;
        };   
    }

    getParentDim() {
        this.pHeight = this.parent.clientHeight;
        this.pWidth = this.parent.clientWidth;
        
        return {pWidth: this.pWidth, pHeight:this.pHeight};
    }
}

