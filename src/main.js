// Note: This file is mostly used to store globals
// Go to index.html for webpage stuff and MainScene.js for puzzle stuff

let UIspacerheight = 64;
let borderPadding = 32;
let sizePerUnit = 92;

let hasOneWayStreets = false; //Future feature
let num_solutions = 0;
let endNode1, endNode2

//Get references to the value fields
let widthField    = document.getElementById('widthField')
let heightField   = document.getElementById('heightField')
let lengthField   = document.getElementById('lengthField')
let maxCrossField = document.getElementById('maxCrossingField')

//Get the values
let gridWidth  = widthField.value
let gridHeight = heightField.value
let maxLength  = lengthField.value //Note: A bit of a misnomer, this WILL be the path length, not an upper bound
let maxCrosses = maxCrossField.value //Max times a node or edge can be crossed

let defaultDimensions = newDimensions(gridWidth, gridHeight)

let config = {
    type: Phaser.CANVAS,
    mode: Phaser.Scale.RESIZE,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: defaultDimensions[0],
    height: defaultDimensions[1],
    parent: "game",
    scene:[ MainScene ]
}

let textConfig = {
    fontFamily: 'Georgia',
    fontSize: '28px',
    color: '#00F6ED',
    align: 'right',
    padding: {
        top: 5,
        bottom: 5,
    },
    fixedWidth: 0
}

let restraintConfig = {
    fontFamily: 'Georgia',
    fontSize: '28px',
    color: '#ff0404',
    align: 'center'
}

function newDimensions(newGridWidth, newGridHeight) {
    let w = (newGridWidth * sizePerUnit) + borderPadding * 2;
    let h = (newGridHeight * sizePerUnit) + borderPadding * 2;
    return [w, h];
} 

let game = new Phaser.Game(config);

const Dirs = {
    Up: 0,
    Down: 1,
    Left: 2,
    Right: 3,
    Endpoint: 4
}
const InverseDirs = [Dirs.Down, Dirs.Up, Dirs.Right, Dirs.Left, Dirs.Endpoint]
const dirNames = ["north", "south", "west", "east"]

let keyUP, keyDOWN, keyLEFT, keyRIGHT, keyR;

let recursionCounter = 0;
let recursionLimit = 50000;
let recursionLimitReached = false;

//Used to enforce in-range values on the html number fields 
function enforceMinMax(field){
    if(field.value != ""){
        console.log("Minmax")
        if(parseInt(field.value) < parseInt(field.min)){
            field.value = field.min;
        } else if(parseInt(field.value) > parseInt(field.max)){
            field.value = field.max;
        }
    } else {
        field.value = field.min;
    }
}