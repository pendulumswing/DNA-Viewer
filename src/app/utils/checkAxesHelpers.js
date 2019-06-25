export default function checkAxesHelpers(val, springs, bases) {
    if(val) {
        springs.forEach((node) => {
            node.addAxesHelper();
        });

        bases.forEach((node) => {
            node.addAxesHelper();
        })
    } else {
        console.log("Turn off");
        springs.forEach((node) => {
            node.hideAxesHelper();
        });

        bases.forEach((node) => {
            node.hideAxesHelper();
        })
    }
}
