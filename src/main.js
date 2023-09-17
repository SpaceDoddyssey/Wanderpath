// Note: This file is mostly used to store globals
// Go to index.html for webpage stuff and MainScene.js for puzzle stuff

let UIspacerheight = 64;
let borderPadding = 32;
let sizePerUnit = 92;

let hasOneWayStreets = false; //Future feature
let num_solutions = 0;

let gridWidth  = document.getElementById('widthField').value
let gridHeight = document.getElementById('heightField').value
let maxLength  = document.getElementById('lengthField').value //Note: A bit of a misnomer, this WILL be the path length, not an upper bound
let maxCrosses = document.getElementById('maxCrossingField').value //Max times a node or edge can be crossed

let defaultDimensions = newDimensions(gridWidth, gridHeight)

let endNode1, endNode2

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
    let h = (newGridHeight * sizePerUnit) + borderPadding * 2 + UIspacerheight;
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

//Used to enforce minmax on the html fields 
function enforceMinMax(field){
    //First enforce minmax
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