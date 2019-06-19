
// SOURCE: https://stackoverflow.com/questions/32647215/declaring-static-constants-in-es6-classes

export default class Constants {

    static get BASE_DISTANCE_START() {
        return BASE_DISTANCE_START;
    }
    static get BOND_DISTANCE_START() {
        return BOND_DISTANCE_START;
    }
}

const BASE_DISTANCE_START = 1.1;
const BOND_DISTANCE_START = 2;
