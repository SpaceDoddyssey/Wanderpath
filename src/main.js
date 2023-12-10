// Note: This file is mostly used to store globals
// Go to index.html for webpage stuff and MainScene.js for puzzle stuff

let UIspacerheight = 64;
let borderPadding = 32;
let sizePerUnit = 92;
let edgeWidth = 18;

let hasOneWayStreets = false; //Future feature
let num_solutions = 0;
let endNode1, endNode2

let rand;
let curSeed;

//Get references to the value fields
let widthField    = document.querySelector('#widthField')
let heightField   = document.querySelector('#heightField')
let lengthField   = document.querySelector('#lengthField')
let maxCrossField = document.querySelector('#maxCrossingField')

//Get the values
let gridWidth  = widthField.value
let gridHeight = heightField.value
let maxLength  = lengthField.value //Note: A bit of a misnomer, this WILL be the path length, not an upper bound
let maxCrosses = maxCrossField.value //Max times a node or edge can be crossed

function initRNG(){ 
    rand = Phaser.Math.RND;
    let stateInit = rand.state();
    rand.sow(stateInit + Date.now());   //First seed with the date to make sure we get a different seed every time
    curSeed = rand.integerInRange(0, Number.MAX_SAFE_INTEGER);
    rand.sow(curSeed.toString());
    let seedString = createSeedString();
    document.querySelector('#seedTextArea').value = seedString;
    console.log("Creating puzzle with seed: ", seedString);
}

function createSeedString() {
    return `${gridWidth}_${gridHeight}_${maxLength}_${maxCrosses}_${curSeed}`;
}

document.querySelector('#seedButton').addEventListener('click', () => {
    parseSeedString();
});

function parseSeedString() {
    const seedString = document.querySelector('#seedTextArea').value;
    console.log("Loading seed:", seedString);
    const seedStringRegex = /^\d+_\d+_\d+_\d+_\d+$/;
    if (!seedStringRegex.test(seedString)) {
        let errorMessage = document.querySelector("#HtmlErrorLabel");
        errorMessage.innerHTML = "<b>&nbspInvalid seed format!&nbsp"
        throw new Error('Invalid seed format');
    }
    
    let seed;
    [widthField.value, heightField.value, lengthField.value, maxCrossField.value, seed]
        = seedString.split('_')

    rand.sow(seed.toString());
    return(getCurParameters() != null);
}

function getCurParameters(){
    let [newGW, newGH, newML, newMC] = [widthField.value, heightField.value, lengthField.value, maxCrossField.value];

    //Check that the parameters are valid, display error message if necessary
    //The maximum path length is (width * height - 1) * maxCrossings
    let errorMessage = document.querySelector("#HtmlErrorLabel");

    if(newML > (newGW * newGH - 1) * newMC){ 
        errorMessage.innerHTML = "<b>&nbspInvalid settings!</b><br>&nbspPath Length must be at most&nbsp<br>&nbsp(Width * Height - 1) * Max Crosses&nbsp"
        return null;
    }

    if(newGW < widthRange[0] || newGW > widthRange[1]
    || newGH < heightRange[0] || newGH > heightRange[1]
    || newML < lengthRange[0] || newML > lengthRange[1]
    || newMC < maxCrossRange[0] || newMC > maxCrossRange[1]){
        errorMessage.innerHTML = "<b>&nbspInvalid settings!<br>Values out of range&nbsp"
        return null;
    }

    errorMessage.innerHTML = ""
    return [newGW, newGH, newML, newMC];
}

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

//Returns a point 90% of the way between coord1 and coord2
//Used only for one-way-streets right now
function percentBetween(coord1, coord2, proportion){
    const [x1, y1] = coord1;
    const [x2, y2] = coord2;
    
    const newX = x1 + proportion * (x2 - x1);
    const newY = y1 + proportion * (y2 - y1);
    
    return [newX, newY];
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
let recursionLimit = 30000;
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

//Debug flags
let edgeCrossDebug = false
let restraintDebug = false
let reachedGoalDebug = false
let recursiveDebugLevel = 0